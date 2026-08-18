from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.delivery import Delivery
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.route import Route
from app.models.route_stop import RouteStop
from app.models.warehouse import Warehouse

from app.optimization.constraint_engine import ConstraintEngine
from app.optimization.distance_matrix import DistanceMatrix
from app.optimization.route_solver import RouteSolver


class OptimizationService:

    @staticmethod
    def optimize(db: Session):

        try:

            # ==========================================================
            # 0. CLEAN PREVIOUS PLANNED OPTIMIZATION
            # ==========================================================
            #
            # IMPORTANT:
            #
            # Every time optimization is run, the old PLANNED routes
            # must be removed.
            #
            # Otherwise:
            #
            # Run 1 -> R-20 to R-24
            # Run 2 -> R-25 to R-29
            # Run 3 -> R-30 to R-34
            #
            # The Routes page then keeps growing.
            #
            # We ONLY remove PLANNED routes.
            #
            # IN_PROGRESS and COMPLETED routes are preserved.
            # ==========================================================

            print("\n========================================")
            print("     CLEANING PREVIOUS PLANNED ROUTES")
            print("========================================")

            old_planned_routes = (
                db.query(Route)
                .filter(
                    Route.status == "PLANNED"
                )
                .all()
            )

            print(
                f"Previous planned routes found: "
                f"{len(old_planned_routes)}"
            )

            old_route_ids = [
                route.id
                for route in old_planned_routes
            ]

            if old_route_ids:

                # ------------------------------------------------------
                # Find deliveries belonging to old planned routes
                # ------------------------------------------------------

                old_route_stops = (
                    db.query(RouteStop)
                    .filter(
                        RouteStop.route_id.in_(
                            old_route_ids
                        )
                    )
                    .all()
                )

                old_delivery_ids = list(
                    {
                        stop.delivery_id
                        for stop in old_route_stops
                    }
                )

                print(
                    f"Old planned route stops: "
                    f"{len(old_route_stops)}"
                )

                print(
                    f"Old assigned deliveries: "
                    f"{len(old_delivery_ids)}"
                )

                # ------------------------------------------------------
                # Reset deliveries
                # ------------------------------------------------------

                if old_delivery_ids:

                    old_deliveries = (
                        db.query(Delivery)
                        .filter(
                            Delivery.id.in_(
                                old_delivery_ids
                            )
                        )
                        .all()
                    )

                    for delivery in old_deliveries:

                        delivery.status = "PENDING"

                        delivery.assigned_driver_id = None

                        delivery.assigned_vehicle_id = None

                        delivery.route_order = None

                        delivery.estimated_arrival = None

                # ------------------------------------------------------
                # Delete old RouteStops FIRST
                # ------------------------------------------------------

                if old_route_ids:

                    (
                        db.query(RouteStop)
                        .filter(
                            RouteStop.route_id.in_(
                                old_route_ids
                            )
                        )
                        .delete(
                            synchronize_session=False
                        )
                    )

                # ------------------------------------------------------
                # Delete old Routes
                # ------------------------------------------------------

                (
                    db.query(Route)
                    .filter(
                        Route.id.in_(
                            old_route_ids
                        )
                    )
                    .delete(
                        synchronize_session=False
                    )
                )

                db.flush()

                print(
                    "Previous planned routes removed."
                )

            else:

                print(
                    "No previous planned routes to remove."
                )

            # ==========================================================
            # 1. FETCH PENDING DELIVERIES
            # ==========================================================

            deliveries_db = (
                db.query(Delivery)
                .filter(
                    Delivery.status == "PENDING"
                )
                .order_by(
                    Delivery.priority.desc(),
                    Delivery.id.asc()
                )
                .all()
            )

            # ==========================================================
            # 2. FETCH AVAILABLE VEHICLES
            # ==========================================================

            vehicles_db = (
                db.query(Vehicle)
                .filter(
                    Vehicle.status == "AVAILABLE"
                )
                .order_by(
                    Vehicle.id.asc()
                )
                .all()
            )

            # ==========================================================
            # 3. FETCH AVAILABLE DRIVERS
            # ==========================================================

            drivers_db = (
                db.query(Driver)
                .filter(
                    Driver.status == "AVAILABLE"
                )
                .order_by(
                    Driver.id.asc()
                )
                .all()
            )

            # ==========================================================
            # 4. FETCH WAREHOUSE
            # ==========================================================

            warehouse = (
                db.query(Warehouse)
                .first()
            )

            # ==========================================================
            # 5. VALIDATION
            # ==========================================================

            if warehouse is None:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No warehouse found in database."
                    ),
                }

            if not deliveries_db:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No pending deliveries found."
                    ),
                }

            if not vehicles_db:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No available vehicles found."
                    ),
                }

            if not drivers_db:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No available drivers found."
                    ),
                }

            # ==========================================================
            # 6. APPLY CONSTRAINT ENGINE
            # ==========================================================

            prepared_deliveries, vehicles, drivers = (
                ConstraintEngine.prepare_data(
                    deliveries_db,
                    vehicles_db,
                    drivers_db,
                )
            )

            # ----------------------------------------------------------
            # IMPORTANT:
            # The optimizer must use the REAL Delivery ORM records for
            # weights. The ConstraintEngine may return lightweight node
            # objects, and older versions of those nodes can lose the
            # database weight value. That causes the UI to show 0 kg and
            # makes capacity constraints meaningless.
            #
            # Keep only deliveries accepted by the constraint engine,
            # but use the original DB records for the actual optimization.
            # ----------------------------------------------------------
            prepared_delivery_ids = {
                int(
                    getattr(
                        delivery,
                        "id",
                        getattr(
                            delivery,
                            "delivery_id",
                            -1,
                        ),
                    )
                )
                for delivery in prepared_deliveries
                if getattr(
                    delivery,
                    "id",
                    getattr(
                        delivery,
                        "delivery_id",
                        None,
                    ),
                ) is not None
            }

            # If the constraint layer does not expose an ID, fall back to
            # the validated pending DB records rather than silently losing
            # deliveries.
            if prepared_delivery_ids:
                deliveries = [
                    delivery
                    for delivery in deliveries_db
                    if int(delivery.id)
                    in prepared_delivery_ids
                ]
            else:
                deliveries = list(deliveries_db)

            if not deliveries:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No valid pending deliveries available."
                    ),
                }

            if not vehicles:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No valid available vehicles available."
                    ),
                }

            if not drivers:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "No valid available drivers available."
                    ),
                }

            # ==========================================================
            # 7. MATCH VEHICLES AND DRIVERS
            # ==========================================================
            #
            # One route requires:
            #
            # Route
            #   ├── Vehicle
            #   └── Driver
            #
            # Therefore the number of possible routes is limited by
            # the smaller of available vehicles and drivers.
            # ==========================================================

            resource_count = min(
                len(vehicles),
                len(drivers),
            )

            vehicles = vehicles[:resource_count]

            drivers = drivers[:resource_count]

            # ==========================================================
            # 8. PRINT RESOURCE INFORMATION
            # ==========================================================

            print("\n========================================")
            print("        OPTIMIZATION RESOURCES")
            print("========================================")

            print(
                f"Pending deliveries : {len(deliveries)}"
            )

            print(
                f"Available vehicles : {len(vehicles)}"
            )

            print(
                f"Available drivers  : {len(drivers)}"
            )

            print("\nVEHICLES:")

            for vehicle in vehicles:

                print(
                    f"  {vehicle.vehicle_number} | "
                    f"Capacity: "
                    f"{vehicle.capacity_weight} kg"
                )

            print("\nDRIVERS:")

            for driver in drivers:

                print(
                    f"  {driver.id} | "
                    f"{driver.name}"
                )

            # ==========================================================
            # 9. BUILD COORDINATES
            # ==========================================================
            #
            # Node 0 = Warehouse
            #
            # Node 1 = Delivery 1
            # Node 2 = Delivery 2
            # etc.
            # ==========================================================

            coordinates = [
                (
                    warehouse.latitude,
                    warehouse.longitude,
                )
            ]

            for delivery in deliveries:

                coordinates.append(
                    (
                        delivery.latitude,
                        delivery.longitude,
                    )
                )

            print("\n========================================")
            print("              COORDINATES")
            print("========================================")

            for index, coordinate in enumerate(
                coordinates
            ):

                print(
                    f"{index}: {coordinate}"
                )

            # ==========================================================
            # 10. BUILD ROAD DISTANCE MATRIX
            # ==========================================================
            #
            # This matrix is retained for physical route distance
            # calculations and the total_distance_km stored in Route.
            # ==========================================================

            matrix = DistanceMatrix.build_matrix(
                coordinates
            )

            if not matrix:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "Unable to build distance matrix."
                    ),
                }

            print("\n========================================")
            print("           DISTANCE MATRIX")
            print("========================================")

            for row in matrix:

                print(row)

            # ==========================================================
            # 11. BUILD TRAFFIC-AWARE TRAVEL-TIME MATRIX
            # ==========================================================
            #
            # Google Routes API returns traffic-aware travel duration.
            # This matrix is used ONLY as the OR-Tools optimization
            # cost. The distance matrix above remains the source for
            # route distance.
            #
            # The DistanceMatrix service contains a safe fallback, so
            # if the Google API key is missing or the API fails, the
            # optimizer can still run using estimated travel times.
            # ==========================================================

            print("\n========================================")
            print("       TRAFFIC-AWARE TRAVEL TIME")
            print("========================================")

            traffic_time_matrix = (
                DistanceMatrix.build_traffic_time_matrix(
                    coordinates
                )
            )

            if not traffic_time_matrix:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "Unable to build traffic-time matrix."
                    ),
                }

            print(
                "\nTraffic-aware travel-time matrix:"
            )

            for row in traffic_time_matrix:

                print(row)

            # ==========================================================
            # 12. DETERMINE DISTANCE UNIT
            # ==========================================================

            maximum_distance = 0

            for row in matrix:

                for value in row:

                    try:

                        maximum_distance = max(
                            maximum_distance,
                            float(value),
                        )

                    except (
                        TypeError,
                        ValueError,
                    ):

                        pass

            distance_is_meters = (
                maximum_distance > 1000
            )

            if distance_is_meters:

                print(
                    "\nDistance matrix detected "
                    "as METERS."
                )

            else:

                print(
                    "\nDistance matrix detected "
                    "as KILOMETERS."
                )

            # ==========================================================
            # 13. SOLVE ROUTES USING TRAFFIC-AWARE TRAVEL TIME
            # ==========================================================
            #
            # distance_matrix:
            #     Used later to calculate physical route distance.
            #
            # traffic_time_matrix:
            #     Used by OR-Tools as the optimization cost.
            #
            # This means the optimizer prefers routes with lower
            # current travel time, not simply shorter straight-line
            # distance.
            # ==========================================================

            routes = RouteSolver.solve(
                distance_matrix=matrix,
                cost_matrix=traffic_time_matrix,
                deliveries=deliveries,
                vehicles=vehicles,
            )

            if routes is None:

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "Route solver failed. "
                        "No feasible route could be created "
                        "with the available vehicle capacities."
                    ),
                }

            # ==========================================================
            # 14. VALIDATE SOLVER OUTPUT
            # ==========================================================
            #
            # This is an important safety check.
            #
            # Every delivery should occur at most once across the
            # complete optimization result.
            # ==========================================================

            assigned_delivery_indexes = set()

            duplicate_delivery_indexes = set()

            for route in routes:

                for node in route:

                    if node == 0:
                        continue

                    delivery_index = node - 1

                    if not (
                        0 <= delivery_index
                        < len(deliveries)
                    ):
                        continue

                    if (
                        delivery_index
                        in assigned_delivery_indexes
                    ):

                        duplicate_delivery_indexes.add(
                            delivery_index
                        )

                    assigned_delivery_indexes.add(
                        delivery_index
                    )

            if duplicate_delivery_indexes:

                print(
                    "\nWARNING:"
                )

                print(
                    "Duplicate delivery indexes "
                    "detected from solver:"
                )

                print(
                    duplicate_delivery_indexes
                )

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "Optimization produced duplicate "
                        "delivery assignments. "
                        "No routes were saved."
                    ),
                }

            # ==========================================================
            # 15. CHECK FOR UNASSIGNED DELIVERIES
            # ==========================================================

            unassigned_delivery_indexes = []

            for index in range(
                len(deliveries)
            ):

                if (
                    index
                    not in assigned_delivery_indexes
                ):

                    unassigned_delivery_indexes.append(
                        index
                    )

            if unassigned_delivery_indexes:

                print(
                    "\nWARNING:"
                )

                print(
                    "Unassigned deliveries:"
                )

                print(
                    unassigned_delivery_indexes
                )

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "Optimization could not assign "
                        "all pending deliveries."
                    ),
                }

            # ==========================================================
            # 16. PRINT OPTIMIZED ROUTES
            # ==========================================================

            print("\n========================================")
            print("          OPTIMIZED ROUTES")
            print("========================================")

            for vehicle_index, route in enumerate(
                routes
            ):

                if not route:
                    continue

                if vehicle_index >= len(
                    vehicles
                ):
                    continue

                vehicle = vehicles[
                    vehicle_index
                ]

                assigned_weight = 0

                route_delivery_ids = []

                for node in route:

                    if node == 0:
                        continue

                    delivery_index = node - 1

                    if (
                        0 <= delivery_index
                        < len(deliveries)
                    ):

                        delivery = deliveries[
                            delivery_index
                        ]

                        assigned_weight += (
                            delivery.weight
                        )

                        route_delivery_ids.append(
                            delivery.id
                        )

                print(
                    f"Vehicle: "
                    f"{vehicle.vehicle_number} | "
                    f"Capacity: "
                    f"{vehicle.capacity_weight} kg | "
                    f"Assigned: "
                    f"{assigned_weight} kg | "
                    f"Deliveries: "
                    f"{route_delivery_ids} | "
                    f"Route: {route}"
                )

            # ==========================================================
            # 17. SAVE ROUTES
            # ==========================================================

            saved_routes = []

            total_assigned_deliveries = 0

            total_distance_km = 0

            route_start_time = datetime.utcnow()

            for vehicle_index, route in enumerate(
                routes
            ):

                # ------------------------------------------------------
                # Ignore unused vehicles.
                #
                # Example:
                #
                # [0, 0]
                #
                # ------------------------------------------------------

                if len(route) <= 2:
                    continue

                if vehicle_index >= len(
                    vehicles
                ):
                    continue

                if vehicle_index >= len(
                    drivers
                ):
                    continue

                vehicle = vehicles[
                    vehicle_index
                ]

                driver = drivers[
                    vehicle_index
                ]

                # ------------------------------------------------------
                # Calculate route distance
                # ------------------------------------------------------

                route_distance_raw = 0

                for i in range(
                    len(route) - 1
                ):

                    from_node = route[i]

                    to_node = route[i + 1]

                    try:

                        route_distance_raw += float(
                            matrix[
                                from_node
                            ][
                                to_node
                            ]
                        )

                    except (
                        IndexError,
                        TypeError,
                        ValueError,
                    ):

                        continue

                # ------------------------------------------------------
                # Convert to KM
                # ------------------------------------------------------

                if distance_is_meters:

                    route_distance_km = (
                        route_distance_raw / 1000
                    )

                else:

                    route_distance_km = (
                        route_distance_raw
                    )

                route_distance_km = round(
                    route_distance_km,
                    2,
                )

                # ------------------------------------------------------
                # Traffic-aware travel duration
                # ------------------------------------------------------
                #
                # Use the same traffic-aware matrix that OR-Tools used
                # for optimization. This keeps the saved ETA consistent
                # with the optimized route.
                # ------------------------------------------------------

                travel_seconds = 0.0

                for i in range(
                    len(route) - 1
                ):

                    from_node = route[i]

                    to_node = route[i + 1]

                    try:

                        travel_seconds += float(
                            traffic_time_matrix[
                                from_node
                            ][
                                to_node
                            ]
                        )

                    except (
                        IndexError,
                        TypeError,
                        ValueError
                    ):

                        continue

                travel_minutes = (
                    travel_seconds / 60
                )

                # ------------------------------------------------------
                # Service time
                # ------------------------------------------------------

                delivery_stop_count = (
                    len(route) - 2
                )

                service_minutes = (
                    delivery_stop_count * 5
                )

                estimated_duration_minutes = round(
                    travel_minutes
                    + service_minutes
                )

                # ------------------------------------------------------
                # Create Route
                # ------------------------------------------------------

                db_route = Route(

                    vehicle_id=vehicle.id,

                    driver_id=driver.id,

                    warehouse_id=warehouse.id,

                    status="PLANNED",

                    total_distance_km=(
                        route_distance_km
                    ),

                    estimated_duration_minutes=(
                        estimated_duration_minutes
                    ),

                    route_date=(
                        datetime.utcnow()
                    ),

                    created_at=(
                        datetime.utcnow()
                    ),

                    updated_at=(
                        datetime.utcnow()
                    ),
                )

                db.add(db_route)

                db.flush()

                # ------------------------------------------------------
                # Create Route Stops
                # ------------------------------------------------------

                order = 1

                previous_node = 0

                elapsed_minutes = 0

                route_start = route_start_time

                assigned_weight = 0

                route_delivery_ids = set()

                for node in route:

                    # --------------------------------------------------
                    # Skip warehouse
                    # --------------------------------------------------

                    if node == 0:
                        continue

                    delivery_index = node - 1

                    if not (
                        0 <= delivery_index
                        < len(deliveries)
                    ):
                        continue

                    delivery = deliveries[
                        delivery_index
                    ]

                    # --------------------------------------------------
                    # EXTRA SAFETY:
                    # Never save the same delivery twice in one route.
                    # --------------------------------------------------

                    if delivery.id in route_delivery_ids:

                        print(
                            f"Skipping duplicate delivery "
                            f"{delivery.id} in route "
                            f"R-{db_route.id}"
                        )

                        continue

                    route_delivery_ids.add(
                        delivery.id
                    )

                    # --------------------------------------------------
                    # Calculate segment distance
                    # --------------------------------------------------

                    try:

                        segment_distance = float(
                            matrix[
                                previous_node
                            ][
                                node
                            ]
                        )

                    except (
                        IndexError,
                        TypeError,
                        ValueError,
                    ):

                        segment_distance = 0

                    if distance_is_meters:

                        segment_distance_km = (
                            segment_distance / 1000
                        )

                    else:

                        segment_distance_km = (
                            segment_distance
                        )

                    # --------------------------------------------------
                    # Calculate traffic-aware travel time
                    # --------------------------------------------------
                    # V2 uses the Google traffic-aware travel-time matrix
                    # for ETA calculations as well as route optimization.
                    # This replaces the old average-speed calculation.

                    try:
                        segment_travel_seconds = float(
                            traffic_time_matrix[
                                previous_node
                            ][
                                node
                            ]
                        )
                    except (
                        IndexError,
                        TypeError,
                        ValueError,
                    ):
                        segment_travel_seconds = 0

                    segment_minutes = (
                        segment_travel_seconds / 60
                    )

                    elapsed_minutes += (
                        segment_minutes
                    )

                    planned_arrival = (
                        route_start
                        + timedelta(
                            minutes=elapsed_minutes
                        )
                    )

                    planned_departure = (
                        planned_arrival
                        + timedelta(
                            minutes=5
                        )
                    )

                    elapsed_minutes += 5

                    # --------------------------------------------------
                    # Create RouteStop
                    # --------------------------------------------------

                    stop = RouteStop(

                        route_id=db_route.id,

                        delivery_id=delivery.id,

                        stop_order=order,

                        planned_arrival_time=(
                            planned_arrival
                        ),

                        planned_departure_time=(
                            planned_departure
                        ),

                        actual_arrival_time=None,

                        actual_departure_time=None,

                        created_at=(
                            datetime.utcnow()
                        ),

                        updated_at=(
                            datetime.utcnow()
                        ),
                    )

                    db.add(stop)

                    # --------------------------------------------------
                    # Assign Delivery
                    # --------------------------------------------------

                    delivery.status = "ASSIGNED"

                    delivery.assigned_driver_id = (
                        driver.id
                    )

                    delivery.assigned_vehicle_id = (
                        vehicle.id
                    )

                    delivery.route_order = (
                        order
                    )

                    delivery.estimated_arrival = (
                        planned_arrival
                    )

                    assigned_weight += (
                        delivery.weight
                    )

                    total_assigned_deliveries += 1

                    order += 1

                    previous_node = node

                # ------------------------------------------------------
                # Save route
                # ------------------------------------------------------

                saved_routes.append(
                    db_route
                )

                total_distance_km += (
                    route_distance_km
                )

                print(
                    "\n----------------------------------------"
                )

                print(
                    f"Route ID      : R-{db_route.id}"
                )

                print(
                    f"Driver        : {driver.name}"
                )

                print(
                    f"Vehicle       : "
                    f"{vehicle.vehicle_number}"
                )

                print(
                    f"Capacity      : "
                    f"{vehicle.capacity_weight} kg"
                )

                print(
                    f"Assigned Load : "
                    f"{assigned_weight} kg"
                )

                print(
                    f"Remaining     : "
                    f"{vehicle.capacity_weight - assigned_weight} kg"
                )

                print(
                    f"Distance      : "
                    f"{route_distance_km} km"
                )

                print(
                    f"ETA           : "
                    f"{estimated_duration_minutes} min"
                )

                print(
                    f"Stops         : "
                    f"{order - 1}"
                )

                print(
                    f"Node Route    : "
                    f"{route}"
                )

            # ==========================================================
            # 18. FINAL SAFETY CHECK
            # ==========================================================

            if total_assigned_deliveries != len(
                deliveries
            ):

                print(
                    "\nERROR:"
                )

                print(
                    f"Expected deliveries: "
                    f"{len(deliveries)}"
                )

                print(
                    f"Actually assigned: "
                    f"{total_assigned_deliveries}"
                )

                db.rollback()

                return {
                    "success": False,
                    "message": (
                        "Optimization was cancelled because "
                        "not all deliveries were assigned."
                    ),
                }

            # ==========================================================
            # 19. COMMIT DATABASE
            # ==========================================================

            db.commit()

            # ==========================================================
            # 20. FINAL RESPONSE
            # ==========================================================

            return {

                "success": True,

                "message": (
                    "Optimization completed successfully."
                ),

                "routes_created": len(
                    saved_routes
                ),

                "deliveries_assigned": (
                    total_assigned_deliveries
                ),

                "total_distance_km": round(
                    total_distance_km,
                    2,
                ),

                "warehouse_id": (
                    warehouse.id
                ),
            }

        except Exception as error:

            # ==========================================================
            # ROLLBACK EVERYTHING IF ANYTHING FAILS
            # ==========================================================

            db.rollback()

            print("\n========================================")
            print("       OPTIMIZATION ERROR")
            print("========================================")

            print(
                f"{type(error).__name__}: "
                f"{error}"
            )

            import traceback

            traceback.print_exc()

            return {
                "success": False,
                "message": (
                    f"Optimization failed: "
                    f"{str(error)}"
                ),
            }