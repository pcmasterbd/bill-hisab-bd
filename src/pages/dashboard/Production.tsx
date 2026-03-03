import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Factory, Plus, Search, Trash2, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

const Production = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // New Production Entry State
    const [selectedProductId, setSelectedProductId] = useState("");
    const [productionQty, setProductionQty] = useState("1");
    const [components, setComponents] = useState<any[]>([]);
    const [rawSearch, setRawSearch] = useState("");

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
                setProducts(await res.json());
            }
        } catch (error) {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleAddRawMaterial = (product: any) => {
        if (product.id === selectedProductId) return toast.error("Cannot use the same product as raw material");
        if (components.find(c => c.productId === product.id)) return;

        setComponents([...components, {
            productId: product.id,
            name: product.name,
            quantity: 1
        }]);
        setRawSearch("");
    };

    const handleUpdateComponent = (productId: string, quantity: number) => {
        setComponents(components.map(c =>
            c.productId === productId ? { ...c, quantity } : c
        ));
    };

    const handleRemoveComponent = (productId: string) => {
        setComponents(components.filter(c => c.productId !== productId));
    };

    const handleSaveProduction = async () => {
        if (!selectedProductId) return toast.error("Please select a product to produce");
        if (components.length === 0) return toast.error("Please add at least one raw material");

        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/production`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: selectedProductId,
                    quantity: parseInt(productionQty),
                    components: components
                })
            });

            if (res.ok) {
                toast.success("Production recorded successfully");
                resetForm();
                fetchProducts();
            } else {
                const data = await res.json();
                toast.error(data.error || "Failed to record production");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setSelectedProductId("");
        setProductionQty("1");
        setComponents([]);
        setRawSearch("");
    };

    const finishedGoods = products.filter(p => !p.isRawMaterial);
    const rawMaterials = products.filter(p => p.isRawMaterial);

    const filteredRaw = rawSearch
        ? rawMaterials.filter(p => p.name.toLowerCase().includes(rawSearch.toLowerCase())).slice(0, 5)
        : [];

    return (
        <DashboardLayout navItems={userNavItems} title="Production" userRole="Client">
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <Factory className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Production Management</h1>
                        <p className="text-sm text-muted-foreground">Convert raw materials into finished products</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Production Form */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                        <h3 className="font-bold text-lg border-b border-border pb-2">Record Production</h3>

                        {/* Target Product */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product to Produce</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                            >
                                <option value="">Select Finished Good</option>
                                {finishedGoods.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity to Produce</label>
                            <Input
                                type="number"
                                value={productionQty}
                                onChange={(e) => setProductionQty(e.target.value)}
                                min="1"
                            />
                        </div>

                        <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={handleSaveProduction}
                            disabled={isSaving || loading}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Complete Production
                        </Button>
                    </div>

                    {/* Components / Raw Materials */}
                    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                        <h3 className="font-bold text-lg border-b border-border pb-2">Required Raw Materials</h3>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search raw materials..."
                                className="pl-10"
                                value={rawSearch}
                                onChange={(e) => setRawSearch(e.target.value)}
                            />
                            {filteredRaw.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                                    {filteredRaw.map(p => (
                                        <button
                                            key={p.id}
                                            className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex justify-between items-center"
                                            onClick={() => handleAddRawMaterial(p)}
                                        >
                                            <span className="text-sm">{p.name}</span>
                                            <span className="text-[10px] bg-orange-50 text-orange-600 px-1 rounded font-bold">Stock: {p.stock}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                            {components.length === 0 ? (
                                <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-sm">
                                    Add raw materials used in this production.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {components.map(item => (
                                        <div key={item.productId} className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{item.name}</p>
                                            </div>
                                            <div className="w-24">
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    className="h-8 text-center"
                                                    onChange={(e) => handleUpdateComponent(item.productId, parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive px-0"
                                                onClick={() => handleRemoveComponent(item.productId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Production;
