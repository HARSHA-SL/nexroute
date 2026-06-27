from app.optimization.types import (
    DeliveryNode,
    VehicleNode,
    DriverNode
)


class ConstraintEngine:

    @staticmethod
    def prepare_data(deliveries, vehicles, drivers):

        valid_deliveries = []
        valid_vehicles = []
        valid_drivers = []

        # Deliveries
        for delivery in deliveries:

            if delivery.status != "PENDING":
                continue

            valid_deliveries.append(
                DeliveryNode(
                    id=delivery.id,
                    customer_name=delivery.customer_name,
                    latitude=delivery.latitude,
                    longitude=delivery.longitude,
                    weight=delivery.weight,
                    priority=delivery.priority
                )
            )

        # Vehicles
        for vehicle in vehicles:

            if vehicle.status != "AVAILABLE":
                continue

            valid_vehicles.append(
                VehicleNode(
                    id=vehicle.id,
                    vehicle_number=vehicle.vehicle_number,
                    capacity_weight=vehicle.capacity_weight
                )
            )

        # Drivers
        for driver in drivers:

            if driver.status != "AVAILABLE":
                continue

            valid_drivers.append(
                DriverNode(
                    id=driver.id,
                    name=driver.name
                )
            )

        return (
            valid_deliveries,
            valid_vehicles,
            valid_drivers
        )