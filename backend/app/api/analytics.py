from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db

from app.models.delivery import Delivery
from app.models.route import Route
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.warehouse import Warehouse

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)
@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):

    total_deliveries = db.query(Delivery).count()

    total_routes = db.query(Route).count()

    total_drivers = db.query(Driver).count()

    total_vehicles = db.query(Vehicle).count()

    total_warehouses = db.query(Warehouse).count()

    pending_deliveries = (
        db.query(Delivery)
        .filter(Delivery.status == "PENDING")
        .count()
    )

    delivered_deliveries = (
        db.query(Delivery)
        .filter(Delivery.status == "DELIVERED")
        .count()
    )

    in_progress_routes = (
        db.query(Route)
        .filter(Route.status == "IN_PROGRESS")
        .count()
    )

    completed_routes = (
        db.query(Route)
        .filter(Route.status == "COMPLETED")
        .count()
    )
    delivery_status = (
        db.query(
            Delivery.status,
            func.count(Delivery.id)
        )
        .group_by(Delivery.status)
        .all()
    )

    delivery_status_chart = [
        {
            "status": status,
            "count": count
        }
        for status, count in delivery_status
    ]

    route_status = (
        db.query(
            Route.status,
            func.count(Route.id)
        )
        .group_by(Route.status)
        .all()
    )

    route_status_chart = [
        {
            "status": status,
            "count": count
        }
        for status, count in route_status
    ]
    vehicle_status = (
        db.query(
            Vehicle.status,
            func.count(Vehicle.id)
        )
        .group_by(Vehicle.status)
        .all()
    )

    vehicle_status_chart = [
        {
            "status": status,
            "count": count
        }
        for status, count in vehicle_status
    ]

    driver_performance = (
        db.query(
            Driver.name,
            func.count(Route.id).label("completed_routes")
        )
        .join(Route, Route.driver_id == Driver.id)
        .filter(Route.status == "COMPLETED")
        .group_by(Driver.id, Driver.name)
        .order_by(
            func.count(Route.id).desc()
        )
        .all()
    )

    driver_performance_chart = [
        {
            "driver": name,
            "completed_routes": completed_routes,
        }
        for name, completed_routes in driver_performance
    ]
    warehouse_performance = (
        db.query(
            Warehouse.name,
            func.count(Route.id).label("total_routes")
        )
        .outerjoin(Route, Route.warehouse_id == Warehouse.id)
        .group_by(Warehouse.id, Warehouse.name)
        .order_by(
            func.count(Route.id).desc()
        )
        .all()
    )

    warehouse_performance_chart = [
        {
            "warehouse": name,
            "total_routes": total_routes,
        }
        for name, total_routes in warehouse_performance
    ]

    return {
        "success": True,
        "kpis": {
            "total_deliveries": total_deliveries,
            "total_routes": total_routes,
            "total_drivers": total_drivers,
            "total_vehicles": total_vehicles,
            "total_warehouses": total_warehouses,
            "pending_deliveries": pending_deliveries,
            "delivered_deliveries": delivered_deliveries,
            "in_progress_routes": in_progress_routes,
            "completed_routes": completed_routes,
        },
        "delivery_status": delivery_status_chart,
        "route_status": route_status_chart,
        "vehicle_status": vehicle_status_chart,
        "driver_performance": driver_performance_chart,
        "warehouse_performance": warehouse_performance_chart,
    }
