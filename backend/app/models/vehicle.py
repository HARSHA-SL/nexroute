from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True)

    vehicle_number = Column(
        String(30),
        unique=True,
        nullable=False
    )

    vehicle_type = Column(String(30))

    capacity_weight = Column(Float)

    capacity_volume = Column(Float)

    fuel_type = Column(String(30))

    # ==========================================================
    # CURRENT VEHICLE LOCATION
    # ==========================================================

    current_latitude = Column(Float, nullable=True)

    current_longitude = Column(Float, nullable=True)

    # ==========================================================
    # LAST LOCATION UPDATE
    # ==========================================================

    last_location_update = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # ==========================================================
    # VEHICLE STATUS
    # ==========================================================

    status = Column(
        String(30),
        default="AVAILABLE"
    )