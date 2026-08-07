from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.notifications import router as notifications_router
from app.api.settings import router as settings_router
from app.api.auth import router as auth_router
from app.api.optimization import router as optimization_router
from app.api.routes import router as routes_router
from app.api.route_actions import router as route_actions_router
from app.api.dashboard import router as dashboard_router
from app.api.drivers import router as drivers_router
from app.api.vehicles import router as vehicles_router
from app.api.warehouses import router as warehouses_router
from app.api.analytics import router as analytics_router
app = FastAPI(
    title="NexRoute",
    version="1.0.0",
    description="AI Powered Logistics Route Optimization Platform",
)

# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------- #

@app.get("/")
def root():
    return {
        "message": "NexRoute Backend Running"
    }


app.include_router(auth_router)
app.include_router(optimization_router)
app.include_router(routes_router)
app.include_router(route_actions_router)
app.include_router(dashboard_router)
app.include_router(drivers_router)
app.include_router(vehicles_router)
app.include_router(warehouses_router)
app.include_router(analytics_router)
app.include_router(settings_router)
app.include_router(notifications_router)

