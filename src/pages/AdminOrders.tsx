import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Trash2,
    Loader2,
    ShoppingCart,
    Calendar,
    CheckCircle2,
    Clock,
    Ban,
    TrendingUp,
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Order {
    id: string;
    totalAmount: number;
    payableAmount: number;
    status: string;
    createdAt: string;
    customer: {
        name: string;
        phone: string;
    };
}

const statusStyles: Record<string, string> = {
    PENDING: "bg-warning/10 text-warning border-warning/20",
    PROCESSING: "bg-info/10 text-info border-info/20",
    SHIPPED: "bg-primary/10 text-primary border-primary/20",
    DELIVERED: "bg-success/10 text-success border-success/20",
    CANCELLED: "bg-destructive/10 text-destructive border-destructive/20",
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch orders");
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            toast.error("Error loading orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/orders/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update status");
            toast.success("Order status updated");
            fetchOrders();
        } catch (error) {
            toast.error("Error updating status");
        }
    };

    const handleDeleteOrder = async (id: string) => {
        if (!confirm("Are you sure you want to delete this order?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/orders/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete order");
            toast.success("Order deleted");
            fetchOrders();
        } catch (error) {
            toast.error("Error deleting order");
        }
    };

    return (
        <DashboardLayout navItems={adminNavItems} title="Global Orders" userRole="Admin">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-card-foreground">Global Order Management</h3>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-muted-foreground animate-pulse">Tracking orders...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {orders.length === 0 ? (
                                    <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic">No orders history available.</td></tr>
                                ) : orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10 truncate block w-24">
                                                #{order.id.split("-")[0]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-semibold">{order.customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold">৳{order.payableAmount}</p>
                                            <p className="text-[10px] text-muted-foreground line-through">৳{order.totalAmount}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Select
                                                value={order.status}
                                                onValueChange={(val) => handleUpdateStatus(order.id, val)}
                                            >
                                                <SelectTrigger className={`h-8 w-32 text-[10px] font-bold uppercase border ${statusStyles[order.status]}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PENDING" className="text-[10px] uppercase font-bold text-warning">Pending</SelectItem>
                                                    <SelectItem value="PROCESSING" className="text-[10px] uppercase font-bold text-info">Processing</SelectItem>
                                                    <SelectItem value="SHIPPED" className="text-[10px] uppercase font-bold text-primary">Shipped</SelectItem>
                                                    <SelectItem value="DELIVERED" className="text-[10px] uppercase font-bold text-success">Delivered</SelectItem>
                                                    <SelectItem value="CANCELLED" className="text-[10px] uppercase font-bold text-destructive">Cancelled</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteOrder(order.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminOrders;
