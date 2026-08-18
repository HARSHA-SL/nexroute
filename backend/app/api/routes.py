from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.optimization.distance_matrix import DistanceMatrix

from app.db.session import get_db

from app.models.route import Route
from app.models.route_stop import RouteStop
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.delivery import Delivery
from app.models.warehouse import Warehouse


router = APIRouter(
    prefix="/routes",
    tags=["Routes"]
)


# ============================================================
# GET ALL ROUTES
# ============================================================

@router.get("/")
def get_all_routes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: str | None = None,
    sort: str = "id",
    db: Session = Depends(get_db)
):

    query = db.query(Route)

    if status:
        query = query.filter(
            Route.status == status
        )

    if sort == "date":
        query = query.order_by(
            Route.route_date.desc()
        )

    elif sort == "distance":
        query = query.order_by(
            Route.total_distance_km.desc()
        )

    else:
        query = query.order_by(
            Route.id.desc()
        )

    total = query.count()

    routes = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    response = []

    for route in routes:

        driver = (
            db.query(Driver)
            .filter(
                Driver.id == route.driver_id
            )
            .first()
        )

        vehicle = (
            db.query(Vehicle)
            .filter(
                Vehicle.id == route.vehicle_id
            )
            .first()
        )

        warehouse = (
            db.query(Warehouse)
            .filter(
                Warehouse.id == route.warehouse_id
            )
            .first()
        )

        stops = (
            db.query(RouteStop)
            .filter(
                RouteStop.route_id == route.id
            )
            .order_by(
                RouteStop.stop_order
            )
            .all()
        )

        stop_list = []

        total_weight = 0

        for stop in stops:

            delivery = (
                db.query(Delivery)
                .filter(
                    Delivery.id == stop.delivery_id
                )
                .first()
            )

            if delivery is None:
                continue

            total_weight += delivery.weight or 0

            stop_list.append({
                "stop_id": stop.id,
                "stop_order": stop.stop_order,

                "delivery_id": delivery.id,

                "customer_name":
                    delivery.customer_name,

                "address":
                    delivery.address,

                "latitude":
                    delivery.latitude,

                "longitude":
                    delivery.longitude,

                "weight":
                    delivery.weight,

                "priority":
                    delivery.priority,

                "status":
                    delivery.status,

                "planned_arrival_time":
                    stop.planned_arrival_time,

                "planned_departure_time":
                    stop.planned_departure_time,

                "actual_arrival_time":
                    stop.actual_arrival_time,

                "actual_departure_time":
                    stop.actual_departure_time
            })

        capacity = (
            vehicle.capacity_weight
            if vehicle
            else 0
        )

        utilization = 0

        if capacity and capacity > 0:
            utilization = round(
                (total_weight / capacity) * 100,
                1
            )

        response.append({

            "route_id":
                route.id,

            "status":
                route.status,

            "route_date":
                route.route_date,

            "driver": {
                "id": driver.id,
                "name": driver.name,
                "phone": driver.phone
            } if driver else None,

            "vehicle": {
                "id": vehicle.id,
                "vehicle_number":
                    vehicle.vehicle_number,
                "vehicle_type":
                    vehicle.vehicle_type,
                "capacity_weight":
                    vehicle.capacity_weight
            } if vehicle else None,

            "warehouse": {
                "id": warehouse.id,
                "name": warehouse.name,
                "address": warehouse.address,
                "latitude":
                    warehouse.latitude,
                "longitude":
                    warehouse.longitude
            } if warehouse else None,

            "total_distance_km":
                route.total_distance_km,

            "estimated_duration_minutes":
                route.estimated_duration_minutes,

            "total_weight_kg":
                round(total_weight, 2),

            "remaining_capacity_kg":
                round(
                    max(
                        0,
                        capacity - total_weight
                    ),
                    2
                ),

            "capacity_utilization":
                utilization,

            "stops":
                stop_list
        })

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total,

        "total_pages":
            (total + limit - 1) // limit,

        "routes":
            response
    }


# ============================================================
# GET ROUTES FOR DRIVER
# ============================================================

@router.get("/driver/{driver_id}")
def get_driver_routes(
    driver_id: int,
    db: Session = Depends(get_db)
):

    routes = (
        db.query(Route)
        .filter(
            Route.driver_id == driver_id
        )
        .order_by(
            Route.route_date.desc()
        )
        .all()
    )

    response = []

    for route in routes:

        vehicle = (
            db.query(Vehicle)
            .filter(
                Vehicle.id == route.vehicle_id
            )
            .first()
        )

        warehouse = (
            db.query(Warehouse)
            .filter(
                Warehouse.id == route.warehouse_id
            )
            .first()
        )

        stops = (
            db.query(RouteStop)
            .filter(
                RouteStop.route_id == route.id
            )
            .order_by(
                RouteStop.stop_order
            )
            .all()
        )

        deliveries = []

        total_weight = 0

        for stop in stops:

            delivery = (
                db.query(Delivery)
                .filter(
                    Delivery.id == stop.delivery_id
                )
                .first()
            )

            if delivery is None:
                continue

            total_weight += (
                delivery.weight or 0
            )

            deliveries.append({

                "stop_order":
                    stop.stop_order,

                "delivery_id":
                    delivery.id,

                "customer_name":
                    delivery.customer_name,

                "address":
                    delivery.address,

                "latitude":
                    delivery.latitude,

                "longitude":
                    delivery.longitude,

                "weight":
                    delivery.weight,

                "priority":
                    delivery.priority,

                "status":
                    delivery.status,

                "planned_arrival_time":
                    stop.planned_arrival_time,

                "planned_departure_time":
                    stop.planned_departure_time
            })

        capacity = (
            vehicle.capacity_weight
            if vehicle
            else 0
        )

        response.append({

            "route_id":
                route.id,

            "status":
                route.status,

            "route_date":
                route.route_date,

            "vehicle": {

                "vehicle_number":
                    vehicle.vehicle_number,

                "vehicle_type":
                    vehicle.vehicle_type,

                "capacity_weight":
                    vehicle.capacity_weight

            } if vehicle else None,

            "warehouse": {

                "name":
                    warehouse.name,

                "address":
                    warehouse.address,

                "latitude":
                    warehouse.latitude,

                "longitude":
                    warehouse.longitude

            } if warehouse else None,

            "total_weight_kg":
                total_weight,

            "remaining_capacity_kg":
                max(
                    0,
                    capacity - total_weight
                ),

            "deliveries":
                deliveries
        })

    return {

        "success": True,

        "driver_id":
            driver_id,

        "total_routes":
            len(response),

        "routes":
            response
    }


# ============================================================
# GET SINGLE ROUTE
# ============================================================

@router.get("/{route_id}")
def get_route(
    route_id: int,
    db: Session = Depends(get_db)
):

    route = (
        db.query(Route)
        .filter(
            Route.id == route_id
        )
        .first()
    )

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found."
        )

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == route.driver_id
        )
        .first()
    )

    vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.id == route.vehicle_id
        )
        .first()
    )

    warehouse = (
        db.query(Warehouse)
        .filter(
            Warehouse.id == route.warehouse_id
        )
        .first()
    )

    stops = (
        db.query(RouteStop)
        .filter(
            RouteStop.route_id == route.id
        )
        .order_by(
            RouteStop.stop_order
        )
        .all()
    )

    stop_list = []

    total_weight = 0

    for stop in stops:

        delivery = (
            db.query(Delivery)
            .filter(
                Delivery.id == stop.delivery_id
            )
            .first()
        )

        if delivery is None:
            continue

        total_weight += (
            delivery.weight or 0
        )

        stop_list.append({

            "stop_id":
                stop.id,

            "stop_order":
                stop.stop_order,

            "delivery_id":
                delivery.id,

            "customer_name":
                delivery.customer_name,

            "address":
                delivery.address,

            "latitude":
                delivery.latitude,

            "longitude":
                delivery.longitude,

            "weight":
                delivery.weight,

            "priority":
                delivery.priority,

            "status":
                delivery.status,

            "planned_arrival_time":
                stop.planned_arrival_time,

            "planned_departure_time":
                stop.planned_departure_time,

            "actual_arrival_time":
                stop.actual_arrival_time,

            "actual_departure_time":
                stop.actual_departure_time
        })

    capacity = (
        vehicle.capacity_weight
        if vehicle
        else 0
    )

    utilization = 0

    if capacity and capacity > 0:

        utilization = round(
            (
                total_weight /
                capacity
            ) * 100,
            1
        )

    return {

        "success": True,

        "route": {

            "route_id":
                route.id,

            "status":
                route.status,

            "route_date":
                route.route_date,

            "driver": {

                "id":
                    driver.id,

                "name":
                    driver.name,

                "phone":
                    driver.phone

            } if driver else None,

            "vehicle": {

                "id":
                    vehicle.id,

                "vehicle_number":
                    vehicle.vehicle_number,

                "vehicle_type":
                    vehicle.vehicle_type,

                "capacity_weight":
                    vehicle.capacity_weight

            } if vehicle else None,

            "warehouse": {

                "id":
                    warehouse.id,

                "name":
                    warehouse.name,

                "address":
                    warehouse.address,

                "latitude":
                    warehouse.latitude,

                "longitude":
                    warehouse.longitude

            } if warehouse else None,

            "total_distance_km":
                route.total_distance_km,

            "estimated_duration_minutes":
                route.estimated_duration_minutes,

            "total_weight_kg":
                round(total_weight, 2),

            "remaining_capacity_kg":
                round(
                    max(
                        0,
                        capacity - total_weight
                    ),
                    2
                ),

            "capacity_utilization":
                utilization,

            "stops":
                stop_list
        }
    }

@router.delete("/{route_id}")
def delete_route(
    route_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------
    # Find route
    # --------------------------------

    route = (
        db.query(Route)
        .filter(Route.id == route_id)
        .first()
    )

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found."
        )

    # --------------------------------
    # Get deliveries BEFORE deleting
    # route stops
    # --------------------------------

    stops = (
        db.query(RouteStop)
        .filter(
            RouteStop.route_id == route.id
        )
        .all()
    )

    delivery_ids = [
        stop.delivery_id
        for stop in stops
    ]

    # --------------------------------
    # Reset deliveries
    # --------------------------------

    if delivery_ids:

        deliveries = (
            db.query(Delivery)
            .filter(
                Delivery.id.in_(delivery_ids)
            )
            .all()
        )

        for delivery in deliveries:

            delivery.status = "PENDING"
            delivery.assigned_driver_id = None
            delivery.assigned_vehicle_id = None
            delivery.route_order = None
            delivery.estimated_arrival = None

    # --------------------------------
    # Reset driver
    # --------------------------------

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == route.driver_id
        )
        .first()
    )

    if driver:
        driver.status = "AVAILABLE"

    # --------------------------------
    # Reset vehicle
    # --------------------------------

    vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.id == route.vehicle_id
        )
        .first()
    )

    if vehicle:
        vehicle.status = "AVAILABLE"

    # --------------------------------
    # Delete route stops
    # --------------------------------

    db.query(RouteStop).filter(
        RouteStop.route_id == route.id
    ).delete(
        synchronize_session=False
    )

    # --------------------------------
    # Delete route
    # --------------------------------

    db.delete(route)

    db.commit()

    return {
        "success": True,
        "message": "Route deleted successfully.",
        "route_id": route_id
    }
# ============================================================
# START ROUTE
# ============================================================

@router.patch("/{route_id}/start")
def start_route(
    route_id: int,
    db: Session = Depends(get_db)
):

    route = (
        db.query(Route)
        .filter(
            Route.id == route_id
        )
        .first()
    )

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found."
        )

    if route.status != "PLANNED":

        raise HTTPException(
            status_code=400,
            detail=(
                f"Route is already "
                f"{route.status}."
            )
        )

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == route.driver_id
        )
        .first()
    )

    vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.id == route.vehicle_id
        )
        .first()
    )

    route.status = "IN_PROGRESS"

    if driver:
        driver.status = "ON_ROUTE"

    if vehicle:
        vehicle.status = "ON_ROUTE"

    db.commit()

    db.refresh(route)

    return {

        "success": True,

        "message":
            "Route started successfully.",

        "route": {

            "route_id":
                route.id,

            "route_status":
                route.status,

            "driver_status":
                driver.status
                if driver
                else None,

            "vehicle_status":
                vehicle.status
                if vehicle
                else None
        }
    }

# ============================================================
# LIVE TRAFFIC CHECK / DYNAMIC RE-ROUTING
# ============================================================

@router.post("/{route_id}/traffic-check")
def check_live_traffic(
    route_id: int,
    db: Session = Depends(get_db),
    threshold_percent: float = Query(20.0, ge=0, le=100),
):
    """
    Check the current IN_PROGRESS route against live TomTom traffic.

    If a different ordering of the unvisited stops is at least
    `threshold_percent` faster, the remaining route is reordered.

    Delivered stops are never moved.
    The warehouse is always treated as the route origin/return point.
    """

    route = (
        db.query(Route)
        .filter(Route.id == route_id)
        .first()
    )

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found.",
        )

    if route.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail="Live traffic re-routing is available only for IN_PROGRESS routes.",
        )

    warehouse = (
        db.query(Warehouse)
        .filter(Warehouse.id == route.warehouse_id)
        .first()
    )

    if warehouse is None:
        raise HTTPException(
            status_code=404,
            detail="Route warehouse not found.",
        )

    stops = (
        db.query(RouteStop)
        .filter(RouteStop.route_id == route.id)
        .order_by(RouteStop.stop_order)
        .all()
    )

    if not stops:
        return {
            "success": True,
            "replanned": False,
            "message": "No delivery stops require re-routing.",
            "route_id": route.id,
        }

    # ------------------------------------------------------------
    # Delivered stops are locked in place.
    # ------------------------------------------------------------

    delivered_stops = []
    remaining_stops = []

    for stop in stops:
        delivery = (
            db.query(Delivery)
            .filter(Delivery.id == stop.delivery_id)
            .first()
        )

        if delivery is None:
            continue

        if delivery.status == "DELIVERED":
            delivered_stops.append(stop)
        else:
            remaining_stops.append(stop)

    if not remaining_stops:
        return {
            "success": True,
            "replanned": False,
            "message": "All delivery stops are already delivered.",
            "route_id": route.id,
        }

    # ------------------------------------------------------------
    # Current location = last delivered stop, otherwise warehouse.
    # ------------------------------------------------------------

    if delivered_stops:
        current_stop = delivered_stops[-1]
        current_lat = float(
            db.query(Delivery)
            .filter(Delivery.id == current_stop.delivery_id)
            .first()
            .latitude
        )
        current_lng = float(
            db.query(Delivery)
            .filter(Delivery.id == current_stop.delivery_id)
            .first()
            .longitude
        )
    else:
        current_lat = float(warehouse.latitude)
        current_lng = float(warehouse.longitude)

    # ------------------------------------------------------------
    # Build a small live-traffic matrix:
    # current location + remaining stops + warehouse return.
    # ------------------------------------------------------------

    locations = [
        (current_lat, current_lng),
    ]

    for stop in remaining_stops:
        delivery = (
            db.query(Delivery)
            .filter(Delivery.id == stop.delivery_id)
            .first()
        )

        if delivery is None:
            continue

        locations.append(
            (
                float(delivery.latitude),
                float(delivery.longitude),
            )
        )

    locations.append(
        (
            float(warehouse.latitude),
            float(warehouse.longitude),
        )
    )

    expected_location_count = (
        1 + len(remaining_stops) + 1
    )

    if len(locations) != expected_location_count:
        raise HTTPException(
            status_code=400,
            detail="Some remaining delivery coordinates are invalid or missing.",
        )

    try:
        traffic_matrix = (
            DistanceMatrix.build_traffic_time_matrix(
                locations
            )
        )
    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to check live traffic: "
                f"{str(error)}"
            ),
        )

    if not traffic_matrix:
        raise HTTPException(
            status_code=502,
            detail="Live traffic matrix could not be generated.",
        )

    # ------------------------------------------------------------
    # Original remaining order cost.
    # ------------------------------------------------------------

    original_indices = list(
        range(
            1,
            1 + len(remaining_stops),
        )
    )

    warehouse_index = len(remaining_stops) + 1

    def route_time(indices):
        current_index = 0
        total_seconds = 0

        for index in indices:
            total_seconds += int(
                traffic_matrix[current_index][index]
            )
            current_index = index

        total_seconds += int(
            traffic_matrix[current_index][warehouse_index]
        )

        return total_seconds

    original_seconds = route_time(
        original_indices
    )

    # ------------------------------------------------------------
    # Greedy live-traffic re-routing.
    # ------------------------------------------------------------
    # This is intentionally lightweight because this endpoint is
    # meant for fast incremental re-routing while a route is active.
    # The full OR-Tools optimization remains the initial optimizer.
    # ------------------------------------------------------------

    unvisited = set(original_indices)
    optimized_indices = []
    current_index = 0

    while unvisited:
        next_index = min(
            unvisited,
            key=lambda index: traffic_matrix[current_index][index],
        )

        optimized_indices.append(next_index)
        unvisited.remove(next_index)
        current_index = next_index

    optimized_seconds = route_time(
        optimized_indices
    )

    if original_seconds <= 0:
        improvement_percent = 0.0
    else:
        improvement_percent = (
            (
                original_seconds
                - optimized_seconds
            )
            / original_seconds
        ) * 100

    old_minutes = round(
        original_seconds / 60
    )

    new_minutes = round(
        optimized_seconds / 60
    )

    saved_minutes = max(
        0,
        old_minutes - new_minutes,
    )

    # ------------------------------------------------------------
    # Re-route only when the live traffic improvement crosses
    # the configured threshold.
    # ------------------------------------------------------------

    should_replan = (
        improvement_percent >= threshold_percent
        and optimized_indices != original_indices
    )

    if not should_replan:
        return {
            "success": True,
            "replanned": False,
            "route_id": route.id,
            "message": (
                "Current route is still efficient. "
                "No re-routing required."
            ),
            "threshold_percent": threshold_percent,
            "traffic_improvement_percent": round(
                improvement_percent,
                1,
            ),
            "current_remaining_minutes": old_minutes,
            "best_remaining_minutes": new_minutes,
            "potential_saving_minutes": saved_minutes,
        }

    # ------------------------------------------------------------
    # Apply the new stop order.
    # ------------------------------------------------------------
    # Use temporary negative values first so unique stop_order
    # constraints cannot collide during the update.
    # ------------------------------------------------------------

    for temporary_order, stop in enumerate(
        remaining_stops,
        start=1,
    ):
        stop.stop_order = -temporary_order

    db.flush()

    stop_by_matrix_index = {
        index: remaining_stops[index - 1]
        for index in original_indices
    }

    next_order = (
        len(delivered_stops) + 1
    )

    reordered_stop_ids = []

    for matrix_index in optimized_indices:
        stop = stop_by_matrix_index[
            matrix_index
        ]

        stop.stop_order = next_order
        reordered_stop_ids.append(stop.id)

        delivery = (
            db.query(Delivery)
            .filter(Delivery.id == stop.delivery_id)
            .first()
        )

        if delivery is not None:
            delivery.route_order = next_order

        next_order += 1

    # ------------------------------------------------------------
    # Refresh planned arrival/departure times using the new
    # live-traffic order.
    # ------------------------------------------------------------

    elapsed_seconds = 0
    previous_matrix_index = 0

    for matrix_index in optimized_indices:
        elapsed_seconds += int(
            traffic_matrix[
                previous_matrix_index
            ][matrix_index]
        )

        delivery = (
            db.query(Delivery)
            .filter(
                Delivery.id
                == stop_by_matrix_index[matrix_index].delivery_id
            )
            .first()
        )

        stop = stop_by_matrix_index[
            matrix_index
        ]

        if delivery is not None:
            arrival_time = datetime.utcnow() + timedelta(
                seconds=elapsed_seconds
            )

            stop.planned_arrival_time = arrival_time

            stop.planned_departure_time = (
                arrival_time + timedelta(minutes=5)
            )

            delivery.estimated_arrival = arrival_time

        elapsed_seconds += 5 * 60
        previous_matrix_index = matrix_index

    # Keep the route ETA aligned with the newly calculated
    # live-traffic remaining travel time.
    route.estimated_duration_minutes = (
        new_minutes
    )

    route.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(route)

    return {
        "success": True,
        "replanned": True,
        "route_id": route.id,
        "message": (
            "Heavy traffic detected. "
            "Remaining route was re-optimized."
        ),
        "threshold_percent": threshold_percent,
        "traffic_improvement_percent": round(
            improvement_percent,
            1,
        ),
        "old_remaining_minutes": old_minutes,
        "new_remaining_minutes": new_minutes,
        "saved_minutes": saved_minutes,
        "new_stop_order": reordered_stop_ids,
    }