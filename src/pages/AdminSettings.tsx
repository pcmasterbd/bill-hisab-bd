import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    Settings,
    Building2,
    Globe,
    Bell,
    Shield,
    Key,
    Mail,
    Smartphone,
    ChevronRight,
    Database,
    Cloud,
    Clock,
    Activity
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const AdminSettings = () => {
    const [loading, setLoading] = useState(false);

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("Settings saved successfully");
        }, 1000);
    };

    return (
        <DashboardLayout navItems={adminNavItems} title="System Settings" userRole="Admin">
            <div className="space-y-8 max-w-5xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Admin Settings</h2>
                        <p className="text-muted-foreground">Manage global configurations and system security</p>
                    </div>
                    <Button onClick={handleSave} disabled={loading} className="gap-2 px-8">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>

                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mb-8">
                        <TabsTrigger value="general" className="gap-2">
                            <Building2 className="w-4 h-4" /> General
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="w-4 h-4" /> Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="w-4 h-4" /> Alerts
                        </TabsTrigger>
                        <TabsTrigger value="api" className="gap-2">
                            <Key className="w-4 h-4" /> API Keys
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                                <h3 className="font-semibold text-card-foreground flex items-center gap-2 mb-4">
                                    <Building2 className="w-4 h-4 text-primary" /> Company Profile
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">Company Name</Label>
                                        <Input id="companyName" defaultValue="PC Master BD" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Support Email</Label>
                                        <Input id="email" type="email" defaultValue="support@pcmasterbd.com" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Company Phone</Label>
                                        <Input id="phone" defaultValue="+880 1234 567890" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
                                <h3 className="font-semibold text-card-foreground flex items-center gap-2 mb-4">
                                    <Globe className="w-4 h-4 text-primary" /> Region & Theme
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Default Language</Label>
                                        <Input defaultValue="English (US)" readOnly className="bg-muted cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Timezone</Label>
                                        <Input defaultValue="UTC+6 (Dhaka)" readOnly className="bg-muted cursor-not-allowed" />
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <div className="space-y-0.5">
                                            <Label>Standard Maintenance Mode</Label>
                                            <p className="text-xs text-muted-foreground">Puts the public site into maintenance</p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="security" className="space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="divide-y divide-border">
                                {[
                                    { label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts", icon: Smartphone },
                                    { label: "Strong Password Policy", desc: "Enforce 12+ chars and special characters", icon: Key },
                                    { label: "Session Timeout", desc: "Automatically logout idle admins after 30 mins", icon: Clock },
                                    { label: "IP Whitelisting", desc: "Restrict admin access to specific IP ranges", icon: Globe },
                                ].map((item) => (
                                    <div key={item.label} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-secondary">
                                                <item.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-card-foreground text-sm">{item.label}</p>
                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                        <Switch />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
                            <div>
                                <h3 className="font-semibold text-card-foreground">System Alerts</h3>
                                <p className="text-xs text-muted-foreground">Configuration for automated system notifications</p>
                            </div>
                            <div className="space-y-4">
                                {[
                                    "Alert me on new user registration",
                                    "Email reports for daily sales",
                                    "Notify on database connection spikes",
                                    "Send security login alerts",
                                ].map((item) => (
                                    <div key={item} className="flex items-center space-x-2">
                                        <Switch id={item} />
                                        <Label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {item}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="api" className="space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border bg-muted/20">
                                <h3 className="font-semibold text-card-foreground">External Services</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg border border-border/50 bg-secondary/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Database className="w-5 h-5 text-info" />
                                            <div>
                                                <p className="text-sm font-bold">Turso DB Key</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">**************************</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Manage</Button>
                                    </div>
                                    <div className="p-4 rounded-lg border border-border/50 bg-secondary/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Cloud className="w-5 h-5 text-primary" />
                                            <div>
                                                <p className="text-sm font-bold">Email (Resend/SendGrid)</p>
                                                <p className="text-[10px] text-muted-foreground font-mono">**************************</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Manage</Button>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button variant="secondary" className="w-full gap-2">
                                        <Key className="w-4 h-4" /> Generate New API Key
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default AdminSettings;
