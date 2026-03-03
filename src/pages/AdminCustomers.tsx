import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Settings,
    BarChart3,
    Activity,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    UserPlus,
    Phone,
    MapPin,
    MoreVertical,
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

interface Client {
    id: string;
    name: string;
    phone: string;
    district: string | null;
    thana: string | null;
    address: string | null;
    createdAt: string;
}

const AdminCustomers = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentClient, setCurrentClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: "", phone: "", district: "", thana: "", address: "" });

    const fetchClients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to fetch clients");
            const data = await response.json();
            setClients(data);
        } catch (error) {
            toast.error("Error loading clients");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/customers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to create client");
            }
            toast.success("Client created successfully");
            setIsAddModalOpen(false);
            setFormData({ name: "", phone: "", district: "", thana: "", address: "" });
            fetchClients();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentClient) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/customers/${currentClient.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error("Failed to update client");
            toast.success("Client updated successfully");
            setIsEditModalOpen(false);
            fetchClients();
        } catch (error) {
            toast.error("Error updating client");
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm("Are you sure you want to delete this client?")) return;
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/customers/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error("Failed to delete client");
            toast.success("Client deleted successfully");
            fetchClients();
        } catch (error) {
            toast.error("Error deleting client");
        }
    };

    const openEditModal = (client: Client) => {
        setCurrentClient(client);
        setFormData({
            name: client.name,
            phone: client.phone,
            district: client.district || "",
            thana: client.thana || "",
            address: client.address || "",
        });
        setIsEditModalOpen(true);
    };

    return (
        <DashboardLayout navItems={adminNavItems} title="Manage Clients" userRole="Admin">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">Client Directory</h3>
                    <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" /> Add Client
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-muted-foreground">Loading clients...</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase">Location</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {clients.length === 0 ? (
                                    <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No clients found.</td></tr>
                                ) : clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {client.name.charAt(0)}
                                                </div>
                                                <span className="font-medium text-sm">{client.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Phone className="w-3 h-3" />
                                                {client.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                {client.district ? `${client.thana}, ${client.district}` : "Not specified"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(client)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClient(client.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Register New Client</DialogTitle></DialogHeader>
                    <form onSubmit={handleAddClient} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>District</Label>
                                <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Thana</Label>
                                <Input value={formData.thana} onChange={(e) => setFormData({ ...formData, thana: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Detailed Address</Label>
                            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full">Create Client</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Client Info</DialogTitle></DialogHeader>
                    <form onSubmit={handleUpdateClient} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>District</Label>
                                <Input value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Thana</Label>
                                <Input value={formData.thana} onChange={(e) => setFormData({ ...formData, thana: e.target.value })} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Detailed Address</Label>
                            <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full">Update Details</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminCustomers;
