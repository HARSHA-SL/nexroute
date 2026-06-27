from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)

    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20))

    address = Column(String, nullable=False)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    weight = Column(Float, nullable=False)
    volume = Column(Float, default=0)

    priority = Column(String(20), default="MEDIUM")

    status = Column(String(30), default="PENDING")

    delivery_window_start = Column(DateTime, nullable=True)
    delivery_window_end = Column(DateTime, nullable=True)

    assigned_driver_id = Column(Integer, ForeignKey("drivers.id"), nullable=True)
    assigned_vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=True)

    route_order = Column(Integer, nullable=True)

    estimated_arrival = Column(DateTime, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())