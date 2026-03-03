import {
  LayoutDashboard,
  FileText,
  Package,
  ClipboardList,
  Building2,
  Users,
  ShoppingCart,
  Truck,
  Webhook,
  BarChart3,
  CreditCard,
  Bot,
  Settings,
  LifeBuoy,
  Factory,
} from "lucide-react";

export const retailNavItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/user-dashboard", key: "dashboard" },
  { label: "Create Bill", icon: FileText, path: "/user-dashboard/create-bill", key: "createBill" },
  { label: "Product List", icon: Package, path: "/user-dashboard/products", key: "productList" },
  { label: "Stock Management", icon: ClipboardList, path: "/user-dashboard/stock", key: "stockManagement" },
  { label: "Customers", icon: Users, path: "/user-dashboard/customers", key: "customers" },
  { label: "Orders", icon: ShoppingCart, path: "/user-dashboard/orders", key: "orders" },
  { label: "Courier Integration", icon: Truck, path: "/user-dashboard/courier", key: "courierIntegration" },
  { label: "Invoices", icon: FileText, path: "/user-dashboard/invoices", key: "invoices" },
  { label: "Reports", icon: BarChart3, path: "/user-dashboard/reports", key: "reports" },
  { label: "AI Assistant", icon: Bot, path: "/user-dashboard/ai-assistant", key: "aiAssistant" },
  { label: "Settings", icon: Settings, path: "/user-dashboard/settings", key: "settings" },
  { label: "Support", icon: LifeBuoy, path: "/user-dashboard/support", key: "support" },
];

export const wholesaleNavItems = [
  { label: "Wholesale Dashboard", icon: LayoutDashboard, path: "/user-dashboard", key: "wholesaleDashboard" },
  { label: "Wholesale Orders", icon: ShoppingCart, path: "/user-dashboard/wholesale-orders", key: "wholesaleOrders" },
  { label: "Wholesale Customers", icon: Users, path: "/user-dashboard/customers", key: "wholesaleCustomers" },
  { label: "Stock Management", icon: ClipboardList, path: "/user-dashboard/stock", key: "stockManagement" },
  { label: "Product List", icon: Package, path: "/user-dashboard/products", key: "productList" },
  { label: "Settings", icon: Settings, path: "/user-dashboard/settings", key: "settings" },
  { label: "Support", icon: LifeBuoy, path: "/user-dashboard/support", key: "support" },
];

export const userNavItems = retailNavItems; // Fallback or default
