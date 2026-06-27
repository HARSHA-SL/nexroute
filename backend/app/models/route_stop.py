from sqlalchemy import (
    Integer,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from app.db.base import Base

class RouteStop(Base):
    __tablename__ = "route_stops"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    route_id: Mapped[int] = mapped_column(
        ForeignKey("routes.id"),
        nullable=False
    )

    delivery_id: Mapped[int] = mapped_column(
        ForeignKey("deliveries.id"),
        nullable=False
    )

    stop_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )

    planned_arrival_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    actual_arrival_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )

    planned_departure_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )

    actual_departure_time: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
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