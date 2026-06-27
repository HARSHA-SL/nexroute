from dataclasses import dataclass

@dataclass
class DeliveryNode:
    id: int
    customer_name: str
    latitude: float
    longitude: float
    weight: float
    priority: str


@dataclass
class VehicleNode:
    id: int
    vehicle_number: str
    capacity_weight: float


@dataclass
class DriverNode:
    id: int
    name: str