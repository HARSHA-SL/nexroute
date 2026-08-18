from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2


class RouteSolver:

    @staticmethod
    def solve(
        distance_matrix,
        deliveries,
        vehicles,
        depot=0,
        cost_matrix=None
    ):
        """
        Create capacity-constrained delivery routes.

        Rules:
        1. Every delivery MUST be assigned.
        2. A delivery can appear in only ONE route.
        3. Vehicle capacity must never be exceeded.
        4. Routes start and end at the warehouse/depot.
        5. Empty vehicles are allowed.
        """

        print("\n========================================")
        print("           ROUTE SOLVER")
        print("========================================")

        # ==========================================================
        # BASIC VALIDATION
        # ==========================================================

        if not vehicles:
            print("ERROR: No vehicles available.")
            return None

        if not deliveries:
            print("No deliveries available.")

            return [
                [depot, depot]
                for _ in vehicles
            ]

        if not distance_matrix:
            print("ERROR: Distance matrix is empty.")
            return None

        expected_nodes = len(deliveries) + 1

        if len(distance_matrix) != expected_nodes:
            print(
                "ERROR: Distance matrix size mismatch."
            )

            print(
                f"Expected nodes : {expected_nodes}"
            )

            print(
                f"Matrix size    : {len(distance_matrix)}"
            )

            return None

        for row in distance_matrix:

            if len(row) != expected_nodes:

                print(
                    "ERROR: Distance matrix is not square."
                )

                return None

        # ==========================================================
        # OPTIMIZATION COST MATRIX
        # ==========================================================
        #
        # V1:
        #   distance_matrix was also the optimization cost.
        #
        # V2:
        #   distance_matrix is retained for physical route distance.
        #   cost_matrix contains traffic-aware travel time.
        #
        # If no cost_matrix is supplied, preserve V1 behavior.
        # ==========================================================

        if cost_matrix is None:
            cost_matrix = distance_matrix

        if len(cost_matrix) != expected_nodes:

            print(
                "ERROR: Cost matrix size mismatch."
            )

            print(
                f"Expected nodes : {expected_nodes}"
            )

            print(
                f"Cost matrix    : {len(cost_matrix)}"
            )

            return None

        for row in cost_matrix:

            if len(row) != expected_nodes:

                print(
                    "ERROR: Cost matrix is not square."
                )

                return None

        vehicle_count = len(vehicles)

        # ==========================================================
        # CHECK INDIVIDUAL DELIVERY CAPACITY
        # ==========================================================

        maximum_vehicle_capacity = max(
            float(vehicle.capacity_weight)
            for vehicle in vehicles
        )

        for delivery in deliveries:

            if float(delivery.weight) > maximum_vehicle_capacity:

                print(
                    "\nERROR: Delivery exceeds "
                    "maximum vehicle capacity."
                )

                print(
                    f"Delivery ID : {delivery.id}"
                )

                print(
                    f"Weight      : {delivery.weight} kg"
                )

                print(
                    f"Max capacity: "
                    f"{maximum_vehicle_capacity} kg"
                )

                return None

        # ==========================================================
        # CHECK TOTAL CAPACITY
        # ==========================================================

        total_delivery_weight = sum(
            float(delivery.weight)
            for delivery in deliveries
        )

        total_vehicle_capacity = sum(
            float(vehicle.capacity_weight)
            for vehicle in vehicles
        )

        print(
            f"Total delivery weight : "
            f"{total_delivery_weight:.2f} kg"
        )

        print(
            f"Total vehicle capacity: "
            f"{total_vehicle_capacity:.2f} kg"
        )

        if total_delivery_weight > total_vehicle_capacity:

            print(
                "\nERROR: Total delivery weight exceeds "
                "total vehicle capacity."
            )

            return None

        # ==========================================================
        # CREATE ROUTING MANAGER
        # ==========================================================

        manager = pywrapcp.RoutingIndexManager(
            len(distance_matrix),
            vehicle_count,
            depot
        )

        routing = pywrapcp.RoutingModel(manager)

        # ==========================================================
        # TRAVEL-TIME / COST CALLBACK
        # ==========================================================

        def distance_callback(
            from_index,
            to_index
        ):

            from_node = manager.IndexToNode(
                from_index
            )

            to_node = manager.IndexToNode(
                to_index
            )

            try:

                travel_cost = float(
                    cost_matrix[
                        from_node
                    ][
                        to_node
                    ]
                )

            except (
                IndexError,
                TypeError,
                ValueError
            ):

                return 0

            # OR-Tools requires integer costs.
            #
            # V2 cost_matrix is travel time in seconds.
            # Keeping it as seconds lets OR-Tools optimize
            # directly for traffic-aware travel time.
            return max(
                0,
                int(round(travel_cost))
            )

        distance_callback_index = (
            routing.RegisterTransitCallback(
                distance_callback
            )
        )

        routing.SetArcCostEvaluatorOfAllVehicles(
            distance_callback_index
        )

        # ==========================================================
        # DELIVERY DEMAND
        # ==========================================================

        def demand_callback(from_index):

            node = manager.IndexToNode(
                from_index
            )

            # Warehouse
            if node == depot:
                return 0

            delivery_index = node - 1

            if not (
                0 <= delivery_index
                < len(deliveries)
            ):
                return 0

            weight = float(
                deliveries[
                    delivery_index
                ].weight
            )

            # Capacity dimension uses integer values.
            return max(
                0,
                int(round(weight * 100))
            )

        demand_callback_index = (
            routing.RegisterUnaryTransitCallback(
                demand_callback
            )
        )

        # ==========================================================
        # VEHICLE CAPACITY
        # ==========================================================

        vehicle_capacities = [
            max(
                0,
                int(
                    round(
                        float(
                            vehicle.capacity_weight
                        ) * 100
                    )
                )
            )
            for vehicle in vehicles
        ]

        print(
            "\n===== VEHICLE CAPACITIES ====="
        )

        for vehicle, capacity in zip(
            vehicles,
            vehicle_capacities
        ):

            print(
                f"{vehicle.vehicle_number}: "
                f"{capacity / 100:.2f} kg"
            )

        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,
            vehicle_capacities,
            True,
            "Capacity"
        )

        capacity_dimension = (
            routing.GetDimensionOrDie(
                "Capacity"
            )
        )

        # Encourage balanced utilization.
        capacity_dimension.SetGlobalSpanCostCoefficient(
            100
        )

        # ==========================================================
        # IMPORTANT:
        #
        # DO NOT USE AddDisjunction()
        #
        # Every delivery MUST be served.
        # ==========================================================

        # No disjunctions are added here.

        # ==========================================================
        # ENCOURAGE USING MULTIPLE VEHICLES
        # ==========================================================

        # A small fixed cost prevents the solver from unnecessarily
        # creating additional routes, while capacity still determines
        # how deliveries are distributed.

        for vehicle_id in range(
            vehicle_count
        ):

            routing.SetFixedCostOfVehicle(
                100,
                vehicle_id
            )

        # ==========================================================
        # SEARCH PARAMETERS
        # ==========================================================

        search_parameters = (
            pywrapcp.DefaultRoutingSearchParameters()
        )

        search_parameters.time_limit.seconds = 15

        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy
            .PARALLEL_CHEAPEST_INSERTION
        )

        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic
            .GUIDED_LOCAL_SEARCH
        )

        search_parameters.log_search = False

        # ==========================================================
        # SOLVE
        # ==========================================================

        print(
            "\nStarting OR-Tools solver..."
        )

        solution = routing.SolveWithParameters(
            search_parameters
        )

        if solution is None:

            print(
                "\nERROR: OR-Tools could not find "
                "a feasible solution."
            )

            return None

        print(
            "OR-Tools solution found."
        )

        # ==========================================================
        # EXTRACT ROUTES
        # ==========================================================

        routes = []

        # This set is extremely important.
        # It guarantees that the same delivery node
        # cannot accidentally be returned twice.
        assigned_nodes = set()

        print(
            "\n===== OPTIMIZED ROUTES ====="
        )

        for vehicle_id in range(
            vehicle_count
        ):

            index = routing.Start(
                vehicle_id
            )

            route = []

            load = 0.0

            while not routing.IsEnd(index):

                node = manager.IndexToNode(
                    index
                )

                route.append(node)

                # --------------------------------------------------
                # DELIVERY NODE
                # --------------------------------------------------

                if node != depot:

                    delivery_index = node - 1

                    if not (
                        0 <= delivery_index
                        < len(deliveries)
                    ):

                        print(
                            "\nERROR: Invalid delivery "
                            "node returned by solver."
                        )

                        return None

                    # --------------------------------------------------
                    # DUPLICATE CHECK
                    # --------------------------------------------------

                    if node in assigned_nodes:

                        print(
                            "\nERROR: DUPLICATE DELIVERY "
                            "NODE DETECTED."
                        )

                        print(
                            f"Duplicate node: {node}"
                        )

                        return None

                    assigned_nodes.add(node)

                    load += float(
                        deliveries[
                            delivery_index
                        ].weight
                    )

                index = solution.Value(
                    routing.NextVar(index)
                )

            # ------------------------------------------------------
            # FINAL DEPOT
            # ------------------------------------------------------

            final_node = manager.IndexToNode(
                index
            )

            route.append(final_node)

            routes.append(route)

            vehicle = vehicles[
                vehicle_id
            ]

            print(
                f"Vehicle: "
                f"{vehicle.vehicle_number}"
            )

            print(
                f"Capacity: "
                f"{vehicle.capacity_weight} kg"
            )

            print(
                f"Assigned: "
                f"{load:.2f} kg"
            )

            print(
                f"Remaining: "
                f"{float(vehicle.capacity_weight) - load:.2f} kg"
            )

            print(
                f"Route: {route}"
            )

            print(
                "----------------------------------------"
            )

        # ==========================================================
        # FINAL ASSIGNMENT VALIDATION
        # ==========================================================

        expected_delivery_nodes = set(
            range(
                1,
                len(deliveries) + 1
            )
        )

        print(
            "\n===== FINAL SOLVER VALIDATION ====="
        )

        print(
            f"Expected delivery nodes: "
            f"{sorted(expected_delivery_nodes)}"
        )

        print(
            f"Assigned delivery nodes: "
            f"{sorted(assigned_nodes)}"
        )

        # ----------------------------------------------------------
        # CHECK DUPLICATES
        # ----------------------------------------------------------

        total_occurrences = 0

        for route in routes:

            for node in route:

                if node != depot:
                    total_occurrences += 1

        if total_occurrences != len(
            deliveries
        ):

            print(
                "\nERROR: Delivery occurrence count "
                "does not match delivery count."
            )

            print(
                f"Expected: {len(deliveries)}"
            )

            print(
                f"Actual:   {total_occurrences}"
            )

            return None

        # ----------------------------------------------------------
        # CHECK MISSING DELIVERIES
        # ----------------------------------------------------------

        missing_nodes = (
            expected_delivery_nodes
            - assigned_nodes
        )

        if missing_nodes:

            print(
                "\nERROR: Some deliveries "
                "were not assigned."
            )

            print(
                f"Missing nodes: "
                f"{sorted(missing_nodes)}"
            )

            return None

        # ----------------------------------------------------------
        # CHECK EXTRA NODES
        # ----------------------------------------------------------

        extra_nodes = (
            assigned_nodes
            - expected_delivery_nodes
        )

        if extra_nodes:

            print(
                "\nERROR: Invalid delivery "
                "nodes detected."
            )

            print(
                f"Extra nodes: "
                f"{sorted(extra_nodes)}"
            )

            return None

        # ----------------------------------------------------------
        # FINAL SUCCESS
        # ----------------------------------------------------------

        print(
            "\n========================================"
        )

        print(
            " ROUTE SOLVER VALIDATION PASSED"
        )

        print(
            f" Deliveries: {len(deliveries)}"
        )

        print(
            f" Unique assigned: "
            f"{len(assigned_nodes)}"
        )

        print(
            f" Vehicles: {vehicle_count}"
        )

        print(
            " No duplicate deliveries."
        )

        print(
            " All deliveries assigned."
        )

        print(
            "========================================\n"
        )

        return routes