import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Truck, Power, Settings2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const courierIcons: Record<string, string> = {
  Steadfast: "🚚",
  Pathao: "🚗",
  RedX: "📦",
  Paperfly: "✈️",
};

const courierDescriptions: Record<string, string> = {
  Steadfast: "Reliable courier service with nationwide coverage",
  Pathao: "Fast delivery with real-time tracking (OAuth 2.0)",
  RedX: "Affordable shipping solutions (Bearer Token)",
  Paperfly: "Express delivery across Bangladesh",
};

const CourierIntegration = () => {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Setup Form State
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [apiBaseUrl, setApiBaseUrl] = useState("");
  const [senderId, setSenderId] = useState("");

  useEffect(() => {
    fetchCouriers();
  }, []);

  const fetchCouriers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/couriers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCouriers(await res.json());
      }
    } catch (error) {
      toast.error("Failed to load courier configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/couriers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (res.ok) {
        toast.success(`Courier ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchCouriers();
      }
    } catch (error) {
      toast.error("Failed to toggle courier status");
    }
  };

  const openSetupModal = (courier: any) => {
    setSelectedCourier(courier);
    setApiKey(courier.apiKey || "");
    setApiSecret(courier.apiSecret || "");
    setApiBaseUrl(courier.apiBaseUrl || "");
    setSenderId(courier.senderId || "");
    setIsSetupModalOpen(true);
  };

  const handleSaveSetup = async () => {
    if (!selectedCourier) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/couriers/${selectedCourier.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          apiKey,
          apiSecret,
          apiBaseUrl,
          senderId
        })
      });

      if (res.ok) {
        toast.success(`${selectedCourier.name} configuration saved`);
        setIsSetupModalOpen(false);
        fetchCouriers();
      }
    } catch (error) {
      toast.error("Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={userNavItems} title="Courier Integration" userRole="Client">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Courier Integration</h1>
            <p className="text-sm text-muted-foreground">Connect and configure your preferred courier services</p>
          </div>
        </div>

        {/* Courier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Loading configurations...</p>
            </div>
          ) : couriers.map((courier) => (
            <div key={courier.name} className={`bg-card border transition-all duration-300 rounded-xl p-5 ${courier.isActive ? 'border-primary/50 shadow-md' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{courierIcons[courier.name] || '📦'}</span>
                  <h3 className="font-bold text-lg text-foreground">{courier.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${courier.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {courier.isActive ? 'Online' : 'Offline'}
                  </span>
                  <Switch
                    checked={courier.isActive}
                    onCheckedChange={() => handleToggle(courier.id, courier.isActive)}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6 h-10 overflow-hidden">
                {courierDescriptions[courier.name] || 'Courier service integration'}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex -space-x-2">
                  {courier.apiKey ? (
                    <div className="h-6 w-6 rounded-full border-2 border-background bg-success flex items-center justify-center" title="API Key Configured">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-background bg-muted flex items-center justify-center" title="API Key Missing">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <Button
                  variant={courier.apiKey ? "outline" : "default"}
                  size="sm"
                  className={`gap-1.5 ${!courier.apiKey && !courier.isActive ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                  onClick={() => openSetupModal(courier)}
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  {courier.apiKey ? 'Configure' : 'Setup Now'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Modal */}
      <Dialog open={isSetupModalOpen} onOpenChange={setIsSetupModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{courierIcons[selectedCourier?.name]}</span>
              {selectedCourier?.name} Integration
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key / Client ID</label>
              <Input
                placeholder="Enter your API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">API Secret / Password</label>
              <Input
                type="password"
                placeholder="Enter your Secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Base URL (Optional)</label>
              <Input
                placeholder="https://api.courier.com/v1"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sender/Store ID (Optional)</label>
              <Input
                placeholder="Your Store ID"
                value={senderId}
                onChange={(e) => setSenderId(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsSetupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleSaveSetup}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CourierIntegration;
