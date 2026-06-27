from math import radians, sin, cos, sqrt, atan2


class DistanceMatrix:
    EARTH_RADIUS = 6371000  # meters

    @staticmethod
    def haversine(lat1, lon1, lat2, lon2):
        lat1, lon1, lat2, lon2 = map(
            radians,
            [lat1, lon1, lat2, lon2]
        )

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return int(DistanceMatrix.EARTH_RADIUS * c)

    @staticmethod
    def build_matrix(locations):

        matrix = []

        for origin in locations:

            row = []

            for destination in locations:

                distance = DistanceMatrix.haversine(
                    origin[0],
                    origin[1],
                    destination[0],
                    destination[1],
                )

                row.append(distance)

            matrix.append(row)

        return matrix