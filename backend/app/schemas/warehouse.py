from pydantic import BaseModel


class WarehouseCreate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float


class WarehouseUpdate(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float