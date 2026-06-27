from app.optimization.route_solver import RouteSolver

matrix = [
    [0, 5, 7, 8],
    [5, 0, 4, 6],
    [7, 4, 0, 3],
    [8, 6, 3, 0],
]

routes = RouteSolver.solve(
    distance_matrix=matrix,
    vehicle_count=2
)

print(routes)