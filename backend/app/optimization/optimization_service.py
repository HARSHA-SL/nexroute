from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models.delivery import Delivery
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.route import Route
from app.models.route_stop import RouteStop
from app.models.warehouse import Warehouse

from app.optimization.constraint_engine import ConstraintEngine
from app.optimization.distance_matrix import DistanceMatrix
from app.optimization.route_solver import RouteSolver


class OptimizationService:

    @staticmethod
    def optimize(db: Session):

        # Fetch data
        deliveries = db.query(Delivery).filter(
            Delivery.status == "PENDING"
        ).all()

        vehicles = db.query(Vehicle).filter(
            Vehicle.status == "AVAILABLE"
        ).all()

        drivers = db.query(Driver).filter(
            Driver.status == "AVAILABLE"
        ).all()

        warehouse = db.query(Warehouse).first()

        if warehouse is None:
            return {
                "success": False,
                "message": "No warehouse found in database."
            }

        if not deliveries:
            return {
                "success": False,
                "message": "No pending deliveries found."
            }

        if not vehicles:
            return {
                "success": False,
                "message": "No available vehicles found."
            }

        if not drivers:
            return {
                "success": False,
                "message": "No available drivers found."
            }

        # Apply business constraints
        deliveries, vehicles, drivers = ConstraintEngine.prepare_data(
            deliveries,
            vehicles,
            drivers
        )

        # Build coordinates list
        coordinates = [
            (delivery.latitude, delivery.longitude)
            for delivery in deliveries
        ]

        # Build distance matrix
        matrix = DistanceMatrix.build_matrix(coordinates)

        # Solve routes
        routes = RouteSolver.solve(
            distance_matrix=matrix,
            vehicle_count=len(vehicles)
        )

        saved_routes = []

        # Save optimized routes
        for vehicle_index, route in enumerate(routes):

            # Ignore empty routes
            if len(route) <= 2:
                continue

            vehicle = vehicles[vehicle_index]
            driver = drivers[vehicle_index]

            db_route = Route(
                vehicle_id=vehicle.id,
                driver_id=driver.id,
                warehouse_id=warehouse.id,
                status="PLANNED",
                total_distance_km=0,
                estimated_duration_minutes=0,
                route_date=datetime.utcnow(),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            db.add(db_route)
            db.flush()

            order = 1

            for node in route:

                # Skip depot
                if node == 0:
                    continue

                delivery = deliveries[node - 1]

                planned_arrival = datetime.utcnow() + timedelta(minutes=order * 20)
                planned_departure = planned_arrival + timedelta(minutes=5)

                stop = RouteStop(
                    route_id=db_route.id,
                    delivery_id=delivery.id,
                    stop_order=order,

                    planned_arrival_time=planned_arrival,
                    planned_departure_time=planned_departure,

                    actual_arrival_time=None,
                    actual_departure_time=None,

                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )

                db.add(stop)

                delivery.status = "ASSIGNED"
                delivery.assigned_driver_id = driver.id
                delivery.assigned_vehicle_id = vehicle.id
                delivery.route_order = order

                order += 1

            saved_routes.append(db_route)

        db.commit()

        return {
            "success": True,
            "routes_created": len(saved_routes),
            "deliveries_assigned": len(deliveries),
            "warehouse_id": warehouse.id
        }