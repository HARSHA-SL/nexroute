from sqlalchemy.orm import Session

from app.models.delivery import Delivery
from app.models.driver import Driver
from app.models.vehicle import Vehicle

from app.optimization.constraint_engine import ConstraintEngine
from app.optimization.distance_matrix import DistanceMatrix
from app.optimization.route_solver import RouteSolver


class OptimizationService:

    @staticmethod
    def optimize(db: Session):

        deliveries = db.query(Delivery).all()
        vehicles = db.query(Vehicle).all()
        drivers = db.query(Driver).all()

        deliveries, vehicles, drivers = (
            ConstraintEngine.prepare_data(
                deliveries,
                vehicles,
                drivers
            )
        )

        coordinates = [
            (d.latitude, d.longitude)
            for d in deliveries
        ]

        matrix = DistanceMatrix.build_matrix(coordinates)

        routes = RouteSolver.solve(
            distance_matrix=matrix,
            vehicle_count=len(vehicles)
        )

        return {
            "deliveries": deliveries,
            "vehicles": vehicles,
            "drivers": drivers,
            "routes": routes
        }