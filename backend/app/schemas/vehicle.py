from datetime import datetime

from pydantic import BaseModel


class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    fuel_type: str

    capacity_weight: float
    capacity_volume: float

    status: str = "AVAILABLE"

    current_latitude: float | None = None
    current_longitude: float | None = None


class VehicleUpdate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    fuel_type: str

    capacity_weight: float
    capacity_volume: float

    status: str

    current_latitude: float | None = None
    current_longitude: float | None = None


class VehicleLocationUpdate(BaseModel):
    latitude: float
    longitude: float


class VehicleLocationResponse(BaseModel):
    vehicle_id: int
    vehicle_number: str
    latitude: float | None
    longitude: float | None
    last_location_update: datetime | None