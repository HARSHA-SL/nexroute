from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.optimization.optimization_service import OptimizationService

router = APIRouter(
    prefix="/optimization",
    tags=["Optimization"]
)


@router.post("/run")
def run_optimization(db: Session = Depends(get_db)):
    return OptimizationService.optimize(db)