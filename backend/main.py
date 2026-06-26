from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.optimization import router as optimization_router


app = FastAPI(title="NexRoute")
app.include_router(optimization_router)

@app.get("/")
def root():
    return {
        "message": "NexRoute Backend Running"
    }
app.include_router(auth_router)
