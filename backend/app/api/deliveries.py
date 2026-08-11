from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.delivery import Delivery
from app.models.driver import Driver
from app.models.vehicle import Vehicle


router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"]
)


# ---------------------------------------------------------
# GET ALL DELIVERIES
# ---------------------------------------------------------

@router.get("/")
def get_all_deliveries(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
    search: str | None = None,
    status: str | None = None,
    priority: str | None = None,
    db: Session = Depends(get_db)
):

    query = db.query(Delivery)

    # Search customer name or address
    if search:
        query = query.filter(
            (Delivery.customer_name.ilike(f"%{search}%")) |
            (Delivery.address.ilike(f"%{search}%"))
        )

    # Filter status
    if status:
        query = query.filter(
            Delivery.status == status
        )

    # Filter priority
    if priority:
        query = query.filter(
            Delivery.priority == priority
        )

    query = query.order_by(
        Delivery.id.desc()
    )

    total = query.count()

    deliveries = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    response = []

    for delivery in deliveries:

        driver = None
        vehicle = None

        if delivery.assigned_driver_id:
            driver = (
                db.query(Driver)
                .filter(
                    Driver.id ==
                    delivery.assigned_driver_id
                )
                .first()
            )

        if delivery.assigned_vehicle_id:
            vehicle = (
                db.query(Vehicle)
                .filter(
                    Vehicle.id ==
                    delivery.assigned_vehicle_id
                )
                .first()
            )

        response.append({
            "id": delivery.id,
            "customer_name": delivery.customer_name,
            "customer_phone": delivery.customer_phone,
            "address": delivery.address,
            "latitude": delivery.latitude,
            "longitude": delivery.longitude,
            "weight": delivery.weight,
            "volume": delivery.volume,
            "priority": delivery.priority,
            "status": delivery.status,
            "delivery_window_start":
                delivery.delivery_window_start,
            "delivery_window_end":
                delivery.delivery_window_end,
            "assigned_driver_id":
                delivery.assigned_driver_id,
            "assigned_vehicle_id":
                delivery.assigned_vehicle_id,
            "route_order":
                delivery.route_order,
            "estimated_arrival":
                delivery.estimated_arrival,

            "assigned_driver": {
                "id": driver.id,
                "name": driver.name
            } if driver else None,

            "assigned_vehicle": {
                "id": vehicle.id,
                "vehicle_number":
                    vehicle.vehicle_number
            } if vehicle else None,

            "created_at": delivery.created_at
        })

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages":
            (total + limit - 1) // limit,
        "deliveries": response
    }


# ---------------------------------------------------------
# GET SINGLE DELIVERY
# ---------------------------------------------------------

@router.get("/{delivery_id}")
def get_delivery(
    delivery_id: int,
    db: Session = Depends(get_db)
):

    delivery = (
        db.query(Delivery)
        .filter(
            Delivery.id == delivery_id
        )
        .first()
    )

    if delivery is None:
        raise HTTPException(
            status_code=404,
            detail="Delivery not found."
        )

    driver = None
    vehicle = None

    if delivery.assigned_driver_id:
        driver = (
            db.query(Driver)
            .filter(
                Driver.id ==
                delivery.assigned_driver_id
            )
            .first()
        )

    if delivery.assigned_vehicle_id:
        vehicle = (
            db.query(Vehicle)
            .filter(
                Vehicle.id ==
                delivery.assigned_vehicle_id
            )
            .first()
        )

    return {
        "success": True,
        "delivery": {
            "id": delivery.id,
            "customer_name":
                delivery.customer_name,
            "customer_phone":
                delivery.customer_phone,
            "address":
                delivery.address,
            "latitude":
                delivery.latitude,
            "longitude":
                delivery.longitude,
            "weight":
                delivery.weight,
            "volume":
                delivery.volume,
            "priority":
                delivery.priority,
            "status":
                delivery.status,
            "delivery_window_start":
                delivery.delivery_window_start,
            "delivery_window_end":
                delivery.delivery_window_end,
            "assigned_driver_id":
                delivery.assigned_driver_id,
            "assigned_vehicle_id":
                delivery.assigned_vehicle_id,
            "route_order":
                delivery.route_order,
            "estimated_arrival":
                delivery.estimated_arrival,
            "assigned_driver": {
                "id": driver.id,
                "name": driver.name
            } if driver else None,
            "assigned_vehicle": {
                "id": vehicle.id,
                "vehicle_number":
                    vehicle.vehicle_number
            } if vehicle else None,
            "created_at":
                delivery.created_at
        }
    }


# ---------------------------------------------------------
# CREATE DELIVERY
# ---------------------------------------------------------

@router.post("/")
def create_delivery(
    delivery_data: dict,
    db: Session = Depends(get_db)
):

    required_fields = [
        "customer_name",
        "address",
        "latitude",
        "longitude",
        "weight"
    ]

    for field in required_fields:
        if field not in delivery_data:
            raise HTTPException(
                status_code=400,
                detail=f"{field} is required."
            )

    delivery = Delivery(
        customer_name=
            delivery_data["customer_name"],

        customer_phone=
            delivery_data.get("customer_phone"),

        address=
            delivery_data["address"],

        latitude=
            float(delivery_data["latitude"]),

        longitude=
            float(delivery_data["longitude"]),

        weight=
            float(delivery_data["weight"]),

        volume=
            float(delivery_data.get("volume", 0)),

        priority=
            delivery_data.get(
                "priority",
                "MEDIUM"
            ),

        status="PENDING"
    )

    db.add(delivery)
    db.commit()
    db.refresh(delivery)

    return {
        "success": True,
        "message":
            "Delivery created successfully.",
        "delivery": {
            "id": delivery.id,
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
            "volume":
                delivery.volume,
            "priority":
                delivery.priority,
            "status":
                delivery.status
        }
    }


# ---------------------------------------------------------
# DELETE DELIVERY
# ---------------------------------------------------------

@router.delete("/{delivery_id}")
def delete_delivery(
    delivery_id: int,
    db: Session = Depends(get_db)
):

    delivery = (
        db.query(Delivery)
        .filter(
            Delivery.id == delivery_id
        )
        .first()
    )

    if delivery is None:
        raise HTTPException(
            status_code=404,
            detail="Delivery not found."
        )

    # Do not allow deleting an active delivery
    if delivery.status in [
        "ASSIGNED",
        "ARRIVED"
    ]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Delivery is currently active "
                "and cannot be deleted."
            )
        )

    db.delete(delivery)
    db.commit()

    return {
        "success": True,
        "message":
            "Delivery deleted successfully.",
        "delivery_id":
            delivery_id
    }