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

        # =====================================================
        # 1. GET PENDING DELIVERIES
        # =====================================================

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

        if not deliveries_db:
            return {
                "success": False,
                "message": "No pending deliveries found."
            }

        # =====================================================
        # 2. GET AVAILABLE VEHICLES
        # =====================================================

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

        if not vehicles_db:
            return {
                "success": False,
                "message": "No available vehicles found."
            }

        # =====================================================
        # 3. GET AVAILABLE DRIVERS
        # =====================================================

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

        if not drivers_db:
            return {
                "success": False,
                "message": "No available drivers found."
            }

        # =====================================================
        # 4. FIND WAREHOUSE
        # =====================================================

        warehouse = (
            db.query(Warehouse)
            .first()
        )

        if warehouse is None:
            return {
                "success": False,
                "message": "No warehouse found in database."
            }

        # =====================================================
        # 5. PREPARE DATA
        # =====================================================

        deliveries, vehicles, drivers = (
            ConstraintEngine.prepare_data(
                deliveries_db,
                vehicles_db,
                drivers_db
            )
        )

        if not deliveries:
            return {
                "success": False,
                "message": "No valid pending deliveries found."
            }

        if not vehicles:
            return {
                "success": False,
                "message": "No valid vehicles available."
            }

        if not drivers:
            return {
                "success": False,
                "message": "No valid drivers available."
            }

        # We can only create as many routes as we have
        # driver + vehicle combinations.

        resource_count = min(
            len(vehicles),
            len(drivers)
        )

        if resource_count == 0:
            return {
                "success": False,
                "message": "No driver and vehicle combinations available."
            }

        vehicles = vehicles[:resource_count]
        drivers = drivers[:resource_count]

        # =====================================================
        # 6. CHECK TOTAL CAPACITY
        # =====================================================

        total_delivery_weight = sum(
            float(delivery.weight or 0)
            for delivery in deliveries
        )

        total_vehicle_capacity = sum(
            float(vehicle.capacity_weight or 0)
            for vehicle in vehicles
        )

        if total_delivery_weight > total_vehicle_capacity:

            return {
                "success": False,
                "message": (
                    f"Insufficient vehicle capacity. "
                    f"Delivery weight = "
                    f"{total_delivery_weight:.2f} kg, "
                    f"available capacity = "
                    f"{total_vehicle_capacity:.2f} kg."
                ),
                "total_delivery_weight": total_delivery_weight,
                "total_vehicle_capacity": total_vehicle_capacity
            }

        # =====================================================
        # 7. CHECK INDIVIDUAL DELIVERY CAPACITY
        # =====================================================

        largest_vehicle_capacity = max(
            float(vehicle.capacity_weight or 0)
            for vehicle in vehicles
        )

        oversized_deliveries = [
            delivery
            for delivery in deliveries
            if float(delivery.weight or 0)
            > largest_vehicle_capacity
        ]

        if oversized_deliveries:

            names = ", ".join(
                delivery.customer_name
                for delivery in oversized_deliveries
            )

            return {
                "success": False,
                "message": (
                    "Some deliveries are too heavy for "
                    "every available vehicle."
                ),
                "deliveries": names,
                "largest_vehicle_capacity": (
                    largest_vehicle_capacity
                )
            }

        # =====================================================
        # 8. BUILD COORDINATE LIST
        #
        # Node 0 = warehouse
        # Node 1+ = deliveries
        # =====================================================

        coordinates = [
            (
                warehouse.latitude,
                warehouse.longitude
            )
        ]

        for delivery in deliveries:

            coordinates.append(
                (
                    delivery.latitude,
                    delivery.longitude
                )
            )

        # =====================================================
        # 9. BUILD DISTANCE MATRIX
        # =====================================================

        matrix = DistanceMatrix.build_matrix(
            coordinates
        )

        if not matrix:
            return {
                "success": False,
                "message": "Unable to build distance matrix."
            }

        # =====================================================
        # 10. EXTRACT CAPACITIES AND WEIGHTS
        # =====================================================

        vehicle_capacities = [
            float(
                vehicle.capacity_weight or 0
            )
            for vehicle in vehicles
        ]

        delivery_weights = [
            float(
                delivery.weight or 0
            )
            for delivery in deliveries
        ]

        # =====================================================
        # 11. RUN CAPACITY-AWARE ROUTE SOLVER
        # =====================================================

        routes = RouteSolver.solve(
            distance_matrix=matrix,
            vehicle_capacities=vehicle_capacities,
            delivery_weights=delivery_weights,
            depot=0
        )

        if routes is None:

            return {
                "success": False,
                "message": (
                    "Unable to create feasible routes "
                    "with the available vehicle capacities."
                )
            }

        # =====================================================
        # 12. SAVE ROUTES
        # =====================================================

        saved_routes = []

        total_assigned = 0

        now = datetime.utcnow()

        for vehicle_index, route_nodes in enumerate(routes):

            # Ignore unused vehicle
            #
            # Example:
            # [0, 0]
            #
            # means this vehicle has no deliveries.

            delivery_nodes = [
                node
                for node in route_nodes
                if node != 0
            ]

            if not delivery_nodes:
                continue

            if vehicle_index >= len(vehicles):
                continue

            if vehicle_index >= len(drivers):
                continue

            vehicle = vehicles[vehicle_index]
            driver = drivers[vehicle_index]

            # =================================================
            # Calculate route distance
            # =================================================

            # =================================================
# Calculate route distance
#
# DistanceMatrix returns METERS.
# Convert to KILOMETERS for the database/UI.
# =================================================

            total_distance_meters = 0

            for i in range(
                len(route_nodes) - 1
            ):

                from_node = route_nodes[i]
                to_node = route_nodes[i + 1]

                total_distance_meters += float(
                    matrix[from_node][to_node]
                )

            total_distance = (
                total_distance_meters / 1000
            )

            # =================================================
            # Estimate travel time
            #
            # Assumption:
            # average speed = 30 km/h
            # =================================================

            travel_minutes = (
                total_distance / 30
            ) * 60

            stop_service_minutes = (
                len(delivery_nodes) * 5
            )

            estimated_minutes = int(
                round(
                    travel_minutes
                    + stop_service_minutes
                )
            )

            # =================================================
            # Create Route
            #
            # IMPORTANT:
            # Driver and vehicle remain ASSIGNED,
            # NOT ON_ROUTE.
            #
            # They become ON_ROUTE only when
            # the route is started.
            # =================================================

            db_route = Route(
                vehicle_id=vehicle.id,
                driver_id=driver.id,
                warehouse_id=warehouse.id,
                status="PLANNED",
                total_distance_km=round(
                    total_distance,
                    2
                ),
                estimated_duration_minutes=(
                    estimated_minutes
                ),
                route_date=now,
                created_at=now,
                updated_at=now
            )

            db.add(db_route)
            db.flush()

            # =================================================
            # Reserve driver + vehicle
            #
            # This prevents the next optimization run
            # from using the same resources again.
            # =================================================

            driver_db = (
                db.query(Driver)
                .filter(
                    Driver.id == driver.id
                )
                .first()
            )

            vehicle_db = (
                db.query(Vehicle)
                .filter(
                    Vehicle.id == vehicle.id
                )
                .first()
            )

            if driver_db:
                driver_db.status = "ASSIGNED"

            if vehicle_db:
                vehicle_db.status = "ASSIGNED"

            # =================================================
            # Create route stops
            # =================================================

            stop_order = 1
            cumulative_distance_meters = 0

            for i, node in enumerate(
                delivery_nodes
            ):

                delivery = deliveries[
                    node - 1
                ]

                # ---------------------------------------------
                # Distance travelled to this stop
                # ---------------------------------------------

                previous_node = (
                    route_nodes[
                        route_nodes.index(node) - 1
                    ]
                    if route_nodes.index(node) > 0
                    else 0
                )

                cumulative_distance_meters += float(
                    matrix[
                        previous_node
                    ][node]
                )

                cumulative_distance = (
                    cumulative_distance_meters / 1000
                )

                # ---------------------------------------------
                # Estimated arrival
                # ---------------------------------------------

                travel_to_stop_minutes = (
                    cumulative_distance / 30
                ) * 60

                planned_arrival = (
                    now
                    + timedelta(
                        minutes=int(
                            round(
                                travel_to_stop_minutes
                                + (
                                    (stop_order - 1)
                                    * 5
                                )
                            )
                        )
                    )
                )

                planned_departure = (
                    planned_arrival
                    + timedelta(minutes=5)
                )

                # ---------------------------------------------
                # Create RouteStop
                # ---------------------------------------------

                stop = RouteStop(
                    route_id=db_route.id,
                    delivery_id=delivery.id,
                    stop_order=stop_order,
                    planned_arrival_time=(
                        planned_arrival
                    ),
                    planned_departure_time=(
                        planned_departure
                    ),
                    actual_arrival_time=None,
                    actual_departure_time=None,
                    created_at=now,
                    updated_at=now
                )

                db.add(stop)

                # ---------------------------------------------
                # Assign delivery
                # ---------------------------------------------

                delivery_db = (
                    db.query(Delivery)
                    .filter(
                        Delivery.id == delivery.id
                    )
                    .first()
                )

                if delivery_db:

                    delivery_db.status = "ASSIGNED"

                    delivery_db.assigned_driver_id = (
                        driver.id
                    )

                    delivery_db.assigned_vehicle_id = (
                        vehicle.id
                    )

                    delivery_db.route_order = (
                        stop_order
                    )

                    delivery_db.estimated_arrival = (
                        planned_arrival
                    )

                stop_order += 1
                total_assigned += 1

            saved_routes.append(
                db_route
            )

        # =====================================================
        # 13. SAVE EVERYTHING
        # =====================================================

        db.commit()

        # =====================================================
        # 14. RESPONSE
        # =====================================================

        return {
            "success": True,
            "message": (
                "Optimization completed successfully."
            ),
            "routes_created": len(
                saved_routes
            ),
            "deliveries_assigned": (
                total_assigned
            ),
            "drivers_assigned": len(
                saved_routes
            ),
            "vehicles_assigned": len(
                saved_routes
            ),
            "total_delivery_weight": round(
                total_delivery_weight,
                2
            ),
            "total_vehicle_capacity": round(
                total_vehicle_capacity,
                2
            ),
            "warehouse_id": warehouse.id
        }