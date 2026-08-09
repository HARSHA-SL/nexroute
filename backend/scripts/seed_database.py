from datetime import datetime, timedelta

from app.db.session import SessionLocal

from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.delivery import Delivery
from app.models.warehouse import Warehouse
from app.models.route import Route
from app.models.route_stop import RouteStop


db = SessionLocal()

try:
    # ============================================================
    # CLEAR EXISTING SAMPLE DATA
    # ============================================================

    # Child tables first
    db.query(RouteStop).delete()
    db.query(Route).delete()
    db.query(Delivery).delete()
    db.query(Warehouse).delete()
    db.query(Driver).delete()
    db.query(Vehicle).delete()

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
    ]

    db.add_all(vehicles)
    db.flush()

    # ============================================================
    # DRIVERS
    # ============================================================

    drivers = [
        Driver(
            name="Ravi",
            phone="9876543210",
            status="AVAILABLE",
        ),
        Driver(
            name="Anita",
            phone="9876543211",
            status="AVAILABLE",
        ),
    ]

    db.add_all(drivers)
    db.flush()

    # ============================================================
    # WAREHOUSE
    # ============================================================

    warehouse = Warehouse(
        name="Main Warehouse",
        address="Bangalore",
        latitude=12.9716,
        longitude=77.5946,
    )

    db.add(warehouse)
    db.flush()

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
    ]

    db.add_all(deliveries)
    db.flush()

    # ============================================================
    # ROUTE
    # ============================================================

    route_date = datetime.utcnow()

    route = Route(
        driver_id=drivers[1].id,          # Anita
        vehicle_id=vehicles[1].id,        # KA02CD5678
        warehouse_id=warehouse.id,
        total_distance_km=18.4,
        estimated_duration_minutes=45,
        status="PLANNED",
        route_date=route_date,
    )

    db.add(route)
    db.flush()

    # ============================================================
    # ROUTE STOPS
    #
    # Warehouse
    #    ↓
    # Customer B - Indiranagar
    #    ↓
    # Customer C - Whitefield
    #    ↓
    # Customer A - MG Road
    # ============================================================

    stop_start_time = route_date + timedelta(minutes=20)

    route_stops = [
        RouteStop(
            route_id=route.id,
            delivery_id=deliveries[1].id,      # Customer B
            stop_order=1,
            planned_arrival_time=stop_start_time,
            planned_departure_time=stop_start_time + timedelta(minutes=5),
        ),
        RouteStop(
            route_id=route.id,
            delivery_id=deliveries[2].id,      # Customer C
            stop_order=2,
            planned_arrival_time=stop_start_time + timedelta(minutes=20),
            planned_departure_time=stop_start_time + timedelta(minutes=25),
        ),
        RouteStop(
            route_id=route.id,
            delivery_id=deliveries[0].id,      # Customer A
            stop_order=3,
            planned_arrival_time=stop_start_time + timedelta(minutes=40),
            planned_departure_time=stop_start_time + timedelta(minutes=45),
        ),
    ]

    db.add_all(route_stops)

    db.commit()

    print("==========================================")
    print("✅ Sample data inserted successfully!")
    print("==========================================")
    print(f"Warehouse : {warehouse.name}")
    print(f"Driver    : {drivers[1].name}")
    print(f"Vehicle   : {vehicles[1].vehicle_number}")
    print(f"Route ID  : {route.id}")
    print("Status    : PLANNED")
    print("Stops     : 3")
    print("==========================================")

except Exception as e:
    db.rollback()
    print("❌ Error while seeding database:")
    print(e)
    raise

finally:
    db.close()