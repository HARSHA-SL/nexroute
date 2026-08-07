from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.notifications import Notification
from app.schemas.notifications import (
    NotificationCreate,
    NotificationResponse,
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)
@router.get("", response_model=list[NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .all()
    )
@router.post("", response_model=NotificationResponse)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
):
    notification = Notification(**payload.model_dump())

    db.add(notification)

    db.commit()

    db.refresh(notification)

    return notification

    
@router.put("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(404, "Notification not found")

    notification.is_read = True

    db.commit()

    db.refresh(notification)

    return notification
@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if not notification:
        raise HTTPException(404, "Notification not found")

    db.delete(notification)

    db.commit()

    return {
        "message": "Notification deleted"
    }