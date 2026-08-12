import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError


API_URL = "http://127.0.0.1:8000/deliveries/"


deliveries = [
    {
        "customer_name": "Customer K",
        "customer_phone": "9000000011",
        "address": "Indiranagar, Bengaluru",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "weight": 150,
        "volume": 10,
        "priority": "MEDIUM",
    },
    {
        "customer_name": "Customer L",
        "customer_phone": "9000000012",
        "address": "Koramangala, Bengaluru",
        "latitude": 12.9352,
        "longitude": 77.6245,
        "weight": 300,
        "volume": 20,
        "priority": "HIGH",
    },
    {
        "customer_name": "Customer M",
        "customer_phone": "9000000013",
        "address": "Whitefield, Bengaluru",
        "latitude": 12.9698,
        "longitude": 77.7500,
        "weight": 450,
        "volume": 30,
        "priority": "HIGH",
    },
    {
        "customer_name": "Customer N",
        "customer_phone": "9000000014",
        "address": "Jayanagar, Bengaluru",
        "latitude": 12.9250,
        "longitude": 77.5938,
        "weight": 200,
        "volume": 15,
        "priority": "MEDIUM",
    },
    {
        "customer_name": "Customer O",
        "customer_phone": "9000000015",
        "address": "HSR Layout, Bengaluru",
        "latitude": 12.9116,
        "longitude": 77.6474,
        "weight": 350,
        "volume": 25,
        "priority": "LOW",
    },
    {
        "customer_name": "Customer P",
        "customer_phone": "9000000016",
        "address": "Electronic City, Bengaluru",
        "latitude": 12.8452,
        "longitude": 77.6602,
        "weight": 500,
        "volume": 35,
        "priority": "HIGH",
    },
    {
        "customer_name": "Customer Q",
        "customer_phone": "9000000017",
        "address": "Hebbal, Bengaluru",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "weight": 180,
        "volume": 12,
        "priority": "MEDIUM",
    },
    {
        "customer_name": "Customer R",
        "customer_phone": "9000000018",
        "address": "Yelahanka, Bengaluru",
        "latitude": 13.1007,
        "longitude": 77.5963,
        "weight": 250,
        "volume": 18,
        "priority": "LOW",
    },
    {
        "customer_name": "Customer S",
        "customer_phone": "9000000019",
        "address": "Marathahalli, Bengaluru",
        "latitude": 12.9591,
        "longitude": 77.6974,
        "weight": 400,
        "volume": 28,
        "priority": "HIGH",
    },
    {
        "customer_name": "Customer T",
        "customer_phone": "9000000020",
        "address": "Banashankari, Bengaluru",
        "latitude": 12.9255,
        "longitude": 77.5468,
        "weight": 220,
        "volume": 16,
        "priority": "MEDIUM",
    },
    {
        "customer_name": "Customer U",
        "customer_phone": "9000000021",
        "address": "Rajajinagar, Bengaluru",
        "latitude": 12.9910,
        "longitude": 77.5530,
        "weight": 120,
        "volume": 8,
        "priority": "LOW",
    },
    {
        "customer_name": "Customer V",
        "customer_phone": "9000000022",
        "address": "BTM Layout, Bengaluru",
        "latitude": 12.9166,
        "longitude": 77.6101,
        "weight": 280,
        "volume": 20,
        "priority": "MEDIUM",
    },
    {
        "customer_name": "Customer W",
        "customer_phone": "9000000023",
        "address": "Malleshwaram, Bengaluru",
        "latitude": 13.0035,
        "longitude": 77.5700,
        "weight": 300,
        "volume": 22,
        "priority": "HIGH",
    },
    {
        "customer_name": "Customer X",
        "customer_phone": "9000000024",
        "address": "Kengeri, Bengaluru",
        "latitude": 12.9141,
        "longitude": 77.4820,
        "weight": 250,
        "volume": 18,
        "priority": "LOW",
    },
    {
        "customer_name": "Customer Y",
        "customer_phone": "9000000025",
        "address": "Bellandur, Bengaluru",
        "latitude": 12.9304,
        "longitude": 77.6784,
        "weight": 400,
        "volume": 28,
        "priority": "HIGH",
    },
]


def create_delivery(delivery):
    data = json.dumps(delivery).encode("utf-8")

    request = Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request) as response:
            result = json.loads(response.read().decode("utf-8"))

            created = result.get("delivery", {})

            print(
                f"Created D-{created.get('id')}: "
                f"{created.get('customer_name')} | "
                f"{created.get('weight')} kg | "
                f"{created.get('priority')}"
            )

    except HTTPError as error:
        body = error.read().decode("utf-8")

        print(
            f"FAILED: {delivery['customer_name']} "
            f"| HTTP {error.code}"
        )
        print(body)

    except URLError as error:
        print("Could not connect to backend.")
        print(error)


def main():
    print("\n======================================")
    print(" NexRoute Bulk Delivery Seeder")
    print("======================================\n")

    print(f"Creating {len(deliveries)} deliveries...\n")

    for delivery in deliveries:
        create_delivery(delivery)

    total_weight = sum(
        delivery["weight"]
        for delivery in deliveries
    )

    print("\n======================================")
    print("Bulk creation completed.")
    print(f"Deliveries created: {len(deliveries)}")
    print(f"Total package weight: {total_weight} kg")
    print("Status: PENDING")
    print("======================================\n")


if __name__ == "__main__":
    main()