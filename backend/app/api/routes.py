from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

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