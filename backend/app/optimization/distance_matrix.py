from math import radians, sin, cos, sqrt, atan2

import requests

from app.core.config import settings


class DistanceMatrix:
    """
    NexRoute Distance + Traffic Matrix

    Primary:
        TomTom Matrix Routing API v2
        Live traffic-aware travel times

    Fallback:
        Haversine distance + estimated travel time

    The TomTom matrix is split into small batches so that
    larger delivery sets can still use live traffic.
    """

    EARTH_RADIUS = 6371000  # meters

    TOMTOM_MATRIX_URL = (
        "https://api.tomtom.com/routing/matrix/2"
    )

    # ----------------------------------------------------------
    # Live traffic batch size
    #
    # For 27 nodes:
    #
    # 3 origins × 27 destinations = 81 cells
    #
    # 9 requests are made in total.
    # ----------------------------------------------------------

    TOMTOM_ORIGIN_BATCH_SIZE = 3

    # ==========================================================
    # HAVERSINE DISTANCE
    # ==========================================================

    @staticmethod
    def haversine(
        lat1,
        lon1,
        lat2,
        lon2,
    ):
        lat1, lon1, lat2, lon2 = map(
            radians,
            [
                lat1,
                lon1,
                lat2,
                lon2,
            ],
        )

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            sin(dlat / 2) ** 2
            + cos(lat1)
            * cos(lat2)
            * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(
            sqrt(a),
            sqrt(1 - a),
        )

        return int(
            DistanceMatrix.EARTH_RADIUS * c
        )

    # ==========================================================
    # BASIC DISTANCE MATRIX
    # ==========================================================

    @staticmethod
    def build_matrix(locations):
        """
        Build straight-line distance matrix.

        Returns distance in meters.
        """

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

    # ==========================================================
    # BUILD TOMTOM ORIGINS
    # ==========================================================

    @staticmethod
    def _build_origins(locations):

        origins = []

        for latitude, longitude in locations:

            origins.append(
                {
                    "point": {
                        "latitude": float(latitude),
                        "longitude": float(longitude),
                    }
                }
            )

        return origins

    # ==========================================================
    # BUILD TOMTOM DESTINATIONS
    # ==========================================================

    @staticmethod
    def _build_destinations(locations):

        destinations = []

        for latitude, longitude in locations:

            destinations.append(
                {
                    "point": {
                        "latitude": float(latitude),
                        "longitude": float(longitude),
                    }
                }
            )

        return destinations

    # ==========================================================
    # TOMTOM REQUEST
    # ==========================================================

    @staticmethod
    def _request_tomtom(
        origins,
        destinations,
        api_key,
    ):
        """
        Send one TomTom Matrix Routing API v2 request.
        """

        payload = {
            "origins": origins,
            "destinations": destinations,
            "options": {
                "departAt": "now",
                "traffic": "live",
                "travelMode": "car",
            },
        }

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

        params = {
            "key": api_key,
        }

        response = requests.post(
            DistanceMatrix.TOMTOM_MATRIX_URL,
            params=params,
            headers=headers,
            json=payload,
            timeout=30,
        )

        if response.status_code != 200:

            print(
                "\nWARNING: TomTom Matrix API "
                "returned an error."
            )

            print(
                f"HTTP status: "
                f"{response.status_code}"
            )

            print(
                response.text[:2000]
            )

            raise RuntimeError(
                "TomTom Matrix request failed."
            )

        return response.json()

    # ==========================================================
    # EXTRACT TOMTOM ERROR
    # ==========================================================

    @staticmethod
    def _extract_error(element):
        """
        Extract the most useful error information from
        TomTom's detailedError structure.
        """

        detailed_error = element.get(
            "detailedError"
        )

        if not detailed_error:
            return (
                "UNKNOWN",
                "No detailed error supplied.",
            )

        code = detailed_error.get(
            "code",
            "UNKNOWN",
        )

        message = detailed_error.get(
            "message",
            "",
        )

        inner_error = detailed_error.get(
            "innerError"
        )

        # TomTom commonly places the useful reason
        # inside innerError.

        if inner_error:

            inner_code = inner_error.get(
                "code"
            )

            inner_message = inner_error.get(
                "message",
                "",
            )

            if inner_code:
                code = inner_code

            if inner_message:
                message = inner_message

        return (
            code,
            message,
        )

    # ==========================================================
    # LIVE TRAFFIC MATRIX
    # ==========================================================

    @staticmethod
    def build_traffic_time_matrix(locations):
        """
        Build a complete live-traffic travel-time matrix.

        Every matrix cell is tracked using:

            (origin_index, destination_index)

        This prevents duplicate TomTom response entries from
        incorrectly increasing the successful/fallback counts.
        """

        api_key = getattr(
            settings,
            "TOMTOM_API_KEY",
            None,
        )

        # ------------------------------------------------------
        # Missing API key
        # ------------------------------------------------------

        if not api_key:

            print(
                "\nWARNING: TOMTOM_API_KEY "
                "is not configured."
            )

            print(
                "Using fallback travel-time matrix."
            )

            return (
                DistanceMatrix
                .build_fallback_time_matrix(
                    locations
                )
            )

        node_count = len(locations)

        if node_count == 0:
            return []

        if node_count == 1:
            return [[0]]

        print(
            "\n========================================"
        )

        print(
            "       TOMTOM TRAFFIC-AWARE ROUTING"
        )

        print(
            "========================================"
        )

        print(
            f"Total nodes: {node_count}"
        )

        print(
            "Traffic: LIVE"
        )

        print(
            "Travel mode: CAR"
        )

        print(
            "Matrix API: TomTom Matrix Routing v2"
        )

        batch_size = (
            DistanceMatrix
            .TOMTOM_ORIGIN_BATCH_SIZE
        )

        total_requests = (
            node_count
            + batch_size
            - 1
        ) // batch_size

        print(
            f"Live-traffic batch size: "
            f"{batch_size} origins"
        )

        print(
            f"Total TomTom requests: "
            f"{total_requests}"
        )

        # ------------------------------------------------------
        # Empty matrix
        # ------------------------------------------------------

        matrix = [
            [0 for _ in range(node_count)]
            for _ in range(node_count)
        ]

        destinations = (
            DistanceMatrix
            ._build_destinations(
                locations
            )
        )

        # ------------------------------------------------------
        # IMPORTANT:
        #
        # Track successful cells by coordinate.
        #
        # This is the fix for the incorrect counter.
        # ------------------------------------------------------

        successful_cells = set()

        fallback_cells = {}

        # ======================================================
        # TOMTOM BATCHES
        # ======================================================

        request_number = 0

        for batch_start in range(
            0,
            node_count,
            batch_size,
        ):

            batch_end = min(
                batch_start + batch_size,
                node_count,
            )

            request_number += 1

            print(
                "\n----------------------------------------"
            )

            print(
                f"TomTom request "
                f"{request_number}/"
                f"{total_requests}: "
                f"origins "
                f"{batch_start}-"
                f"{batch_end - 1} "
                f"x "
                f"{node_count} destinations "
                f"("
                f"{(batch_end - batch_start) * node_count}"
                f" cells)"
            )

            batch_locations = (
                locations[
                    batch_start:batch_end
                ]
            )

            origins = (
                DistanceMatrix
                ._build_origins(
                    batch_locations
                )
            )

            try:

                data = (
                    DistanceMatrix
                    ._request_tomtom(
                        origins,
                        destinations,
                        api_key,
                    )
                )

                results = data.get(
                    "data",
                    [],
                )

                if not results:

                    print(
                        "WARNING: TomTom returned "
                        "no cell data."
                    )

                    # Mark the complete batch
                    # as fallback.

                    for global_origin in range(
                        batch_start,
                        batch_end,
                    ):

                        for destination_index in range(
                            node_count
                        ):

                            if (
                                global_origin
                                == destination_index
                            ):
                                matrix[
                                    global_origin
                                ][
                                    destination_index
                                ] = 0

                                continue

                            fallback_time = (
                                DistanceMatrix
                                .fallback_pair_time(
                                    locations[
                                        global_origin
                                    ],
                                    locations[
                                        destination_index
                                    ],
                                )
                            )

                            matrix[
                                global_origin
                            ][
                                destination_index
                            ] = fallback_time

                            fallback_cells[
                                (
                                    global_origin,
                                    destination_index,
                                )
                            ] = (
                                "NO_DATA",
                                "TomTom returned no cell data.",
                            )

                    continue

                # --------------------------------------------------
                # Process TomTom cells
                # --------------------------------------------------

                for element in results:

                    local_origin_index = (
                        element.get(
                            "originIndex"
                        )
                    )

                    destination_index = (
                        element.get(
                            "destinationIndex"
                        )
                    )

                    if (
                        local_origin_index is None
                        or destination_index is None
                    ):
                        continue

                    local_origin_index = int(
                        local_origin_index
                    )

                    destination_index = int(
                        destination_index
                    )

                    # --------------------------------------------------
                    # Convert batch-local origin index
                    # into global origin index.
                    # --------------------------------------------------

                    global_origin_index = (
                        batch_start
                        + local_origin_index
                    )

                    # --------------------------------------------------
                    # Safety checks
                    # --------------------------------------------------

                    if (
                        global_origin_index < 0
                        or global_origin_index
                        >= node_count
                    ):
                        continue

                    if (
                        destination_index < 0
                        or destination_index
                        >= node_count
                    ):
                        continue

                    cell_key = (
                        global_origin_index,
                        destination_index,
                    )

                    route_summary = (
                        element.get(
                            "routeSummary"
                        )
                    )

                    # ==================================================
                    # SUCCESSFUL TOMTOM CELL
                    # ==================================================

                    if route_summary:

                        travel_time = (
                            route_summary.get(
                                "travelTimeInSeconds"
                            )
                        )

                        if travel_time is None:

                            travel_time = (
                                route_summary.get(
                                    "noTrafficTravelTimeInSeconds"
                                )
                            )

                        if travel_time is not None:

                            matrix[
                                global_origin_index
                            ][
                                destination_index
                            ] = max(
                                0,
                                int(travel_time),
                            )

                            successful_cells.add(
                                cell_key
                            )

                            # If this cell had previously
                            # been marked fallback, remove it.

                            fallback_cells.pop(
                                cell_key,
                                None,
                            )

                            continue

                    # ==================================================
                    # FAILED TOMTOM CELL
                    # ==================================================

                    error_code, error_message = (
                        DistanceMatrix
                        ._extract_error(
                            element
                        )
                    )

                    # Diagonal cells should always be zero.

                    if (
                        global_origin_index
                        == destination_index
                    ):

                        matrix[
                            global_origin_index
                        ][
                            destination_index
                        ] = 0

                        successful_cells.add(
                            cell_key
                        )

                        continue

                    fallback_time = (
                        DistanceMatrix
                        .fallback_pair_time(
                            locations[
                                global_origin_index
                            ],
                            locations[
                                destination_index
                            ],
                        )
                    )

                    matrix[
                        global_origin_index
                    ][
                        destination_index
                    ] = fallback_time

                    fallback_cells[
                        cell_key
                    ] = (
                        error_code,
                        error_message,
                    )

                    print(
                        "\nTomTom cell fallback:"
                    )

                    print(
                        f"  Origin: "
                        f"{global_origin_index}"
                    )

                    print(
                        f"  Destination: "
                        f"{destination_index}"
                    )

                    print(
                        f"  Error code: "
                        f"{error_code}"
                    )

                    print(
                        f"  Message: "
                        f"{error_message}"
                    )

            except requests.exceptions.Timeout:

                print(
                    "\nWARNING: TomTom request "
                    "timed out."
                )

                print(
                    "Using fallback values for "
                    "this batch."
                )

                # --------------------------------------------------
                # Fill failed batch with fallback.
                # --------------------------------------------------

                for global_origin in range(
                    batch_start,
                    batch_end,
                ):

                    for destination_index in range(
                        node_count
                    ):

                        cell_key = (
                            global_origin,
                            destination_index,
                        )

                        if (
                            global_origin
                            == destination_index
                        ):

                            matrix[
                                global_origin
                            ][
                                destination_index
                            ] = 0

                            successful_cells.add(
                                cell_key
                            )

                            continue

                        fallback_time = (
                            DistanceMatrix
                            .fallback_pair_time(
                                locations[
                                    global_origin
                                ],
                                locations[
                                    destination_index
                                ],
                            )
                        )

                        matrix[
                            global_origin
                        ][
                            destination_index
                        ] = fallback_time

                        fallback_cells[
                            cell_key
                        ] = (
                            "TIMEOUT",
                            "TomTom request timed out.",
                        )

            except requests.exceptions.RequestException as error:

                print(
                    "\nWARNING: TomTom request "
                    "failed."
                )

                print(
                    f"{type(error).__name__}: "
                    f"{error}"
                )

                print(
                    "Using fallback values for "
                    "this batch."
                )

                for global_origin in range(
                    batch_start,
                    batch_end,
                ):

                    for destination_index in range(
                        node_count
                    ):

                        cell_key = (
                            global_origin,
                            destination_index,
                        )

                        if (
                            global_origin
                            == destination_index
                        ):

                            matrix[
                                global_origin
                            ][
                                destination_index
                            ] = 0

                            successful_cells.add(
                                cell_key
                            )

                            continue

                        fallback_time = (
                            DistanceMatrix
                            .fallback_pair_time(
                                locations[
                                    global_origin
                                ],
                                locations[
                                    destination_index
                                ],
                            )
                        )

                        matrix[
                            global_origin
                        ][
                            destination_index
                        ] = fallback_time

                        fallback_cells[
                            cell_key
                        ] = (
                            "REQUEST_ERROR",
                            str(error),
                        )

            except Exception as error:

                print(
                    "\nWARNING: Unexpected "
                    "TomTom error."
                )

                print(
                    f"{type(error).__name__}: "
                    f"{error}"
                )

                print(
                    "Using fallback values for "
                    "this batch."
                )

                for global_origin in range(
                    batch_start,
                    batch_end,
                ):

                    for destination_index in range(
                        node_count
                    ):

                        cell_key = (
                            global_origin,
                            destination_index,
                        )

                        if (
                            global_origin
                            == destination_index
                        ):

                            matrix[
                                global_origin
                            ][
                                destination_index
                            ] = 0

                            successful_cells.add(
                                cell_key
                            )

                            continue

                        fallback_time = (
                            DistanceMatrix
                            .fallback_pair_time(
                                locations[
                                    global_origin
                                ],
                                locations[
                                    destination_index
                                ],
                            )
                        )

                        matrix[
                            global_origin
                        ][
                            destination_index
                        ] = fallback_time

                        fallback_cells[
                            cell_key
                        ] = (
                            "UNEXPECTED_ERROR",
                            str(error),
                        )

        # ======================================================
        # FINAL MATRIX VALIDATION
        # ======================================================

        total_cells = (
            node_count * node_count
        )

        # ------------------------------------------------------
        # Make diagonal zero.
        # ------------------------------------------------------

        for i in range(node_count):

            matrix[i][i] = 0

            successful_cells.add(
                (
                    i,
                    i,
                )
            )

            fallback_cells.pop(
                (
                    i,
                    i,
                ),
                None,
            )

        # ------------------------------------------------------
        # Find any cells that were not returned by TomTom
        # and were not already marked as fallback.
        # ------------------------------------------------------

        for i in range(node_count):

            for j in range(node_count):

                if i == j:
                    continue

                cell_key = (
                    i,
                    j,
                )

                if (
                    cell_key not in successful_cells
                    and cell_key not in fallback_cells
                ):

                    matrix[i][j] = (
                        DistanceMatrix
                        .fallback_pair_time(
                            locations[i],
                            locations[j],
                        )
                    )

                    fallback_cells[
                        cell_key
                    ] = (
                        "MISSING_CELL",
                        "TomTom did not return this cell.",
                    )

        # ======================================================
        # FINAL COUNTS
        # ======================================================

        actual_successful_cells = len(
            successful_cells
        )

        actual_fallback_cells = len(
            fallback_cells
        )

        # ------------------------------------------------------
        # Sanity check
        # ------------------------------------------------------

        if (
            actual_successful_cells
            + actual_fallback_cells
            != total_cells
        ):

            print(
                "\nWARNING: Matrix accounting "
                "does not equal total cells."
            )

            print(
                f"Successful: "
                f"{actual_successful_cells}"
            )

            print(
                f"Fallback: "
                f"{actual_fallback_cells}"
            )

            print(
                f"Total: "
                f"{total_cells}"
            )

        # ======================================================
        # PRINT FINAL RESULT
        # ======================================================

        print(
            "\n========================================"
        )

        print(
            "        TOMTOM MATRIX COMPLETED"
        )

        print(
            "========================================"
        )

        print(
            f"Total matrix cells: "
            f"{total_cells}"
        )

        print(
            f"Successful live-traffic cells: "
            f"{actual_successful_cells}"
        )

        print(
            f"Fallback cells: "
            f"{actual_fallback_cells}"
        )

        print(
            f"Matrix size: "
            f"{node_count} x {node_count}"
        )

        # ======================================================
        # PRINT FAILURE DETAILS
        # ======================================================

        if fallback_cells:

            print(
                "\n----------------------------------------"
            )

            print(
                "TomTom fallback cell details:"
            )

            print(
                "----------------------------------------"
            )

            for (
                origin_index,
                destination_index,
            ), (
                error_code,
                error_message,
            ) in sorted(
                fallback_cells.items()
            ):

                print(
                    f"Origin {origin_index} "
                    f"-> Destination "
                    f"{destination_index}"
                )

                print(
                    f"  Code: "
                    f"{error_code}"
                )

                print(
                    f"  Message: "
                    f"{error_message}"
                )

        else:

            print(
                "\nSUCCESS: "
                "All matrix cells use live "
                "TomTom traffic data."
            )

        print(
            "========================================\n"
        )

        return matrix

    # ==========================================================
    # FALLBACK PAIR TIME
    # ==========================================================

    @staticmethod
    def fallback_pair_time(
        origin,
        destination,
    ):
        """
        Estimate travel time when TomTom is unavailable.

        Uses approximately 30 km/h average speed.
        """

        distance_meters = (
            DistanceMatrix.haversine(
                origin[0],
                origin[1],
                destination[0],
                destination[1],
            )
        )

        distance_km = (
            distance_meters / 1000
        )

        if distance_km <= 0:
            return 0

        average_speed_kmh = 30

        minutes = (
            distance_km
            / average_speed_kmh
            * 60
        )

        return max(
            1,
            int(
                round(
                    minutes * 60
                )
            ),
        )

    # ==========================================================
    # FALLBACK MATRIX
    # ==========================================================

    @staticmethod
    def build_fallback_time_matrix(
        locations,
    ):
        """
        Build complete estimated travel-time matrix.
        """

        matrix = []

        for origin in locations:

            row = []

            for destination in locations:

                row.append(
                    DistanceMatrix
                    .fallback_pair_time(
                        origin,
                        destination,
                    )
                )

            matrix.append(row)

        return matrix