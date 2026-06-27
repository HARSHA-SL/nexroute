from sqlalchemy import (
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.db.base import Base

class Route(Base):
    __tablename__ = "routes"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    driver_id: Mapped[int] = mapped_column(
        ForeignKey("drivers.id"),
        nullable=False
    )

    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id"),
        nullable=False
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False
    )

    total_distance_km: Mapped[float] = mapped_column(
        Float,
        default=0
    )

    estimated_duration_minutes: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="PLANNED"
    )

    route_date: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )