from geopy.distance import geodesic


class DistanceService:

    @staticmethod
    def calculate_distance(coord1, coord2):
        """
        Returns distance in kilometers
        """
        return round(geodesic(coord1, coord2).km, 2)

    @staticmethod
    def build_distance_matrix(locations):
        """
        locations = [
            (12.9716, 77.5946),
            (12.9352, 77.6245),
            ...
        ]
        """

        matrix = []

        for source in locations:

            row = []

            for destination in locations:

                distance = DistanceService.calculate_distance(
                    source,
                    destination
                )

                row.append(int(distance * 1000))

            matrix.append(row)

        return matrix