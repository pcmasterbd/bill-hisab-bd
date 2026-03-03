import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { userNavItems } from "@/config/navItems";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Search, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  wholesalePrice: number;
  stock: number;
  category: string | null;
  isRawMaterial: boolean;
}

const Products = () => {
  const [activeTab, setActiveTab] = useState<"products" | "trash">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [productNameEn, setProductNameEn] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [description, setDescription] = useState("");
  const [isRawMaterial, setIsRawMaterial] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
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

  const resetForm = () => {
    setProductNameEn("");
    setSellingPrice("");
    setWholesalePrice("");
    setStockQty("");
    setDescription("");
    setIsRawMaterial(false);
    setIsEditing(false);
    setCurrentProductId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddProduct(true);
  };

  const openEditModal = (product: Product) => {
    setProductNameEn(product.name);
    setSellingPrice(product.price.toString());
    setWholesalePrice(product.wholesalePrice.toString());
    setStockQty(product.stock.toString());
    setDescription(product.description || "");
    setIsRawMaterial(product.isRawMaterial);
    setIsEditing(true);
    setCurrentProductId(product.id);
    setShowAddProduct(true);
  };

  const handleSaveProduct = async () => {
    if (!productNameEn || !sellingPrice) {
      toast.error("Product name and selling price are required");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${API_URL}/api/products/${currentProductId}`
        : `${API_URL}/api/products`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: productNameEn,
          description: description,
          price: parseFloat(sellingPrice),
          wholesalePrice: parseFloat(wholesalePrice) || 0,
          stock: parseInt(stockQty) || 0,
          isRawMaterial: isRawMaterial
        })
      });

      if (res.ok) {
        toast.success(`Product ${isEditing ? 'updated' : 'added'} successfully`);
        setShowAddProduct(false);
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.error || `Failed to ${isEditing ? 'update' : 'add'} product`);
      }
    } catch (error) {
      toast.error("Error saving product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete product");
      }
    } catch (error) {
      toast.error("Error deleting product");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={userNavItems} title="Product List" userRole="Client">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product List</h1>
          <p className="text-sm text-muted-foreground">Manage your products and pricing</p>
        </div>

        {/* Tabs + Add Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "products"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("trash")}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "trash"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Trash
            </button>
          </div>
          <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {activeTab === "products" ? (
          <>
            {/* Search */}
            <div className="relative">
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Retail/Wholesale</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Stock</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          Loading products...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                          No products found. Click "Add Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-card-foreground flex items-center gap-2">
                              {product.name}
                              {product.isRawMaterial && (
                                <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold uppercase">Raw</span>
                              )}
                            </div>
                            {product.description && <div className="text-xs text-muted-foreground mt-0.5">{product.description}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-card-foreground">R: ৳{product.price}</div>
                            <div className="text-xs text-muted-foreground">W: ৳{product.wholesalePrice}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={product.stock <= 5 ? "text-destructive font-bold" : ""}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                onClick={() => openEditModal(product)}
                                title="Edit Product"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => handleDeleteProduct(product.id)}
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Trash Tab */
          <div className="bg-card rounded-xl border border-border p-12 flex flex-col items-center justify-center">
            <Trash2 className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">Trash is empty</p>
            <p className="text-sm text-muted-foreground">Deleted items will appear here</p>
          </div>
        )}

        {/* Add/Edit Product Dialog */}
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Product Name <span className="text-destructive">*</span></label>
                <Input
                  placeholder="Enter product name"
                  value={productNameEn}
                  onChange={(e) => setProductNameEn(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Retail Price (৳) <span className="text-destructive">*</span></label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Wholesale Price (৳)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Stock Quantity</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={stockQty}
                    onChange={(e) => setStockQty(e.target.value)}
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      id="isRawMaterial"
                      checked={isRawMaterial}
                      onChange={(e) => setIsRawMaterial(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="isRawMaterial" className="text-sm font-medium text-muted-foreground">Raw Material?</label>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description (Optional)</label>
                <Input
                  placeholder="Brief description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
              <Button
                onClick={handleSaveProduct}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isEditing ? "Update" : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Products;
