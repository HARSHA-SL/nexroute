from sqlalchemy import Column, Integer, String, Float
from app.db.base import Base

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True)

    vehicle_number = Column(String(30), unique=True)

    vehicle_type = Column(String(30))

    capacity_weight = Column(Float)

    capacity_volume = Column(Float)

    fuel_type = Column(String(30))

    current_latitude = Column(Float)

    current_longitude = Column(Float)

    status = Column(String(30), default="AVAILABLE")