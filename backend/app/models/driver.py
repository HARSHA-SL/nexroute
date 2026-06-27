from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.base import Base

class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True)

    name = Column(String(100))

    phone = Column(String(20))

    license_number = Column(String(50))

    rating = Column(Float, default=5.0)

    shift_start = Column(DateTime)

    shift_end = Column(DateTime)

    current_latitude = Column(Float)

    current_longitude = Column(Float)

    status = Column(String(30), default="AVAILABLE")