import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Package, CheckCircle, Calendar, Plus, ArrowLeft, Search, Eye, Save, Trash2, Edit, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const CompanyOrders = () => {
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showCost, setShowCost] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // New Order State
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Supplier Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: "", phone: "", contactPerson: "", email: "", address: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        fetch(`${API_URL}/api/company-orders`, { headers }),
        fetch(`${API_URL}/api/suppliers`, { headers }),
        fetch(`${API_URL}/api/products`, { headers })
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (suppliersRes.ok) setSuppliers(await suppliersRes.json());
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
        costPrice: product.price // Using current price as default cost price
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

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const totalPieces = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSaveOrder = async (status: string = "DRAFT") => {
    if (!selectedSupplier) return toast.error("Please select a supplier");
    if (orderItems.length === 0) return toast.error("Please add at least one product");

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/company-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          supplierId: selectedSupplier,
          totalAmount,
          status,
          note,
          items: orderItems
        })
      });

      if (res.ok) {
        toast.success(`Order saved as ${status.toLowerCase()}`);
        setShowNewOrder(false);
        resetOrderForm();
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

  const resetOrderForm = () => {
    setSelectedSupplier("");
    setOrderItems([]);
    setNote("");
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name || !newSupplier.phone) return toast.error("Name and Phone are required");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/suppliers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSupplier)
      });

      if (res.ok) {
        const supplier = await res.json();
        setSuppliers([...suppliers, supplier]);
        setSelectedSupplier(supplier.id);
        setIsSupplierModalOpen(false);
        setNewSupplier({ name: "", phone: "", contactPerson: "", email: "", address: "" });
        toast.success("Supplier added");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add supplier");
      }
    } catch (error) {
      toast.error("Error adding supplier");
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/company-orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Order deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Error deleting order");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/company-orders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success("Status updated");
        fetchData();
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = productSearch
    ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5)
    : [];

  if (showNewOrder) {
    return (
      <DashboardLayout navItems={userNavItems} title="New Company Order" userRole="Client">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setShowNewOrder(false)} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-foreground">New Company Order</h1>
                  <p className="text-sm text-muted-foreground">Purchase demand for supplier</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cost View</span>
              <Switch checked={showCost} onCheckedChange={setShowCost} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Supplier Selection */}
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium">Select Supplier</label>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-primary" onClick={() => setIsSupplierModalOpen(true)}>
                    <UserPlus className="h-4 w-4" /> New Supplier
                  </Button>
                </div>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a supplier..." />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.phone})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Search & Add */}
              <div className="bg-card border border-border rounded-xl p-4">
                <label className="text-sm font-medium mb-4 block">Add Products</label>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name..."
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
                          <span className="text-xs text-muted-foreground">Stock: {p.stock}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                  {orderItems.length === 0 ? (
                    <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
                      No products added yet.
                    </div>
                  ) : (
                    <div className="border border-border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-4 py-2 text-left">Product</th>
                            <th className="px-4 py-2 text-center w-24">Qty</th>
                            {showCost && <th className="px-4 py-2 text-right w-32">Cost</th>}
                            <th className="px-4 py-2 text-right w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderItems.map(item => (
                            <tr key={item.productId} className="border-t border-border">
                              <td className="px-4 py-3 font-medium">{item.name}</td>
                              <td className="px-4 py-3">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleUpdateItem(item.productId, "quantity", parseInt(e.target.value) || 0)}
                                  className="h-8 text-center"
                                />
                              </td>
                              {showCost && (
                                <td className="px-4 py-3 text-right">
                                  <Input
                                    type="number"
                                    value={item.costPrice}
                                    onChange={(e) => handleUpdateItem(item.productId, "costPrice", parseFloat(e.target.value) || 0)}
                                    className="h-8 text-right"
                                  />
                                </td>
                              )}
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleRemoveItem(item.productId)} className="text-destructive hover:text-destructive/80">
                                  <Trash2 className="h-4 w-4" />
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
            </div>

            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-lg">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Unique Items</span>
                    <span>{orderItems.length}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Pieces</span>
                    <span>{totalPieces}</span>
                  </div>
                  <hr className="border-border" />
                  <div className="flex justify-between font-bold text-xl text-primary">
                    <span>Grand Total</span>
                    <span>৳{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Any special instructions..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSaveOrder("DRAFT")}
                    disabled={isSaving}
                  >
                    Save Draft
                  </Button>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleSaveOrder("SENT")}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* New Supplier Modal */}
        <Dialog open={isSupplierModalOpen} onOpenChange={setIsSupplierModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={newSupplier.name} onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Phone</label>
                <Input value={newSupplier.phone} onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Contact Person</label>
                <Input value={newSupplier.contactPerson} onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Address</label>
                <Input value={newSupplier.address} onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSupplierModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSupplier}>Add Supplier</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Company Orders" userRole="Client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Company Orders</h1>
            <p className="text-sm text-muted-foreground">Manage purchase demands for suppliers</p>
          </div>
          <Button onClick={() => setShowNewOrder(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <ClipboardList className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Package className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {orders.filter(o => o.status === 'DRAFT').length}
            </p>
            <p className="text-sm text-muted-foreground">Drafts</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {orders.filter(o => o.status === 'COMPLETED').length}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Calendar className="h-8 w-8 text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">
              {orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
            </p>
            <p className="text-sm text-muted-foreground">Today's</p>
          </div>
        </div>

        {/* List Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Order History</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-10 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-left">
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Order ID</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Supplier</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Items</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-primary">#{order.id.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-foreground">{order.supplier.name}</p>
                        <p className="text-xs text-muted-foreground">{order.supplier.phone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {order.items.length} items
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">
                        ৳{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          defaultValue={order.status}
                          onValueChange={(val) => handleStatusUpdate(order.id, val)}
                        >
                          <SelectTrigger className={`h-8 w-32 text-xs font-bold border-none ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            order.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyOrders;
