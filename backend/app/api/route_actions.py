from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.route import Route
from app.models.route_stop import RouteStop
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.delivery import Delivery

router = APIRouter(
    prefix="/route-actions",
    tags=["Route Actions"]
)


@router.patch("/routes/{route_id}/start")
def start_route(
    route_id: int,
    db: Session = Depends(get_db)
):

    route = db.query(Route).filter(
        Route.id == route_id
    ).first()

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

    driver = db.query(Driver).filter(
        Driver.id == route.driver_id
    ).first()

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == route.vehicle_id
    ).first()

    route.status = "IN_PROGRESS"

    if driver:
        driver.status = "ON_ROUTE"

    if vehicle:
        vehicle.status = "ON_ROUTE"

    db.commit()

    return {
        "success": True,
        "message": "Route started successfully.",
        "route_id": route.id,
        "route_status": route.status,
        "driver_status": driver.status if driver else None,
        "vehicle_status": vehicle.status if vehicle else None
    }


@router.patch("/route-stops/{stop_id}/arrive")
def arrive_at_stop(
    stop_id: int,
    db: Session = Depends(get_db)
):

    stop = db.query(RouteStop).filter(
        RouteStop.id == stop_id
    ).first()

    if stop is None:
        raise HTTPException(
            status_code=404,
            detail="Route stop not found."
        )

    if stop.actual_arrival_time is not None:
        raise HTTPException(
            status_code=400,
            detail="Arrival already recorded."
        )

    stop.actual_arrival_time = datetime.utcnow()
    stop.updated_at = datetime.utcnow()

    delivery = db.query(Delivery).filter(
        Delivery.id == stop.delivery_id
    ).first()

    if delivery:
        delivery.status = "ARRIVED"

    db.commit()

    return {
        "success": True,
        "message": "Driver arrived at stop.",
        "stop_id": stop.id,
        "arrival_time": stop.actual_arrival_time,
        "delivery_status": delivery.status if delivery else None
    }


@router.patch("/route-stops/{stop_id}/deliver")
def deliver_package(
    stop_id: int,
    db: Session = Depends(get_db)
):

    stop = db.query(RouteStop).filter(
        RouteStop.id == stop_id
    ).first()

    if stop is None:
        raise HTTPException(
            status_code=404,
            detail="Route stop not found."
        )

    if stop.actual_arrival_time is None:
        raise HTTPException(
            status_code=400,
            detail="Driver has not arrived at this stop."
        )

    if stop.actual_departure_time is not None:
        raise HTTPException(
            status_code=400,
            detail="Package already delivered."
        )

    delivery = db.query(Delivery).filter(
        Delivery.id == stop.delivery_id
    ).first()

    stop.actual_departure_time = datetime.utcnow()
    stop.updated_at = datetime.utcnow()

    if delivery:
        delivery.status = "DELIVERED"

    db.commit()

    return {
        "success": True,
        "message": "Package delivered successfully.",
        "stop_id": stop.id,
        "departure_time": stop.actual_departure_time,
        "delivery_status": delivery.status if delivery else None
    }


@router.patch("/routes/{route_id}/complete")
def complete_route(
    route_id: int,
    db: Session = Depends(get_db)
):

    route = db.query(Route).filter(
        Route.id == route_id
    ).first()

    if route is None:
        raise HTTPException(
            status_code=404,
            detail="Route not found."
        )

    if route.status != "IN_PROGRESS":
        raise HTTPException(
            status_code=400,
            detail="Route is not in progress."
        )

    stops = db.query(RouteStop).filter(
        RouteStop.route_id == route.id
    ).all()

    if not stops:
        raise HTTPException(
            status_code=400,
            detail="Route has no stops."
        )

    for stop in stops:

        delivery = db.query(Delivery).filter(
            Delivery.id == stop.delivery_id
        ).first()

        if delivery is None or delivery.status != "DELIVERED":
            raise HTTPException(
                status_code=400,
                detail="All deliveries must be completed before finishing the route."
            )

    driver = db.query(Driver).filter(
        Driver.id == route.driver_id
    ).first()

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == route.vehicle_id
    ).first()

    route.status = "COMPLETED"

    if driver:
        driver.status = "AVAILABLE"

    if vehicle:
        vehicle.status = "AVAILABLE"

    db.commit()

    return {
        "success": True,
        "message": "Route completed successfully.",
        "route_id": route.id,
        "route_status": route.status,
        "driver_status": driver.status if driver else None,
        "vehicle_status": vehicle.status if vehicle else None
    }