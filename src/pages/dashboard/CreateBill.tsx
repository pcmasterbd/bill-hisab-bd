import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Search, ShoppingCart, Package, Send, Copy, Minus, Plus, Trash2, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

const CreateBill = () => {
  const [pasteText, setPasteText] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [area, setArea] = useState("");

  const [discountAmount, setDiscountAmount] = useState<string>("0");
  const [advance, setAdvance] = useState<string>("0");
  const [deliveryCharge, setDeliveryCharge] = useState<string>("0");
  const [note, setNote] = useState("Handle with care. Refund if damaged.");

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Loading States
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed Values
  const productPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const totalPayable = productPrice + Number(deliveryCharge || 0) - Number(discountAmount || 0) - Number(advance || 0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleParseAutoFill = () => {
    const lines = pasteText.split("\n");
    lines.forEach((line) => {
      const lower = line.toLowerCase().trim();
      if (lower.startsWith("name:")) setCustomerName(line.split(":")[1]?.trim() || "");
      if (lower.startsWith("phone:")) setPhone(line.split(":")[1]?.trim() || "");
      if (lower.startsWith("district:")) setDistrict(line.split(":")[1]?.trim() || "");
      if (lower.startsWith("thana:")) setThana(line.split(":")[1]?.trim() || "");
      if (lower.startsWith("area:") || lower.startsWith("address:")) setArea(line.split(":")[1]?.trim() || "");
    });
    toast.success("Parsed text successfully");
  };

  const handleCheckCustomer = async () => {
    if (!phone) {
      toast.error("Please enter a phone number to search");
      return;
    }

    try {
      setIsCheckingCustomer(true);
      const token = localStorage.getItem("token");
      // For a better implementation, the backend should have a /search?phone= API
      // Here we fetch all and find, which works for small datasets.
      const res = await fetch(`${API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        const existingCustomer = data.find((c: any) => c.phone === phone);

        if (existingCustomer) {
          setCustomerName(existingCustomer.name || "");
          setDistrict(existingCustomer.district || "");
          setThana(existingCustomer.thana || "");
          setArea(existingCustomer.address || "");
          toast.success("Customer found and auto-filled!");
        } else {
          toast.info("Customer not found. A new one will be created.");
        }
      }
    } catch (error) {
      toast.error("Error checking customer details");
    } finally {
      setIsCheckingCustomer(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleCreateOrder = async () => {
    if (!customerName || !phone) {
      toast.error("Customer name and phone are required");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      // 1. Create or Find Customer
      let customerId = "";

      const resCustomers = await fetch(`${API_URL}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allCustomers = await resCustomers.json();
      const existing = allCustomers.find((c: any) => c.phone === phone);

      if (existing) {
        customerId = existing.id;
      } else {
        const createCustRes = await fetch(`${API_URL}/api/customers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: customerName,
            phone,
            district,
            thana,
            address: area
          })
        });

        if (!createCustRes.ok) throw new Error("Failed to create customer");
        const newCust = await createCustRes.json();
        customerId = newCust.id;
      }

      // 2. Create Order
      const orderData = {
        customerId,
        totalAmount: productPrice,
        discount: Number(discountAmount),
        advance: Number(advance),
        payableAmount: totalPayable,
        status: "PENDING",
        note,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const resOrder = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!resOrder.ok) throw new Error("Failed to create order");

      toast.success("Order created successfully!");

      // Reset Form
      setPasteText("");
      setCustomerName("");
      setPhone("");
      setDistrict("");
      setThana("");
      setArea("");
      setDiscountAmount("0");
      setAdvance("0");
      setDeliveryCharge("0");
      setNote("Handle with care. Refund if damaged.");
      setCart([]);

    } catch (error) {
      console.error(error);
      toast.error("An error occurred while creating the order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={userNavItems} title="Create Bill" userRole="Client">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Create Bill</h1>
        <p className="text-sm text-muted-foreground">Paste customer info or fill manually to generate a bill</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        {/* Left Column - Forms */}
        <div className="lg:col-span-3 space-y-6">
          {/* Paste Customer Info */}
          <div className="border border-border rounded-xl p-5 space-y-4 bg-card">
            <h2 className="font-semibold flex items-center gap-2 text-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              Paste Customer Info
            </h2>
            <Textarea
              placeholder={`Paste customer details here...\n\nExample:\nName: John Doe\nPhone: 01712345678\nDistrict: Dhaka`}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={4}
            />
            <Button
              onClick={handleParseAutoFill}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Parse & Auto-Fill
            </Button>
          </div>

          {/* Customer Details */}
          <div className="border border-border rounded-xl p-5 space-y-4 bg-card">
            <h2 className="font-semibold text-foreground">Customer Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  👤 Customer Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Enter name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  📞 Phone Number <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    className="gap-1.5 shrink-0"
                    onClick={handleCheckCustomer}
                    disabled={isCheckingCustomer}
                  >
                    {isCheckingCustomer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Check
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                📍 District
              </label>
              <Input
                placeholder="e.g., Dhaka"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Thana / Upazila
                </label>
                <Input
                  placeholder="e.g., Mirpur"
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Area / Address
                </label>
                <Input
                  placeholder="Full address"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border border-border rounded-xl p-5 space-y-4 bg-card flex flex-col h-[500px]">
            <h2 className="font-semibold text-foreground flex-shrink-0">Product Details</h2>
            <label className="text-sm font-medium flex items-center gap-1.5 flex-shrink-0">
              <Package className="h-4 w-4 text-primary" />
              Select Products <span className="text-destructive">*</span>
            </label>
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto min-h-0 border rounded-lg divide-y bg-muted/10">
              {loadingProducts ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex justify-center items-center h-full text-sm text-muted-foreground">
                  No products found.
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="p-3 flex items-center justify-between hover:bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">৳{product.price} • Stock: {product.stock}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => addToCart(product)}
                      className="h-8 shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Bill Preview */}
        <div className="lg:col-span-2">
          <div className="border border-border rounded-xl overflow-hidden bg-card sticky top-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Bill Preview
              </h2>
            </div>

            <div className="p-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* Info rows */}
              {[
                { label: "Name:", value: customerName },
                { label: "Phone:", value: phone },
                { label: "District:", value: district },
                { label: "Thana:", value: thana },
                { label: "Area:", value: area },
              ].map((item) => (
                <div key={item.label} className="flex justify-between text-sm border-b border-border pb-2">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-foreground font-medium">{item.value || <Minus className="h-4 w-4 text-muted-foreground" />}</span>
                </div>
              ))}

              <div className="pt-2">
                <span className="text-sm text-muted-foreground block mb-2">Cart Items:</span>
                {cart.length === 0 ? (
                  <div className="text-xs text-center p-4 border border-dashed rounded bg-muted/20 text-muted-foreground">
                    Cart is empty. Select products from the left.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex flex-col gap-1 p-2 border rounded-md bg-muted/10">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium line-clamp-2 pr-2">{item.name}</span>
                          <span className="text-sm font-bold whitespace-nowrap">৳{item.price * item.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-muted-foreground">৳{item.price} each</span>
                          <div className="flex items-center gap-2 bg-background border rounded-md">
                            <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded-l-md"><Minus className="h-3 w-3" /></button>
                            <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /></button>
                            <button type="button" onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-destructive/10 text-destructive rounded-r-md border-l"><Trash2 className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Product Price:</span>
                  <span className="text-foreground font-medium">৳{productPrice}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Delivery Charge:</span>
                  <Input
                    type="number"
                    className="h-7 w-20 text-right text-xs"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                  />
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Discount:</span>
                  <Input
                    type="number"
                    className="h-7 w-20 text-right text-xs"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                  />
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Advance:</span>
                  <Input
                    type="number"
                    className="h-7 w-20 text-right text-xs"
                    value={advance}
                    onChange={(e) => setAdvance(e.target.value)}
                  />
                </div>
              </div>

              {/* Note */}
              <div className="pt-2">
                <label className="text-sm text-muted-foreground mb-1.5 block">Note (Optional)</label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold py-3 mt-2 border-y border-border bg-muted/5 -mx-4 px-4 shadow-sm">
                <span>Total Payable:</span>
                <span className={totalPayable < 0 ? "text-destructive" : "text-primary"}>
                  ৳{totalPayable > 0 ? totalPayable : 0}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="outline" className="gap-1.5 border-primary text-primary hover:bg-primary/5">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" className="gap-1.5">
                  <Send className="h-4 w-4" />
                  Share
                </Button>
              </div>
              <Button
                onClick={handleCreateOrder}
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-1.5 py-6 text-base shadow-md"
              >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                {isSubmitting ? "Processing..." : "Create Order"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateBill;
