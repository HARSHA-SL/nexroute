import {
    LayoutDashboard,
    Users,
    Truck,
    Warehouse,
    Route,
    Sparkles,
    BarChart3,
    Bell,
    Settings,
} from "lucide-react";

export const navigation = [
    {
        label: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
    },
    {
        label: "Drivers",
        path: "/drivers",
        icon: Users,
    },
    {
        label: "Vehicles",
        path: "/vehicles",
        icon: Truck,
    },
    {
        label: "Warehouses",
        path: "/warehouses",
        icon: Warehouse,
    },
    {
        label: "Routes",
        path: "/routes",
        icon: Route,
    },
    {
        label: "Optimization",
        path: "/optimization",
        icon: Sparkles,
    },
    {
        label: "Analytics",
        path: "/analytics",
        icon: BarChart3,
    },
    {
        label: "Notifications",
        path: "/notifications",
        icon: Bell,
    },
    {
        label: "Settings",
        path: "/settings",
        icon: Settings,
    },
];