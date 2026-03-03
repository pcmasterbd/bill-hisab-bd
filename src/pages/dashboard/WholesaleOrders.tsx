import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, Plus, Search, Trash2, Loader2, UserPlus, RefreshCcw, CheckCircle, Clock, XCircle, Trash } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

const WholesaleOrders = () => {
  const [activeTab, setActiveTab] = useState<"orders" | "trash">("orders");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [trashOrders, setTrashOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New Order State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [laborCost, setLaborCost] = useState<string>("0");
  const [discount, setDiscount] = useState<string>("0");
  const [paidAmount, setPaidAmount] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // New Customer Modal
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, trashRes, customersRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/wholesale-orders`, { headers }),
        fetch(`${API_URL}/api/wholesale-orders/trash`, { headers }),
        fetch(`${API_URL}/api/customers`, { headers }),
        fetch(`${API_URL}/api/products`, { headers })
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (trashRes.ok) setTrashOrders(await trashRes.json());
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product: any) => {
    if (orderItems.find(item => item.productId === product.id)) {
      setOrderItems(orderItems.map(item =>
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.wholesalePrice || product.price
      }]);
    }
    setProductSearch("");
  };

  const handleRemoveItem = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const handleUpdateItem = (productId: string, field: string, value: any) => {
    setOrderItems(orderItems.map(item =>
      item.productId === productId ? { ...item, [field]: value } : item
    ));
  };

  const subtotal = orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const grandTotal = subtotal - Number(discount) + Number(laborCost);
  const balanced = grandTotal - Number(paidAmount);

  const handleSaveOrder = async () => {
    if (!selectedCustomerId) return toast.error("Please select a customer");
    if (orderItems.length === 0) return toast.error("Please add at least one product");

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wholesale-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          totalAmount: grandTotal, // Grand total including labor & discount
          discount: Number(discount),
          laborCost: Number(laborCost),
          paidAmount: Number(paidAmount),
          payableAmount: grandTotal,
          status: "COMPLETED", // Wholesale orders likely completed immediately?
          note: notes,
          items: orderItems
        })
      });

      if (res.ok) {
        toast.success("Wholesale order saved successfully");
        setShowAddOrder(false);
        resetForm();
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save order");
      }
    } catch (error) {
      toast.error("Error saving order");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomerId("");
    setOrderItems([]);
    setLaborCost("0");
    setDiscount("0");
    setPaidAmount("0");
    setNotes("");
  };

  const handleMoveToTrash = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wholesale-orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Order moved to trash");
        fetchData();
      }
    } catch (error) {
      toast.error("Error moving to trash");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wholesale-orders/${id}/restore`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Order restored");
        fetchData();
      }
    } catch (error) {
      toast.error("Error restoring order");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/wholesale-orders/${id}/permanent`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Order deleted permanently");
        fetchData();
      }
    } catch (error) {
      toast.error("Error deleting order");
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) return toast.error("Name and Phone are required");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCustomer)
      });

      if (res.ok) {
        const customer = await res.json();
        setCustomers([...customers, customer]);
        setSelectedCustomerId(customer.id);
        setShowAddCustomer(false);
        setNewCustomer({ name: "", phone: "" });
        toast.success("Customer added");
      }
    } catch (error) {
      toast.error("Error adding customer");
    }
  };

  const displayOrders = activeTab === "orders" ? orders : trashOrders;
  const filteredOrders = displayOrders.filter(o =>
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5)
    : [];

  return (
    <DashboardLayout navItems={userNavItems} title="Wholesale Orders" userRole="Client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Wholesale Orders</h1>
              <p className="text-sm text-muted-foreground">Total {orders.length} orders</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddOrder(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Order
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === "orders"
              ? "bg-muted text-primary border-t border-x border-border font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("trash")}
            className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === "trash"
              ? "bg-muted text-primary border-t border-x border-border font-bold"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            Trash ({trashOrders.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or customer..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-orange-600">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{order.customer.name}</p>
                        <p className="text-xs text-muted-foreground">{order.customer.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold">৳{order.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Paid: ৳{order.paidAmount}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {activeTab === "orders" ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleMoveToTrash(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-green-600"
                              onClick={() => handleRestore(order.id)}
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handlePermanentDelete(order.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Order Dialog */}
        <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
                New Wholesale Order
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-2">
              {/* Customer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Customer</label>
                  <button onClick={() => setShowAddCustomer(true)} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Plus className="h-3 w-3" /> New Customer
                  </button>
                </div>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name} ({c.phone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products */}
              <div>
                <label className="text-sm font-medium mb-2 block">Products</label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                      {filteredProducts.map(p => (
                        <button
                          key={p.id}
                          className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex justify-between items-center"
                          onClick={() => handleAddProduct(p)}
                        >
                          <span>{p.name}</span>
                          <span className="text-xs text-muted-foreground">W: ৳{p.wholesalePrice} | R: ৳{p.price} | Stock: {p.stock}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {orderItems.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                      No products added yet.
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left">Product</th>
                            <th className="px-3 py-2 text-center w-16">Qty</th>
                            <th className="px-3 py-2 text-right w-24">Price</th>
                            <th className="px-3 py-2 text-right w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {orderItems.map(item => (
                            <tr key={item.productId}>
                              <td className="px-3 py-2 font-medium">{item.name}</td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  className="h-7 text-center px-1"
                                  onChange={(e) => handleUpdateItem(item.productId, "quantity", parseInt(e.target.value) || 0)}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <Input
                                  type="number"
                                  value={item.price}
                                  className="h-7 text-right px-1"
                                  onChange={(e) => handleUpdateItem(item.productId, "price", parseFloat(e.target.value) || 0)}
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <button onClick={() => handleRemoveItem(item.productId)} className="text-destructive">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Costs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Labor Cost</label>
                  <Input
                    type="number"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Discount</label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm border border-border/50">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-border pt-2">
                  <span>Grand Total</span>
                  <span className="text-orange-600">৳{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Paid Amount</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="h-9 font-bold text-orange-600"
                  />
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] text-muted-foreground uppercase">Balanced</p>
                    <p className={`font-bold ${balanced <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ৳{balanced.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none"
                  placeholder="Any internal notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddOrder(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveOrder}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Save Wholesale Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Customer Modal */}
        <Dialog open={showAddCustomer} onOpenChange={setShowAddCustomer}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
              <Button onClick={handleAddCustomer} className="bg-orange-500 hover:bg-orange-600 text-white">
                Add Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default WholesaleOrders;
