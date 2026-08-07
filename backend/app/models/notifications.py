from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from app.db.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    priority = Column(String(20), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)