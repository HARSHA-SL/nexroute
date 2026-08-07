from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.settings import Settings
from app.schemas.settings import SettingsResponse, SettingsUpdate
router = APIRouter(
    prefix="/settings",
    tags=["Settings"],
)


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(Settings).first()

    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    return settings


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
):
    settings = db.query(Settings).first()

    if not settings:
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    for key, value in payload.model_dump().items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)

    return settings