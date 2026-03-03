import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  BarChart3,
  Activity,
  UserPlus,
  Server,
  MoreVertical,
  Trash2,
  Loader2,
  Pencil,
  Package,
  Factory,
  RotateCcw,
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import { useView } from "@/context/ViewContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { API_URL } from "@/config/api";

const roleStyles: Record<string, string> = {
  ADMIN: "bg-primary/10 text-primary",
  USER: "bg-muted text-muted-foreground",
  MODERATOR: "bg-warning/10 text-warning",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionStatus: string;
  trialExpiresAt: string;
  createdAt: string;
}

interface DashboardStats {
  today: {
    retail: { orders: number; revenue: number };
    wholesale: { orders: number; revenue: number };
  };
  monthly: {
    retailRevenue: number;
    wholesaleRevenue: number;
  };
  pending: {
    retail: { count: number; amount: number };
    wholesale: { count: number; amount: number };
  };
  totalExpenses: number;
}

const subStyles: Record<string, string> = {
  ACTIVE: "bg-success/10 text-success",
  TRIAL: "bg-info/10 text-info",
  EXPIRED: "bg-destructive/10 text-destructive",
  INACTIVE: "bg-muted text-muted-foreground",
};

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { view } = useView();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER",
    subscriptionStatus: "INACTIVE",
    trialExpiresAt: ""
  });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Error loading users");
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reports/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error("Failed to load stats");
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to create user");
      toast.success("User created successfully");
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
        subscriptionStatus: "INACTIVE",
        trialExpiresAt: ""
      });
      fetchUsers();
    } catch (error) {
      toast.error("Error creating user");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to update user");
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error("Error updating user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete user");
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Error deleting user");
    }
  };

  const openEditModal = (user: User) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      password: "",
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      trialExpiresAt: user.trialExpiresAt ? new Date(user.trialExpiresAt).toISOString().split('T')[0] : ""
    });
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout navItems={adminNavItems} title="Admin Dashboard" userRole="Admin">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Overveiw</h1>
          <p className="text-sm text-muted-foreground">Global business performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={loadData} className="rounded-full shadow-sm">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title={view === 'RETAIL' ? "Retail Revenue" : "Wholesale Revenue"}
          value={`৳${((view === 'RETAIL' ? stats?.monthly.retailRevenue : stats?.monthly.wholesaleRevenue) || 0).toLocaleString()}`}
          change="This Month"
          changeType="positive"
          icon={<BarChart3 className={`w-5 h-5 ${view === 'RETAIL' ? 'text-blue-600' : 'text-orange-600'}`} />}
          iconBg={view === 'RETAIL' ? "bg-blue-100" : "bg-orange-100"}
        />
        <StatCard
          title={view === 'RETAIL' ? "Today's Retail" : "Today's Wholesale"}
          value={`৳${((view === 'RETAIL' ? stats?.today.retail.revenue : stats?.today.wholesale.revenue) || 0).toLocaleString()}`}
          change={`${view === 'RETAIL' ? stats?.today.retail.orders : stats?.today.wholesale.orders} Orders`}
          changeType="positive"
          icon={<Package className={`w-5 h-5 ${view === 'RETAIL' ? 'text-blue-600' : 'text-orange-600'}`} />}
          iconBg={view === 'RETAIL' ? "bg-blue-100" : "bg-orange-100"}
        />
        <StatCard
          title="Total Users"
          value={users.length.toString()}
          change="Registered"
          changeType="positive"
          icon={<Users className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="System Health"
          value="Online"
          change="All systems GO"
          changeType="positive"
          icon={<Activity className="w-5 h-5 text-success" />}
          iconBg="bg-success/10"
        />
      </div>

      {/* User Management Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
          <h3 className="font-semibold text-card-foreground">User Management</h3>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-sm">
            <UserPlus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Fetching users...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subscription</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-primary text-sm font-bold shadow-inner">
                          {user.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-card-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-tight uppercase ${roleStyles[user.role] || "bg-muted"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit px-2 py-0.5 rounded text-[9px] font-bold uppercase ${subStyles[user.subscriptionStatus] || "bg-muted"}`}>
                          {user.subscriptionStatus}
                        </span>
                        {(user.subscriptionStatus === 'TRIAL' || user.subscriptionStatus === 'ACTIVE') && user.trialExpiresAt && (
                          <span className="text-[10px] text-muted-foreground">
                            Expires: {new Date(user.trialExpiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditModal(user)} className="gap-2">
                            <Pencil className="w-4 h-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="gap-2 text-destructive">
                            <Trash2 className="w-4 h-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimum 6 characters" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sub-status">Subscription Status</Label>
              <Select value={formData.subscriptionStatus} onValueChange={(val) => setFormData({ ...formData, subscriptionStatus: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.subscriptionStatus === 'TRIAL' || formData.subscriptionStatus === 'ACTIVE') && (
              <div className="space-y-2">
                <Label htmlFor="trial-expiry">Expires At</Label>
                <Input
                  id="trial-expiry"
                  type="date"
                  value={formData.trialExpiresAt}
                  onChange={(e) => setFormData({ ...formData, trialExpiresAt: e.target.value })}
                />
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
              <Input id="edit-password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">User Role</Label>
              <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MODERATOR">Moderator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sub-status">Subscription Status</Label>
              <Select value={formData.subscriptionStatus} onValueChange={(val) => setFormData({ ...formData, subscriptionStatus: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.subscriptionStatus === 'TRIAL' || formData.subscriptionStatus === 'ACTIVE') && (
              <div className="space-y-2">
                <Label htmlFor="edit-expiry">Expires At</Label>
                <Input
                  id="edit-expiry"
                  type="date"
                  value={formData.trialExpiresAt}
                  onChange={(e) => setFormData({ ...formData, trialExpiresAt: e.target.value })}
                />
              </div>
            )}
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full">Update Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminDashboard;
