from sqlalchemy import Boolean, Column, Integer, String

from app.db.base import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)

    theme = Column(String, default="Dark")
    language = Column(String, default="English")
    timezone = Column(String, default="Asia/Kolkata")

    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)

    route_alerts = Column(Boolean, default=True)
    maintenance_alerts = Column(Boolean, default=True)

    two_factor = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=30)

    maps_api_key = Column(String, default="")
    optimization_engine = Column(String, default="OR-Tools")
    default_warehouse = Column(String, default="Main Warehouse")