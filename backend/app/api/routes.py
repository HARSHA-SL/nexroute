from fastapi import APIRouter, Depends
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
def get_all_routes(db: Session = Depends(get_db)):

    routes = db.query(Route).all()

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
            },
            "vehicle": {
                "id": vehicle.id,
                "vehicle_number": vehicle.vehicle_number,
                "vehicle_type": vehicle.vehicle_type
            },
            "warehouse": {
                "id": warehouse.id,
                "name": warehouse.name,
                "address": warehouse.address
            },
            "total_distance_km": route.total_distance_km,
            "estimated_duration_minutes": route.estimated_duration_minutes,
            "stops": stop_list
        })

    return {
        "success": True,
        "routes": response,
        "total_routes": len(response)
    }