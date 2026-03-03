import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { Webhook, Plus, Edit2, Trash2, Check, X, Loader2, Link as LinkIcon, Shield, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface WebhookData {
  id: string;
  url: string;
  event: string;
  isActive: boolean;
  secret?: string;
  createdAt: string;
}

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWebhook, setCurrentWebhook] = useState<Partial<WebhookData>>({
    url: "",
    event: "ORDER_CREATED",
    isActive: true,
    secret: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchWebhooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/webhooks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWebhooks(data);
      } else {
        toast.error("Failed to fetch webhooks");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!currentWebhook.url) {
      toast.error("URL is required");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const method = isEditing ? "PUT" : "POST";
      const url = isEditing
        ? `${API_URL}/api/webhooks/${currentWebhook.id}`
        : `${API_URL}/api/webhooks`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentWebhook)
      });

      if (res.ok) {
        toast.success(`Webhook ${isEditing ? "updated" : "created"} successfully`);
        setIsDialogOpen(false);
        fetchWebhooks();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save webhook");
      }
    } catch (error) {
      toast.error("Error saving webhook");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/webhooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Webhook deleted");
        fetchWebhooks();
      } else {
        toast.error("Failed to delete webhook");
      }
    } catch (error) {
      toast.error("Error deleting webhook");
    }
  };

  const toggleStatus = async (webhook: WebhookData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/webhooks/${webhook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...webhook, isActive: !webhook.isActive })
      });

      if (res.ok) {
        toast.success(`Webhook ${!webhook.isActive ? "enabled" : "disabled"}`);
        fetchWebhooks();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  return (
    <DashboardLayout navItems={userNavItems} title="Webhooks" userRole="Client">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Webhooks</h1>
            <p className="text-sm text-muted-foreground">Manage automated integrations and notifications</p>
          </div>
          <Button onClick={() => {
            setIsEditing(false);
            setCurrentWebhook({ url: "", event: "ORDER_CREATED", isActive: true, secret: "" });
            setIsDialogOpen(true);
          }} className="gap-2">
            <Plus className="w-4 h-4" /> Add Webhook
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading your webhooks...</p>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-xl border border-dashed border-border">
            <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mb-4">
              <Webhook className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-1">No Webhooks Configured</p>
            <p className="text-muted-foreground mb-6">Set up webhooks for automated workflows</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Create Your First Webhook</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="overflow-hidden">
                <CardHeader className="p-4 sm:p-6 pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base truncate max-w-[200px] sm:max-w-md">{webhook.url}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] sm:text-xs">{webhook.event}</Badge>
                          <span className="text-[10px] hidden sm:inline">•</span>
                          <span className="text-[10px]">Created {new Date(webhook.createdAt).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={() => toggleStatus(webhook)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardFooter className="p-4 sm:p-6 pt-2 bg-muted/20 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => {
                    setIsEditing(true);
                    setCurrentWebhook(webhook);
                    setIsDialogOpen(true);
                  }}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(webhook.id)}>
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Webhook" : "Add Webhook"}</DialogTitle>
            <DialogDescription>
              Configure the payload URL and events you want to trigger this webhook.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Payload URL
              </Label>
              <Input
                id="url"
                placeholder="https://your-service.com/webhook"
                value={currentWebhook.url}
                onChange={(e) => setCurrentWebhook({ ...currentWebhook, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event" className="flex items-center gap-2">
                <Activity className="w-4 h-4" /> Trigger Event
              </Label>
              <Select
                value={currentWebhook.event}
                onValueChange={(val) => setCurrentWebhook({ ...currentWebhook, event: val })}
              >
                <SelectTrigger id="event">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORDER_CREATED">Order Created</SelectItem>
                  <SelectItem value="ORDER_UPDATED">Order Updated</SelectItem>
                  <SelectItem value="STOCK_LOW">Low Stock Alert</SelectItem>
                  <SelectItem value="CUSTOMER_CREATED">New Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secret" className="flex items-center gap-2">
                <Shield className="w-4 h-4" /> Secret Key (Optional)
              </Label>
              <Input
                id="secret"
                type="password"
                placeholder="Webhook signature secret"
                value={currentWebhook.secret || ""}
                onChange={(e) => setCurrentWebhook({ ...currentWebhook, secret: e.target.value })}
              />
              <p className="text-[10px] text-muted-foreground mt-1">Used to sign the payload for security verification.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrUpdate} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {isEditing ? "Update Webhook" : "Create Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Webhooks;
