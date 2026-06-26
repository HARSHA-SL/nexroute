from app.services.distance_service import DistanceService

locations = [
    (12.9716, 77.5946),
    (12.9352, 77.6245),
    (13.0358, 77.5970)
]

matrix = DistanceService.build_distance_matrix(locations)

for row in matrix:
    print(row)