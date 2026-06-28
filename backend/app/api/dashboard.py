from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.warehouse import Warehouse
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


@router.get("/deliveries")
def dashboard_deliveries(
    db: Session = Depends(get_db)
):

    total = db.query(func.count(Delivery.id)).scalar()

    pending = db.query(func.count(Delivery.id)).filter(
        Delivery.status == "PENDING"
    ).scalar()

    assigned = db.query(func.count(Delivery.id)).filter(
        Delivery.status == "ASSIGNED"
    ).scalar()

    arrived = db.query(func.count(Delivery.id)).filter(
        Delivery.status == "ARRIVED"
    ).scalar()

    delivered = db.query(func.count(Delivery.id)).filter(
        Delivery.status == "DELIVERED"
    ).scalar()

    high_priority = db.query(func.count(Delivery.id)).filter(
        Delivery.priority == "HIGH"
    ).scalar()

    medium_priority = db.query(func.count(Delivery.id)).filter(
        Delivery.priority == "MEDIUM"
    ).scalar()

    low_priority = db.query(func.count(Delivery.id)).filter(
        Delivery.priority == "LOW"
    ).scalar()

    completion_percentage = 0

    if total > 0:
        completion_percentage = round(
            (delivered / total) * 100,
            2
        )

    return {
        "success": True,
        "deliveries": {
            "total": total,
            "pending": pending,
            "assigned": assigned,
            "arrived": arrived,
            "delivered": delivered,
            "high_priority": high_priority,
            "medium_priority": medium_priority,
            "low_priority": low_priority,
            "completion_percentage": completion_percentage
        }
    }

@router.get("/vehicles")
def dashboard_vehicles(
    db: Session = Depends(get_db)
):

    vehicles = db.query(Vehicle).all()

    response = []

    for vehicle in vehicles:

        assigned_deliveries = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_vehicle_id == vehicle.id,
                Delivery.status != "DELIVERED"
            )
            .scalar()
        )

        completed_deliveries = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_vehicle_id == vehicle.id,
                Delivery.status == "DELIVERED"
            )
            .scalar()
        )

        response.append({
            "id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "status": vehicle.status,
            "fuel_type": vehicle.fuel_type,
            "capacity_weight": vehicle.capacity_weight,
            "capacity_volume": vehicle.capacity_volume,
            "assigned_deliveries": assigned_deliveries,
            "completed_deliveries": completed_deliveries
        })

    available = sum(
        1 for vehicle in response
        if vehicle["status"] == "AVAILABLE"
    )

    on_route = sum(
        1 for vehicle in response
        if vehicle["status"] == "ON_ROUTE"
    )

    return {
        "success": True,
        "total_vehicles": len(response),
        "available_vehicles": available,
        "on_route_vehicles": on_route,
        "vehicles": response
    }
@router.get("/warehouses")
def dashboard_warehouses(
    db: Session = Depends(get_db)
):

    warehouses = db.query(Warehouse).all()

    response = []

    for warehouse in warehouses:

        active_routes = (
            db.query(func.count(Route.id))
            .filter(
                Route.warehouse_id == warehouse.id,
                Route.status == "IN_PROGRESS"
            )
            .scalar()
        )

        completed_routes = (
            db.query(func.count(Route.id))
            .filter(
                Route.warehouse_id == warehouse.id,
                Route.status == "COMPLETED"
            )
            .scalar()
        )

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

        response.append({
            "id": warehouse.id,
            "name": warehouse.name,
            "address": warehouse.address,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
            "active_routes": active_routes,
            "completed_routes": completed_routes,
            "pending_deliveries": pending_deliveries,
            "delivered_deliveries": delivered_deliveries
        })

    return {
        "success": True,
        "total_warehouses": len(response),
        "warehouses": response
    }
@router.get("/analytics")
def dashboard_analytics(
    db: Session = Depends(get_db)
):

    total_deliveries = db.query(func.count(Delivery.id)).scalar()

    delivered = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.status == "DELIVERED"
        )
        .scalar()
    )

    pending = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.status != "DELIVERED"
        )
        .scalar()
    )

    total_routes = db.query(func.count(Route.id)).scalar()

    completed_routes = (
        db.query(func.count(Route.id))
        .filter(
            Route.status == "COMPLETED"
        )
        .scalar()
    )

    active_routes = (
        db.query(func.count(Route.id))
        .filter(
            Route.status == "IN_PROGRESS"
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

    total_vehicles = db.query(func.count(Vehicle.id)).scalar()

    available_vehicles = (
        db.query(func.count(Vehicle.id))
        .filter(
            Vehicle.status == "AVAILABLE"
        )
        .scalar()
    )

    delivery_completion_rate = 0

    if total_deliveries > 0:
        delivery_completion_rate = round(
            delivered * 100 / total_deliveries,
            2
        )

    route_completion_rate = 0

    if total_routes > 0:
        route_completion_rate = round(
            completed_routes * 100 / total_routes,
            2
        )

    driver_availability = 0

    if total_drivers > 0:
        driver_availability = round(
            available_drivers * 100 / total_drivers,
            2
        )

    vehicle_availability = 0

    if total_vehicles > 0:
        vehicle_availability = round(
            available_vehicles * 100 / total_vehicles,
            2
        )

    return {
        "success": True,
        "analytics": {
            "delivery_completion_rate": delivery_completion_rate,
            "route_completion_rate": route_completion_rate,
            "driver_availability_percentage": driver_availability,
            "vehicle_availability_percentage": vehicle_availability,
            "pending_deliveries": pending,
            "active_routes": active_routes
        }
    }
@router.get("/driver-performance")
def dashboard_driver_performance(
    db: Session = Depends(get_db)
):

    drivers = (
        db.query(Driver)
        .order_by(
            Driver.rating.desc()
        )
        .all()
    )

    response = []

    for driver in drivers:

        completed = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_driver_id == driver.id,
                Delivery.status == "DELIVERED"
            )
            .scalar()
        )

        active = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_driver_id == driver.id,
                Delivery.status != "DELIVERED"
            )
            .scalar()
        )

        total = completed + active

        completion_rate = 0

        if total > 0:
            completion_rate = round(
                completed * 100 / total,
                2
            )

        response.append({
            "driver_id": driver.id,
            "name": driver.name,
            "rating": driver.rating,
            "status": driver.status,
            "completed_deliveries": completed,
            "active_deliveries": active,
            "completion_rate": completion_rate
        })

    response.sort(
        key=lambda x: (
            x["completed_deliveries"],
            x["rating"]
        ),
        reverse=True
    )

    return {
        "success": True,
        "total_drivers": len(response),
        "drivers": response
    }
@router.get("/vehicle-utilization")
def dashboard_vehicle_utilization(
    db: Session = Depends(get_db)
):

    vehicles = (
        db.query(Vehicle)
        .order_by(Vehicle.vehicle_number)
        .all()
    )

    response = []

    for vehicle in vehicles:

        active_deliveries = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_vehicle_id == vehicle.id,
                Delivery.status != "DELIVERED"
            )
            .scalar()
        )

        completed_deliveries = (
            db.query(func.count(Delivery.id))
            .filter(
                Delivery.assigned_vehicle_id == vehicle.id,
                Delivery.status == "DELIVERED"
            )
            .scalar()
        )

        total_deliveries = active_deliveries + completed_deliveries

        response.append({
            "vehicle_id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "status": vehicle.status,
            "active_deliveries": active_deliveries,
            "completed_deliveries": completed_deliveries,
            "total_deliveries": total_deliveries
        })

    return {
        "success": True,
        "total_vehicles": len(response),
        "vehicles": response
    }
@router.get("/priority-distribution")
def dashboard_priority_distribution(
    db: Session = Depends(get_db)
):

    high = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.priority == "HIGH"
        )
        .scalar()
    )

    medium = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.priority == "MEDIUM"
        )
        .scalar()
    )

    low = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.priority == "LOW"
        )
        .scalar()
    )

    total = high + medium + low

    high_percentage = 0
    medium_percentage = 0
    low_percentage = 0

    if total > 0:
        high_percentage = round(high * 100 / total, 2)
        medium_percentage = round(medium * 100 / total, 2)
        low_percentage = round(low * 100 / total, 2)

    return {
        "success": True,
        "distribution": {
            "total_deliveries": total,
            "high": high,
            "medium": medium,
            "low": low,
            "high_percentage": high_percentage,
            "medium_percentage": medium_percentage,
            "low_percentage": low_percentage
        }
    }
@router.get("/route-performance")
def dashboard_route_performance(
    db: Session = Depends(get_db)
):

    routes = (
        db.query(Route)
        .order_by(Route.id.desc())
        .all()
    )

    response = []

    for route in routes:

        total_stops = (
            db.query(func.count(RouteStop.id))
            .filter(
                RouteStop.route_id == route.id
            )
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

        completion_rate = 0

        if total_stops > 0:
            completion_rate = round(
                completed_stops * 100 / total_stops,
                2
            )

        response.append({
            "route_id": route.id,
            "status": route.status,
            "total_distance_km": route.total_distance_km,
            "estimated_duration_minutes": route.estimated_duration_minutes,
            "total_stops": total_stops,
            "completed_stops": completed_stops,
            "completion_rate": completion_rate
        })

    return {
        "success": True,
        "total_routes": len(response),
        "routes": response
    }