from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.schemas.driver import (
    DriverCreate,
    DriverUpdate,
    DriverLocationUpdate
)

from app.db.session import get_db
from app.models.driver import Driver
from app.models.delivery import Delivery

router = APIRouter(
    prefix="/drivers",
    tags=["Drivers"]
)


@router.get("/")
def get_all_drivers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = None,
    status: str | None = None,
    sort: str = "id",
    db: Session = Depends(get_db)
):

    query = db.query(Driver)

    if search:
        query = query.filter(
            Driver.name.ilike(f"%{search}%")
        )

    if status:
        query = query.filter(
            Driver.status == status
        )

    if sort == "rating":
        query = query.order_by(
            Driver.rating.desc()
        )

    elif sort == "name":
        query = query.order_by(
            Driver.name
        )

    else:
        query = query.order_by(
            Driver.id
        )

    total = query.count()

    drivers = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    response = []

    for driver in drivers:

        response.append({
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone,
            "license_number": driver.license_number,
            "rating": driver.rating,
            "shift_start": driver.shift_start,
            "shift_end": driver.shift_end,
            "current_latitude": driver.current_latitude,
            "current_longitude": driver.current_longitude,
            "status": driver.status
        })

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (
            total + limit - 1
        ) // limit,
        "drivers": response
    }


@router.get("/{driver_id}")
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db)
):

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == driver_id
        )
        .first()
    )

    if driver is None:
        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

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

    return {
        "success": True,
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone,
            "license_number": driver.license_number,
            "rating": driver.rating,
            "shift_start": driver.shift_start,
            "shift_end": driver.shift_end,
            "current_latitude": driver.current_latitude,
            "current_longitude": driver.current_longitude,
            "status": driver.status,
            "assigned_deliveries": assigned_deliveries,
            "completed_deliveries": completed_deliveries
        }
    }
@router.post("/")
def create_driver(
    driver_data: DriverCreate,
    db: Session = Depends(get_db)
):

    existing_driver = (
        db.query(Driver)
        .filter(
            Driver.license_number == driver_data.license_number
        )
        .first()
    )

    if existing_driver:
        raise HTTPException(
            status_code=400,
            detail="Driver with this license number already exists."
        )

    driver = Driver(
        name=driver_data.name,
        phone=driver_data.phone,
        license_number=driver_data.license_number,
        rating=driver_data.rating,
        shift_start=driver_data.shift_start,
        shift_end=driver_data.shift_end,
        current_latitude=driver_data.current_latitude,
        current_longitude=driver_data.current_longitude,
        status=driver_data.status
    )

    db.add(driver)
    db.commit()
    db.refresh(driver)

    return {
        "success": True,
        "message": "Driver created successfully.",
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone,
            "license_number": driver.license_number,
            "rating": driver.rating,
            "shift_start": driver.shift_start,
            "shift_end": driver.shift_end,
            "current_latitude": driver.current_latitude,
            "current_longitude": driver.current_longitude,
            "status": driver.status
        }
    }


@router.patch("/{driver_id}")
def update_driver(
    driver_id: int,
    driver_data: DriverUpdate,
    db: Session = Depends(get_db)
):

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == driver_id
        )
        .first()
    )

    if driver is None:
        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

    existing_driver = (
        db.query(Driver)
        .filter(
            Driver.license_number == driver_data.license_number,
            Driver.id != driver_id
        )
        .first()
    )

    if existing_driver:
        raise HTTPException(
            status_code=400,
            detail="License number already exists."
        )

    driver.name = driver_data.name
    driver.phone = driver_data.phone
    driver.license_number = driver_data.license_number
    driver.rating = driver_data.rating
    driver.shift_start = driver_data.shift_start
    driver.shift_end = driver_data.shift_end
    driver.current_latitude = driver_data.current_latitude
    driver.current_longitude = driver_data.current_longitude
    driver.status = driver_data.status

    db.commit()
    db.refresh(driver)

    return {
        "success": True,
        "message": "Driver updated successfully.",
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "phone": driver.phone,
            "license_number": driver.license_number,
            "rating": driver.rating,
            "shift_start": driver.shift_start,
            "shift_end": driver.shift_end,
            "current_latitude": driver.current_latitude,
            "current_longitude": driver.current_longitude,
            "status": driver.status
        }
    }


@router.delete("/{driver_id}")
def delete_driver(
    driver_id: int,
    db: Session = Depends(get_db)
):

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == driver_id
        )
        .first()
    )

    if driver is None:
        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

    active_deliveries = (
        db.query(func.count(Delivery.id))
        .filter(
            Delivery.assigned_driver_id == driver.id,
            Delivery.status != "DELIVERED"
        )
        .scalar()
    )

    if active_deliveries > 0:
        raise HTTPException(
            status_code=400,
            detail="Driver has active deliveries and cannot be deleted."
        )

    db.delete(driver)
    db.commit()

    return {
        "success": True,
        "message": "Driver deleted successfully."
    }


@router.patch("/{driver_id}/location")
def update_driver_location(
    driver_id: int,
    location: DriverLocationUpdate,
    db: Session = Depends(get_db)
):

    driver = (
        db.query(Driver)
        .filter(
            Driver.id == driver_id
        )
        .first()
    )

    if driver is None:
        raise HTTPException(
            status_code=404,
            detail="Driver not found."
        )

    driver.current_latitude = location.current_latitude
    driver.current_longitude = location.current_longitude

    db.commit()
    db.refresh(driver)

    return {
        "success": True,
        "message": "Driver location updated successfully.",
        "driver": {
            "id": driver.id,
            "name": driver.name,
            "current_latitude": driver.current_latitude,
            "current_longitude": driver.current_longitude
        }
    }