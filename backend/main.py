from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.api.optimization import router as optimization_router
from app.api.routes import router as routes_router
from app.api.route_actions import router as route_actions_router
from app.api.dashboard import router as dashboard_router


app = FastAPI(
    title="NexRoute",
    version="1.0.0",
    description="AI Powered Logistics Route Optimization Platform"
)


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