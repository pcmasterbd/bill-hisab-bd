import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Settings,
    BarChart3,
    Activity,
    Package,
    ShoppingCart,
    UserPlus
} from "lucide-react";

export const adminNavItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/admin-dashboard", key: "overview" },
    { label: "User Management", icon: Users, path: "/admin-dashboard", key: "userManagement" },
    { label: "Products", icon: Package, path: "/admin-dashboard/products", key: "products" },
    { label: "Client", icon: UserPlus, path: "/admin-dashboard/customers", key: "adminClients" },
    { label: "Orders", icon: ShoppingCart, path: "/admin-dashboard/orders", key: "orders" },
    { label: "Roles & Permissions", icon: ShieldCheck, path: "/admin-dashboard/roles", key: "rolesPermissions" },
    { label: "Analytics", icon: BarChart3, path: "/admin-dashboard/analytics", key: "analytics" },
    { label: "System Health", icon: Activity, path: "/admin-dashboard/system", key: "systemHealth" },
    { label: "Settings", icon: Settings, path: "/admin-dashboard/settings", key: "settings" },
];
