from datetime import datetime, timedelta

from app.db.session import SessionLocal

from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.delivery import Delivery
from app.models.route_stop import RouteStop
from app.models.route import Route
from app.models.warehouse import Warehouse


db = SessionLocal()


# ============================================================
# CLEAR OLD DATA
# ============================================================

print("Clearing old data...")

db.query(RouteStop).delete()
db.query(Route).delete()
db.query(Delivery).delete()
db.query(Driver).delete()
db.query(Vehicle).delete()
db.query(Warehouse).delete()

db.commit()


# ============================================================
# WAREHOUSES
# ============================================================

warehouses = [
    Warehouse(
        name="Bengaluru Central Hub",
        address="Peenya Industrial Area, Bengaluru",
        latitude=13.0280,
        longitude=77.5197,
    ),

    Warehouse(
        name="Whitefield Distribution Center",
        address="Whitefield Main Road, Bengaluru",
        latitude=12.9698,
        longitude=77.7499,
    ),
]


db.add_all(warehouses)
db.commit()


# ============================================================
# VEHICLES
# ============================================================

vehicles = [
    Vehicle(
        vehicle_number="KA01AB1234",
        vehicle_type="Van",
        capacity_weight=1000,
        status="AVAILABLE",
    ),

    Vehicle(
        vehicle_number="KA02CD5678",
        vehicle_type="Mini Truck",
        capacity_weight=2000,
        status="AVAILABLE",
    ),

    Vehicle(
        vehicle_number="KA03EF9012",
        vehicle_type="Truck",
        capacity_weight=5000,
        status="AVAILABLE",
    ),

    Vehicle(
        vehicle_number="KA04GH3456",
        vehicle_type="Van",
        capacity_weight=1200,
        status="AVAILABLE",
    ),

    Vehicle(
        vehicle_number="KA05IJ7890",
        vehicle_type="Mini Truck",
        capacity_weight=2500,
        status="AVAILABLE",
    ),
]


db.add_all(vehicles)
db.commit()


# ============================================================
# DRIVERS
# ============================================================

drivers = [
    Driver(
        name="Ravi Kumar",
        phone="9876543210",
        license_number="KA01DL1001",
        rating=4.8,
        status="AVAILABLE",
    ),

    Driver(
        name="Anita Sharma",
        phone="9876543211",
        license_number="KA01DL1002",
        rating=4.9,
        status="AVAILABLE",
    ),

    Driver(
        name="Rahul Singh",
        phone="9876543212",
        license_number="KA01DL1003",
        rating=4.6,
        status="AVAILABLE",
    ),

    Driver(
        name="Vikram Rao",
        phone="9876543213",
        license_number="KA01DL1004",
        rating=4.7,
        status="AVAILABLE",
    ),

    Driver(
        name="Priya Nair",
        phone="9876543214",
        license_number="KA01DL1005",
        rating=4.9,
        status="AVAILABLE",
    ),
]


db.add_all(drivers)
db.commit()


# ============================================================
# DELIVERIES
# ============================================================

deliveries = [

    Delivery(
        customer_name="Customer A",
        address="MG Road",
        latitude=12.9750,
        longitude=77.6050,
        weight=120,
        priority="HIGH",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer B",
        address="Indiranagar",
        latitude=12.9780,
        longitude=77.6400,
        weight=200,
        priority="MEDIUM",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer C",
        address="Whitefield",
        latitude=12.9950,
        longitude=77.7200,
        weight=350,
        priority="LOW",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer D",
        address="Koramangala",
        latitude=12.9352,
        longitude=77.6245,
        weight=180,
        priority="HIGH",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer E",
        address="HSR Layout",
        latitude=12.9121,
        longitude=77.6446,
        weight=250,
        priority="MEDIUM",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer F",
        address="Electronic City",
        latitude=12.8458,
        longitude=77.6603,
        weight=400,
        priority="LOW",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer G",
        address="Yelahanka",
        latitude=13.1007,
        longitude=77.5963,
        weight=150,
        priority="MEDIUM",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer H",
        address="Hebbal",
        latitude=13.0358,
        longitude=77.5970,
        weight=300,
        priority="HIGH",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer I",
        address="Jayanagar",
        latitude=12.9250,
        longitude=77.5938,
        weight=220,
        priority="MEDIUM",
        status="PENDING",
    ),

    Delivery(
        customer_name="Customer J",
        address="Marathahalli",
        latitude=12.9591,
        longitude=77.6974,
        weight=280,
        priority="HIGH",
        status="PENDING",
    ),
]


db.add_all(deliveries)
db.commit()


db.close()

print("")
print("==========================================")
print("  DEMO DATA CREATED SUCCESSFULLY")
print("==========================================")
print("Warehouses : 2")
print("Vehicles   : 5")
print("Drivers    : 5")
print("Deliveries : 10")
print("")