from ortools.constraint_solver import pywrapcp
from ortools.constraint_solver import routing_enums_pb2


class RouteSolver:

    @staticmethod
    def solve(distance_matrix, vehicle_count, depot=0):

        manager = pywrapcp.RoutingIndexManager(
            len(distance_matrix),
            vehicle_count,
            depot
        )

        routing = pywrapcp.RoutingModel(manager)

        def distance_callback(from_index, to_index):

            from_node = manager.IndexToNode(from_index)
            to_node = manager.IndexToNode(to_index)

            return distance_matrix[from_node][to_node]

        transit_callback_index = routing.RegisterTransitCallback(
            distance_callback
        )

        routing.SetArcCostEvaluatorOfAllVehicles(
            transit_callback_index
        )

        search_parameters = (
            pywrapcp.DefaultRoutingSearchParameters()
        )

        search_parameters.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )

        solution = routing.SolveWithParameters(search_parameters)

        if not solution:
            return None

        routes = []

        for vehicle_id in range(vehicle_count):

            index = routing.Start(vehicle_id)

            route = []

            while not routing.IsEnd(index):

                route.append(
                    manager.IndexToNode(index)
                )

                index = solution.Value(
                    routing.NextVar(index)
                )

            route.append(manager.IndexToNode(index))

            routes.append(route)

        return routes