from fastapi import FastAPI
from app.api.auth import router as auth_router
app = FastAPI(title="NexRoute")


@app.get("/")
def root():
    return {
        "message": "NexRoute Backend Running"
    }
app.include_router(auth_router)
