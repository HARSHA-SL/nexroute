from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.warehouse import Warehouse
from app.schemas.warehouse import WarehouseCreate, WarehouseUpdate

router = APIRouter(
    prefix="/warehouses",
    tags=["Warehouses"]
)


@router.get("/")
def get_all_warehouses(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str | None = None,
    sort: str = "id",
    db: Session = Depends(get_db)
):

    query = db.query(Warehouse)

    if search:
        query = query.filter(
            Warehouse.name.ilike(f"%{search}%")
        )

    if sort == "name":
        query = query.order_by(
            Warehouse.name
        )

    else:
        query = query.order_by(
            Warehouse.id
        )

    total = query.count()

    warehouses = (
        query
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    response = []

    for warehouse in warehouses:

        response.append({
            "id": warehouse.id,
            "name": warehouse.name,
            "address": warehouse.address,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
            "created_at": warehouse.created_at,
            "updated_at": warehouse.updated_at
        })

    return {
        "success": True,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (
            total + limit - 1
        ) // limit,
        "warehouses": response
    }


@router.get("/{warehouse_id}")
def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db)
):

    warehouse = (
        db.query(Warehouse)
        .filter(
            Warehouse.id == warehouse_id
        )
        .first()
    )

    if warehouse is None:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found."
        )

    return {
        "success": True,
        "warehouse": {
            "id": warehouse.id,
            "name": warehouse.name,
            "address": warehouse.address,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
            "created_at": warehouse.created_at,
            "updated_at": warehouse.updated_at
        }
    }
@router.post("/")
def create_warehouse(
    warehouse_data: WarehouseCreate,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(Warehouse)
        .filter(
            Warehouse.name == warehouse_data.name
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Warehouse already exists."
        )

    warehouse = Warehouse(
        name=warehouse_data.name,
        address=warehouse_data.address,
        latitude=warehouse_data.latitude,
        longitude=warehouse_data.longitude
    )

    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return {
        "success": True,
        "message": "Warehouse created successfully.",
        "warehouse": {
            "id": warehouse.id,
            "name": warehouse.name,
            "address": warehouse.address,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
            "created_at": warehouse.created_at,
            "updated_at": warehouse.updated_at
        }
    }


@router.patch("/{warehouse_id}")
def update_warehouse(
    warehouse_id: int,
    warehouse_data: WarehouseUpdate,
    db: Session = Depends(get_db)
):

    warehouse = (
        db.query(Warehouse)
        .filter(
            Warehouse.id == warehouse_id
        )
        .first()
    )

    if warehouse is None:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found."
        )

    existing = (
        db.query(Warehouse)
        .filter(
            Warehouse.name == warehouse_data.name,
            Warehouse.id != warehouse_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Warehouse already exists."
        )

    warehouse.name = warehouse_data.name
    warehouse.address = warehouse_data.address
    warehouse.latitude = warehouse_data.latitude
    warehouse.longitude = warehouse_data.longitude

    db.commit()
    db.refresh(warehouse)

    return {
        "success": True,
        "message": "Warehouse updated successfully.",
        "warehouse": {
            "id": warehouse.id,
            "name": warehouse.name,
            "address": warehouse.address,
            "latitude": warehouse.latitude,
            "longitude": warehouse.longitude,
            "created_at": warehouse.created_at,
            "updated_at": warehouse.updated_at
        }
    }


@router.delete("/{warehouse_id}")
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db)
):

    warehouse = (
        db.query(Warehouse)
        .filter(
            Warehouse.id == warehouse_id
        )
        .first()
    )

    if warehouse is None:
        raise HTTPException(
            status_code=404,
            detail="Warehouse not found."
        )

    db.delete(warehouse)
    db.commit()

    return {
        "success": True,
        "message": "Warehouse deleted successfully."
    }