from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
router = APIRouter(
    prefix="/vehicles",
    tags=["Vehicles"]
)


@router.get("/")
def get_all_vehicles(
    db: Session = Depends(get_db)
):

    vehicles = (
        db.query(Vehicle)
        .order_by(Vehicle.id)
        .all()
    )

    response = []

    for vehicle in vehicles:

        response.append({
            "id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "capacity_weight": vehicle.capacity_weight,
            "capacity_volume": vehicle.capacity_volume,
            "fuel_type": vehicle.fuel_type,
            "current_latitude": vehicle.current_latitude,
            "current_longitude": vehicle.current_longitude,
            "status": vehicle.status
        })

    return {
        "success": True,
        "total_vehicles": len(response),
        "vehicles": response
    }


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found."
        )

    return {
        "success": True,
        "vehicle": {
            "id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "capacity_weight": vehicle.capacity_weight,
            "capacity_volume": vehicle.capacity_volume,
            "fuel_type": vehicle.fuel_type,
            "current_latitude": vehicle.current_latitude,
            "current_longitude": vehicle.current_longitude,
            "status": vehicle.status
        }
        
    }
@router.post("/")
def create_vehicle(
    vehicle_data: VehicleCreate,
    db: Session = Depends(get_db)
):

    existing_vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.vehicle_number == vehicle_data.vehicle_number
        )
        .first()
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle number already exists."
        )

    vehicle = Vehicle(
        vehicle_number=vehicle_data.vehicle_number,
        vehicle_type=vehicle_data.vehicle_type,
        capacity_weight=vehicle_data.capacity_weight,
        capacity_volume=vehicle_data.capacity_volume,
        fuel_type=vehicle_data.fuel_type,
        status=vehicle_data.status
    )

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    return {
        "success": True,
        "message": "Vehicle created successfully.",
        "vehicle": {
            "id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "capacity_weight": vehicle.capacity_weight,
            "capacity_volume": vehicle.capacity_volume,
            "fuel_type": vehicle.fuel_type,
            "status": vehicle.status
        }
    }


@router.patch("/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdate,
    db: Session = Depends(get_db)
):

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found."
        )

    existing_vehicle = (
        db.query(Vehicle)
        .filter(
            Vehicle.vehicle_number == vehicle_data.vehicle_number,
            Vehicle.id != vehicle_id
        )
        .first()
    )

    if existing_vehicle:
        raise HTTPException(
            status_code=400,
            detail="Vehicle number already exists."
        )

    vehicle.vehicle_number = vehicle_data.vehicle_number
    vehicle.vehicle_type = vehicle_data.vehicle_type
    vehicle.capacity_weight = vehicle_data.capacity_weight
    vehicle.capacity_volume = vehicle_data.capacity_volume
    vehicle.fuel_type = vehicle_data.fuel_type
    vehicle.status = vehicle_data.status

    db.commit()
    db.refresh(vehicle)

    return {
        "success": True,
        "message": "Vehicle updated successfully.",
        "vehicle": {
            "id": vehicle.id,
            "vehicle_number": vehicle.vehicle_number,
            "vehicle_type": vehicle.vehicle_type,
            "capacity_weight": vehicle.capacity_weight,
            "capacity_volume": vehicle.capacity_volume,
            "fuel_type": vehicle.fuel_type,
            "status": vehicle.status
        }
    }


@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db)
):

    vehicle = (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found."
        )

    db.delete(vehicle)
    db.commit()

    return {
        "success": True,
        "message": "Vehicle deleted successfully."
    }