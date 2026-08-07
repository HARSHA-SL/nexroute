from pydantic import BaseModel


class SettingsBase(BaseModel):
    theme: str
    language: str
    timezone: str

    email_notifications: bool
    push_notifications: bool
    sms_notifications: bool

    route_alerts: bool
    maintenance_alerts: bool

    two_factor: bool
    session_timeout: int

    maps_api_key: str
    optimization_engine: str
    default_warehouse: str


class SettingsUpdate(SettingsBase):
    pass


class SettingsResponse(SettingsBase):
    id: int

    class Config:
        from_attributes = True