from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2


class RouteSolver:

    @staticmethod
    def solve(
        distance_matrix,
        vehicle_capacities,
        delivery_weights,
        depot=0
    ):

        # -----------------------------------------
        # Basic validation
        # -----------------------------------------

        vehicle_count = len(vehicle_capacities)

        if vehicle_count == 0:
            return None

        if len(distance_matrix) == 0:
            return None

        # -----------------------------------------
        # Create routing manager
        # -----------------------------------------

        manager = pywrapcp.RoutingIndexManager(
            len(distance_matrix),
            vehicle_count,
            depot
        )

        routing = pywrapcp.RoutingModel(manager)

        # -----------------------------------------
        # Distance callback
        # -----------------------------------------

        def distance_callback(from_index, to_index):

            from_node = manager.IndexToNode(
                from_index
            )

            to_node = manager.IndexToNode(
                to_index
            )

            return int(
                distance_matrix[from_node][to_node]
            )

        distance_callback_index = (
            routing.RegisterTransitCallback(
                distance_callback
            )
        )

        routing.SetArcCostEvaluatorOfAllVehicles(
            distance_callback_index
        )

        # -----------------------------------------
        # DELIVERY WEIGHT CALLBACK
        #
        # Node 0 = warehouse
        # Node 1 = delivery 1
        # Node 2 = delivery 2
        # ...
        # -----------------------------------------

        def demand_callback(from_index):

            node = manager.IndexToNode(
                from_index
            )

            if node == depot:
                return 0

            delivery_index = node - 1

            if delivery_index >= len(
                delivery_weights
            ):
                return 0

            return int(
                delivery_weights[delivery_index]
            )

        demand_callback_index = (
            routing.RegisterUnaryTransitCallback(
                demand_callback
            )
        )

        # -----------------------------------------
        # CAPACITY CONSTRAINT
        # -----------------------------------------

        routing.AddDimensionWithVehicleCapacity(
            demand_callback_index,
            0,                      # No slack
            [
                int(capacity)
                for capacity in vehicle_capacities
            ],
            True,                   # Start cumul at zero
            "Weight"
        )

        # -----------------------------------------
        # Search parameters
        # -----------------------------------------

        search_parameters = (
            pywrapcp.DefaultRoutingSearchParameters()
        )

        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy
            .PATH_CHEAPEST_ARC
        )

        search_parameters.local_search_metaheuristic = (
            routing_enums_pb2.LocalSearchMetaheuristic
            .GUIDED_LOCAL_SEARCH
        )

        search_parameters.time_limit.seconds = 5

        # -----------------------------------------
        # Solve
        # -----------------------------------------

        solution = routing.SolveWithParameters(
            search_parameters
        )

        if not solution:
            return None

        # -----------------------------------------
        # Extract routes
        # -----------------------------------------

        routes = []

        for vehicle_id in range(
            vehicle_count
        ):

            index = routing.Start(
                vehicle_id
            )

            route = []

            while not routing.IsEnd(index):

                node = manager.IndexToNode(
                    index
                )

                route.append(node)

                index = solution.Value(
                    routing.NextVar(index)
                )

            # Add final depot
            route.append(
                manager.IndexToNode(index)
            )

            routes.append(route)

        return routes