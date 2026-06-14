from sqlalchemy import (
    String,
    Float,
    Integer,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from app.db.base import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"),
        nullable=False
    )

    customer_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    customer_phone: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    address: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    latitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    longitude: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    weight_kg: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    priority: Mapped[str] = mapped_column(
        String(20),
        default="MEDIUM"
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="PENDING"
    )

    time_window_start: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    time_window_end: Mapped[datetime] = mapped_column(
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