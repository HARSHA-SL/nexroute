from datetime import datetime

from pydantic import BaseModel


class DriverCreate(BaseModel):
    name: str
    phone: str
    license_number: str
    rating: float = 5.0

    shift_start: datetime
    shift_end: datetime

    current_latitude: float
    current_longitude: float

    status: str = "AVAILABLE"


class DriverUpdate(BaseModel):
    name: str
    phone: str
    license_number: str
    rating: float

    shift_start: datetime
    shift_end: datetime

    current_latitude: float
    current_longitude: float

    status: str


# ADD THIS CLASS
class DriverLocationUpdate(BaseModel):
    current_latitude: float
    current_longitude: float