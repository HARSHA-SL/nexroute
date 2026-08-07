from datetime import datetime

from pydantic import BaseModel


class NotificationBase(BaseModel):
    title: str
    message: str
    category: str
    priority: str


class NotificationCreate(NotificationBase):
    pass


class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True