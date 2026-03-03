import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { userNavItems } from "@/config/navItems";
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  Trash2,
  Edit,
  Loader2,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { API_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const statusStyles: Record<string, string> = {
  Completed: "bg-success/10 text-success",
  DELIVERED: "bg-success/10 text-success",
  Pending: "bg-warning/10 text-warning",
  PENDING: "bg-warning/10 text-warning",
  Processing: "bg-info/10 text-info",
  PROCESSING: "bg-info/10 text-info",
  SHIPPED: "bg-primary/10 text-primary",
  Cancelled: "bg-destructive/10 text-destructive",
  CANCELLED: "bg-destructive/10 text-destructive",
};

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [trashOrders, setTrashOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  // Update Status Modal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchTrashOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrashOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/trash`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTrashOrders(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch trash orders");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Move this order to trash?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Order moved to trash");
        fetchOrders();
        fetchTrashOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete order");
      }
    } catch (error) {
      toast.error("Error deleting order");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Order restored successfully");
        fetchOrders();
        fetchTrashOrders();
      }
    } catch (error) {
      toast.error("Failed to restore order");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm("This will permanently delete the order. Action cannot be undone!")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${id}/permanent`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Order deleted permanently");
        fetchTrashOrders();
      }
    } catch (error) {
      toast.error("Failed to delete order permanently");
    }
  };

  const openUpdateModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        toast.success("Order status updated");
        setIsUpdateModalOpen(false);
        fetchOrders();
      }
    } catch (error) {
      toast.error("Error updating status");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentList = activeTab === "active" ? orders : trashOrders;
  const filteredOrders = currentList.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.phone.includes(searchTerm)
  );

  // Compute stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.payableAmount : 0), 0);

  return (
    <DashboardLayout navItems={userNavItems} title="Orders" userRole="User">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          change="Active orders"
          changeType="neutral"
          icon={<ShoppingCart className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Pending"
          value={pendingOrders.toString()}
          change="Needs processing"
          changeType="negative"
          icon={<ShoppingCart className="w-5 h-5 text-warning" />}
          iconBg="bg-warning/10"
        />
        <StatCard
          title="Delivered"
          value={completedOrders.toString()}
          change="Successfully fulfilled"
          changeType="positive"
          icon={<ShoppingCart className="w-5 h-5 text-success" />}
          iconBg="bg-success/10"
        />
        <StatCard
          title="Total Revenue"
          value={`৳ ${totalRevenue.toLocaleString()}`}
          change="Excludes cancelled"
          changeType="positive"
          icon={<ShoppingCart className="w-5 h-5 text-info" />}
          iconBg="bg-info/10"
        />
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="active" className="gap-2">
              Active Orders
              <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {orders.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="trash" className="gap-2">
              Trash
              <span className="bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                {trashOrders.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9 h-9 w-full sm:w-64 bg-secondary/50 border-border text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {activeTab === "active" && (
              <Button size="sm" className="gap-1.5 bg-orange-500 hover:bg-orange-600 shadow-sm" asChild>
                <Link to="/user-dashboard/create-bill">
                  <Plus className="w-4 h-4" /> New Order
                </Link>
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="active" className="mt-0">
          <OrderTable
            orders={filteredOrders}
            loading={loading}
            type="active"
            onUpdateStatus={openUpdateModal}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="trash" className="mt-0">
          <OrderTable
            orders={filteredOrders}
            loading={loading}
            type="trash"
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
          />
        </TabsContent>
      </Tabs>

      {/* Update Status Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Status for Order #{selectedOrder?.id?.split('-')[0]}
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdating} className="bg-orange-500 hover:bg-orange-600 text-white">
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

const OrderTable = ({ orders, loading, type, onUpdateStatus, onDelete, onRestore, onPermanentDelete }: any) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left border-b border-border">
              <th className="px-6 py-3 font-bold text-muted-foreground">Order ID</th>
              <th className="px-6 py-3 font-bold text-muted-foreground">Customer</th>
              <th className="px-6 py-3 font-bold text-muted-foreground">Items</th>
              <th className="px-6 py-3 font-bold text-muted-foreground">Amount</th>
              <th className="px-6 py-3 font-bold text-muted-foreground">Status</th>
              <th className="px-6 py-3 font-bold text-muted-foreground">Date</th>
              <th className="px-6 py-3 font-bold text-muted-foreground text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground font-medium">Loading orders...</p>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
                    <p className="font-medium">No {type} orders found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">
                    #{order.id.split('-')[0].toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-card-foreground">{order.customer.name}</div>
                    <div className="text-xs text-muted-foreground">{order.customer.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs font-medium border border-border">
                      {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} items
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-card-foreground">
                    ৳{order.payableAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusStyles[order.status] || 'bg-secondary text-secondary-foreground'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {type === "active" ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                            onClick={() => onUpdateStatus(order)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(order.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-success hover:bg-success/10"
                            onClick={() => onRestore(order.id)}
                            title="Restore Order"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => onPermanentDelete(order.id)}
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
