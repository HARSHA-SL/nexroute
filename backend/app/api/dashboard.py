from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db

from app.models.delivery import Delivery
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.route import Route
from app.models.route_stop import RouteStop

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db)
):

    total_deliveries = db.query(func.count(Delivery.id)).scalar()

    pending_deliveries = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.status.in_([
                "PENDING",
                "ASSIGNED",
                "ARRIVED"
            ])
        )
        .scalar()
    )

    delivered_deliveries = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.status == "DELIVERED"
        )
        .scalar()
    )

    total_routes = db.query(func.count(Route.id)).scalar()

    active_routes = (
        db.query(func.count(Route.id))
        .filter(
            Route.status == "IN_PROGRESS"
        )
        .scalar()
    )

    completed_routes = (
        db.query(func.count(Route.id))
        .filter(
            Route.status == "COMPLETED"
        )
        .scalar()
    )

    total_drivers = db.query(func.count(Driver.id)).scalar()

    available_drivers = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.status == "AVAILABLE"
        )
        .scalar()
    )

    on_route_drivers = (
        db.query(func.count(Driver.id))
        .filter(
            Driver.status == "ON_ROUTE"
        )
        .scalar()
    )

    total_vehicles = db.query(func.count(Vehicle.id)).scalar()

    available_vehicles = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.status == "AVAILABLE"
        )
        .scalar()
    )

    on_route_vehicles = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.status == "ON_ROUTE"
        )
        .scalar()
    )

    return {
        "success": True,
        "deliveries": {
            "total": total_deliveries,
            "pending": pending_deliveries,
            "delivered": delivered_deliveries
        },
        "routes": {
            "total": total_routes,
            "active": active_routes,
            "completed": completed_routes
        },
        "drivers": {
            "total": total_drivers,
            "available": available_drivers,
            "on_route": on_route_drivers
        },
        "vehicles": {
            "total": total_vehicles,
            "available": available_vehicles,
            "on_route": on_route_vehicles
        }
    }


@router.get("/routes")
def dashboard_routes(
    db: Session = Depends(get_db)
):

    routes = (
        db.query(Route)
        .order_by(Route.id.desc())
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

        total_stops = (
            db.query(func.count(RouteStop.id))
            .filter(RouteStop.route_id == route.id)
            .scalar()
        )

        completed_stops = (
            db.query(func.count(RouteStop.id))
            .join(
                Delivery,
                Delivery.id == RouteStop.delivery_id
            )
            .filter(
                RouteStop.route_id == route.id,
                Delivery.status == "DELIVERED"
            )
            .scalar()
        )

        response.append({
            "route_id": route.id,
            "driver": driver.name if driver else None,
            "vehicle": vehicle.vehicle_number if vehicle else None,
            "status": route.status,
            "total_distance_km": route.total_distance_km,
            "estimated_duration_minutes": route.estimated_duration_minutes,
            "total_stops": total_stops,
            "completed_stops": completed_stops,
            "remaining_stops": total_stops - completed_stops
        })

    return {
        "success": True,
        "routes": response
    }


@router.get("/drivers")
def dashboard_drivers(
    db: Session = Depends(get_db)
):

    drivers = db.query(Driver).all()

    response = []

    for driver in drivers:

        assigned_deliveries = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_driver_id == driver.id,
                Delivery.status != "DELIVERED"
            )
            .scalar()
        )

        completed_deliveries = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_driver_id == driver.id,
                Delivery.status == "DELIVERED"
            )
            .scalar()
        )

        response.append({
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone,
            "status": driver.status,
            "rating": driver.rating,
            "assigned_deliveries": assigned_deliveries,
            "completed_deliveries": completed_deliveries
        })

    return {
        "success": True,
        "total_drivers": len(response),
        "drivers": response
    }