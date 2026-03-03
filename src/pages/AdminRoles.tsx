import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    RefreshCw,
    Check,
    ShieldCheck,
    Activity,
    Users,
    Loader2,
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Permission {
    id: string;
    module: string;
    action: string;
    description: string;
    admin: boolean;
    moderator: boolean;
    user: boolean;
}

const AdminRoles = () => {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/permissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch permissions");
            const data = await response.json();
            setPermissions(data);
        } catch (error) {
            toast.error("Error loading permissions from database");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const togglePermission = async (id: string, role: "admin" | "moderator" | "user") => {
        const perm = permissions.find(p => p.id === id);
        if (!perm) return;

        const newValue = !perm[role];
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/permissions/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...perm, [role]: newValue }),
            });

            if (!response.ok) throw new Error("Update failed");

            setPermissions(prev => prev.map(p =>
                p.id === id ? { ...p, [role]: newValue } : p
            ));
            toast.success(`Permission updated for ${role}`);
        } catch (error) {
            toast.error("Failed to save changes to database");
        }
    };

    return (
        <DashboardLayout navItems={adminNavItems} title="Roles & Permissions" userRole="Admin">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-card-foreground">Access Control Matrix</h2>
                        <p className="text-muted-foreground">Persistent permissions management synced with Turso Database</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchPermissions} disabled={loading} className="gap-2">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Sync Now
                        </Button>
                        <Button size="sm" className="gap-2 bg-primary/90">
                            <Check className="w-4 h-4" /> Changes Auto-save
                        </Button>
                    </div>
                </div>

                {/* Roles Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <h3 className="font-bold text-sm">Administrator</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Full system control and user management.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-warning/20 bg-warning/5">
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-warning" />
                            <h3 className="font-bold text-sm">Moderator</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Access to logs and product management.</p>
                    </div>
                    <div className="p-4 rounded-xl border border-muted bg-muted/20">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-bold text-sm">Standard User</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Basic access to products and own profile.</p>
                    </div>
                </div>

                {/* Permissions Table */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-muted-foreground">Fetching permission groups...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30 text-xs font-bold uppercase tracking-wider">
                                <TableRow>
                                    <TableHead className="w-[30%]">Module / Permission</TableHead>
                                    <TableHead className="text-center">Admin</TableHead>
                                    <TableHead className="text-center">Moderator</TableHead>
                                    <TableHead className="text-center">User</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                                        <TableCell>
                                            <div>
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary mb-1">
                                                    {p.module}
                                                </Badge>
                                                <p className="text-sm font-semibold">{p.action}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={p.admin}
                                                onCheckedChange={() => togglePermission(p.id, "admin")}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={p.moderator}
                                                onCheckedChange={() => togglePermission(p.id, "moderator")}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Switch
                                                checked={p.user}
                                                onCheckedChange={() => togglePermission(p.id, "user")}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminRoles;
