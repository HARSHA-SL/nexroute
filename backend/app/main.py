from fastapi import FastAPI

app = FastAPI(title="NexRoute")


@app.get("/")
def root():
    return {
        "message": "NexRoute Backend Running"
    }