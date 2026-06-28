from pydantic import BaseModel


class VehicleCreate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    fuel_type: str

    capacity_weight: float
    capacity_volume: float

    status: str = "AVAILABLE"


class VehicleUpdate(BaseModel):
    vehicle_number: str
    vehicle_type: str
    fuel_type: str

    capacity_weight: float
    capacity_volume: float

    status: str