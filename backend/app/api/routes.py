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

        driver = db.query(Driver).filter(
            Driver.id == route.driver_id
        ).first()

        vehicle = db.query(Vehicle).filter(
            Vehicle.id == route.vehicle_id
        ).first()

        warehouse = db.query(Warehouse).filter(
            Warehouse.id == route.warehouse_id
        ).first()

        stops = (
            db.query(RouteStop)
            .filter(RouteStop.route_id == route.id)
            .order_by(RouteStop.stop_order)
            .all()
        )

        stop_list = []

        for stop in stops:

            delivery = db.query(Delivery).filter(
                Delivery.id == stop.delivery_id
            ).first()

            stop_list.append({
                "stop_order": stop.stop_order,
                "delivery_id": delivery.id,
                "customer_name": delivery.customer_name,
                "address": delivery.address,
                "latitude": delivery.latitude,
                "longitude": delivery.longitude,
                "priority": delivery.priority,
                "planned_arrival_time": stop.planned_arrival_time,
                "planned_departure_time": stop.planned_departure_time
            })

        response.append({
            "route_id": route.id,
            "status": route.status,
            "route_date": route.route_date,
            "driver": {
                "id": driver.id,
                "name": driver.name,
                "phone": driver.phone
            } if driver else None,
            "vehicle": {
                "id": vehicle.id,
                "vehicle_number": vehicle.vehicle_number,
                "vehicle_type": vehicle.vehicle_type
            } if vehicle else None,
            "warehouse": {
                "id": warehouse.id,
                "name": warehouse.name,
                "address": warehouse.address
            } if warehouse else None,
            "total_distance_km": route.total_distance_km,
            "estimated_duration_minutes": route.estimated_duration_minutes,
            "stops": stop_list
        })

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (
            total + limit - 1
        ) // limit,
        "routes": response
    }
@router.get("/driver/{driver_id}")
def get_driver_routes(
    driver_id: int,
    db: Session = Depends(get_db)
):

    routes = (
        db.query(Route)
        .filter(Route.driver_id == driver_id)
        .order_by(Route.route_date.desc())
        .all()
    )

    response = []

    for route in routes:

        vehicle = (
            db.query(Vehicle)
            .filter(Vehicle.id == route.vehicle_id)
            .first()
        )

        warehouse = (
            db.query(Warehouse)
            .filter(Warehouse.id == route.warehouse_id)
            .first()
        )

        stops = (
            db.query(RouteStop)
            .filter(RouteStop.route_id == route.id)
            .order_by(RouteStop.stop_order)
            .all()
        )

        deliveries = []

        for stop in stops:

            delivery = (
                db.query(Delivery)
                .filter(Delivery.id == stop.delivery_id)
                .first()
            )

            deliveries.append({
                "stop_order": stop.stop_order,
                "delivery_id": delivery.id,
                "customer_name": delivery.customer_name,
                "address": delivery.address,
                "latitude": delivery.latitude,
                "longitude": delivery.longitude,
                "priority": delivery.priority,
                "planned_arrival_time": stop.planned_arrival_time,
                "planned_departure_time": stop.planned_departure_time,
                "status": delivery.status
            })

        response.append({
            "route_id": route.id,
            "status": route.status,
            "route_date": route.route_date,
            "vehicle": {
                "vehicle_number": vehicle.vehicle_number,
                "vehicle_type": vehicle.vehicle_type
            } if vehicle else None,
            "warehouse": {
                "name": warehouse.name,
                "address": warehouse.address
            } if warehouse else None,
            "deliveries": deliveries
        })

    return {
        "success": True,
        "driver_id": driver_id,
        "total_routes": len(response),
        "routes": response
    }


@router.get("/{route_id}")
def get_route(
    route_id: int,
    db: Session = Depends(get_db)
):

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

    driver = (
        db.query(Driver)
        .filter(Driver.id == route.driver_id)
        .first()
    )

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == route.vehicle_id)
        .first()
    )

    warehouse = (
        db.query(Warehouse)
        .filter(Warehouse.id == route.warehouse_id)
        .first()
    )

    stops = (
        db.query(RouteStop)
        .filter(RouteStop.route_id == route.id)
        .order_by(RouteStop.stop_order)
        .all()
    )

    stop_list = []

    for stop in stops:

        delivery = (
            db.query(Delivery)
            .filter(Delivery.id == stop.delivery_id)
            .first()
        )

        stop_list.append({
            "stop_order": stop.stop_order,
            "delivery_id": delivery.id,
            "customer_name": delivery.customer_name,
            "address": delivery.address,
            "latitude": delivery.latitude,
            "longitude": delivery.longitude,
            "priority": delivery.priority,
            "status": delivery.status,
            "planned_arrival_time": stop.planned_arrival_time,
            "planned_departure_time": stop.planned_departure_time,
            "actual_arrival_time": stop.actual_arrival_time,
            "actual_departure_time": stop.actual_departure_time
        })

    return {
        "success": True,
        "route": {
            "route_id": route.id,
            "status": route.status,
            "route_date": route.route_date,
            "driver": {
                "id": driver.id,
                "name": driver.name,
                "phone": driver.phone
            } if driver else None,
            "vehicle": {
                "id": vehicle.id,
                "vehicle_number": vehicle.vehicle_number,
                "vehicle_type": vehicle.vehicle_type
            } if vehicle else None,
            "warehouse": {
                "id": warehouse.id,
                "name": warehouse.name,
                "address": warehouse.address
            } if warehouse else None,
            "total_distance_km": route.total_distance_km,
            "estimated_duration_minutes": route.estimated_duration_minutes,
            "stops": stop_list
        }
    }
@router.patch("/{route_id}/start")
def start_route(
    route_id: int,
    db: Session = Depends(get_db)
):

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

    if route.status != "PLANNED":
        raise HTTPException(
            status_code=400,
            detail=f"Route is already {route.status}."
        )

    driver = (
        db.query(Driver)
        .filter(Driver.id == route.driver_id)
        .first()
    )

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == route.vehicle_id)
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
        "message": "Route started successfully.",
        "route": {
            "route_id": route.id,
            "route_status": route.status,
            "driver_status": driver.status if driver else None,
            "vehicle_status": vehicle.status if vehicle else None
        }
    }