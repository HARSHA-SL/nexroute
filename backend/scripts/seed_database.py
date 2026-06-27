from app.db.session import SessionLocal
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.delivery import Delivery

db = SessionLocal()

# Clear existing data
db.query(Delivery).delete()
db.query(Driver).delete()
db.query(Vehicle).delete()

# Vehicles
vehicles = [
    Vehicle(
        vehicle_number="KA01AB1234",
        vehicle_type="Van",
        capacity_weight=1000,
        status="AVAILABLE"
    ),
    Vehicle(
        vehicle_number="KA02CD5678",
        vehicle_type="Mini Truck",
        capacity_weight=2000,
        status="AVAILABLE"
    )
]

# Drivers
drivers = [
    Driver(
        name="Ravi",
        phone="9876543210",
        status="AVAILABLE"
    ),
    Driver(
        name="Anita",
        phone="9876543211",
        status="AVAILABLE"
    )
]

# Deliveries
deliveries = [
    Delivery(
        customer_name="Customer A",
        address="MG Road",
        latitude=12.9750,
        longitude=77.6050,
        weight=120,
        priority="HIGH",
        status="PENDING"
    ),
    Delivery(
        customer_name="Customer B",
        address="Indiranagar",
        latitude=12.9780,
        longitude=77.6400,
        weight=200,
        priority="MEDIUM",
        status="PENDING"
    ),
    Delivery(
        customer_name="Customer C",
        address="Whitefield",
        latitude=12.9950,
        longitude=77.7200,
        weight=350,
        priority="LOW",
        status="PENDING"
    )
]

db.add_all(vehicles)
db.add_all(drivers)
db.add_all(deliveries)

db.commit()
db.close()

print("✅ Sample data inserted successfully.")