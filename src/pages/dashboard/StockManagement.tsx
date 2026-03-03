import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Package, CheckCircle, AlertTriangle, XCircle, Search, Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Product {
  id: string;
  name: string;
  category: string | null;
  price: number;
  stock: number;
}

const StockManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        toast.error("Failed to load products");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stock.toString());
    setIsUpdateModalOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    const stockValue = parseInt(newStock);
    if (isNaN(stockValue) || stockValue < 0) {
      toast.error("Please enter a valid stock quantity (0 or more)");
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // We only send the fields we want to update, effectively patching it
        // The backend expects all fields or optional, based on the PUT logic
        body: JSON.stringify({
          stock: stockValue,
        }),
      });

      if (res.ok) {
        toast.success(`Stock updated for ${selectedProduct.name}`);
        setIsUpdateModalOpen(false);
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update stock");
      }
    } catch (error) {
      toast.error("Error updating stock");
    } finally {
      setIsUpdating(false);
    }
  };

  // Compute stats
  const totalProducts = products.length;
  const inStock = products.filter((p) => p.stock > 10).length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={userNavItems} title="Stock Management" userRole="Client">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock Management</h1>
          <p className="text-sm text-muted-foreground">Manage and track your inventory levels</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border-2 border-primary/30 rounded-xl p-4">
            <Package className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{inStock}</p>
            <p className="text-sm text-muted-foreground">In Stock (&gt;10)</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{lowStock}</p>
            <p className="text-sm text-muted-foreground">Low Stock (1-10)</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <XCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{outOfStock}</p>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Current Stock</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No products found. Include some products in the Product List.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    let statusBadge = null;
                    if (product.stock === 0) {
                      statusBadge = <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500">Out of Stock</span>;
                    } else if (product.stock <= 10) {
                      statusBadge = <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-500">Low Stock</span>;
                    } else {
                      statusBadge = <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500">In Stock</span>;
                    }

                    return (
                      <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {product.category || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                          ৳ {product.price}
                        </td>
                        <td className="px-4 py-3">
                          {statusBadge}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => openUpdateModal(product)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Update Stock
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Update Stock Modal */}
        <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Update Stock</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Adjust stock for <span className="text-foreground font-semibold">{selectedProduct?.name}</span>
              </label>
              <Input
                type="number"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
                className="mt-2 text-lg font-medium"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the absolute new inventory count for this product.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStock} disabled={isUpdating}>
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StockManagement;
