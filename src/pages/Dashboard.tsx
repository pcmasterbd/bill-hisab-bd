import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { userNavItems } from "@/config/navItems";
import {
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Clock,
  Globe,
  Send,
  CalendarDays,
  Download,
  RotateCcw,
  Plus,
  Loader2,
  Factory,
  Store,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { API_URL } from "@/config/api";
import { toast } from "sonner";
import { useView } from "@/context/ViewContext";

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

interface GradientStatCardProps {
  icon: React.ReactNode;
  value: string | number;
  subValue?: string;
  label: string;
  gradient?: string;
}

const GradientStatCard = ({ icon, value, subValue, label, gradient }: GradientStatCardProps) => (
  <div className={`rounded-xl p-5 ${gradient || "bg-card border border-border"} transition-all hover:shadow-md`}>
    <div className="mb-3">{icon}</div>
    <div className="flex items-baseline gap-1.5">
      <p className={`text-2xl font-bold ${gradient ? "text-white" : "text-card-foreground"}`}>{value}</p>
    </div>
    {subValue && (
      <p className={`text-xs mt-0.5 ${gradient ? "text-white/70" : "text-muted-foreground"}`}>{subValue}</p>
    )}
    <p className={`text-sm mt-1 ${gradient ? "text-white/80" : "text-muted-foreground"}`}>{label}</p>
  </div>
);

const Dashboard = () => {
  const [expenseTab, setExpenseTab] = useState<"today" | "history" | "summary">("today");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { view } = useView();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reports/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Dashboard" userRole="Client">
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Dashboard" userRole="Client">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your business</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={fetchStats}>
            <RotateCcw className="w-4 h-4" /> Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Row 1: Dashboard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <GradientStatCard
          gradient={view === "RETAIL" ? "bg-gradient-to-br from-blue-600 to-indigo-600" : "bg-gradient-to-br from-orange-500 to-amber-600"}
          icon={
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              {view === "RETAIL" ? <Store className="w-5 h-5 text-white" /> : <Factory className="w-5 h-5 text-white" />}
            </div>
          }
          value={view === "RETAIL" ? (stats?.today.retail.orders || 0) : (stats?.today.wholesale.orders || 0)}
          label={view === "RETAIL" ? "Today's Retail Orders" : "Today's Wholesale Orders"}
        />
        <GradientStatCard
          icon={
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${view === "RETAIL" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          }
          value={`৳${(view === "RETAIL" ? (stats?.today.retail.revenue || 0) : (stats?.today.wholesale.revenue || 0)).toLocaleString()}`}
          label={view === "RETAIL" ? "Today's Retail Revenue" : "Today's Wholesale Revenue"}
        />
        <GradientStatCard
          icon={
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${view === "RETAIL" ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-600"}`}>
              <Calendar className="w-5 h-5" />
            </div>
          }
          value={`৳${(view === "RETAIL" ? (stats?.monthly.retailRevenue || 0) : (stats?.monthly.wholesaleRevenue || 0)).toLocaleString()}`}
          label={view === "RETAIL" ? "Monthly Retail Revenue" : "Monthly Wholesale Revenue"}
        />
        <GradientStatCard
          gradient="bg-gradient-to-br from-green-600 to-emerald-600"
          icon={
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <DollarSign className="w-5 h-5" />
            </div>
          }
          value={`৳${((view === "RETAIL" ? (stats?.monthly.retailRevenue || 0) : (stats?.monthly.wholesaleRevenue || 0)) - (stats?.totalExpenses || 0)).toLocaleString()}`}
          label={`Net Profit (${view === "RETAIL" ? 'Retail' : 'Wholesale'})`}
        />
      </div>

      {/* Row 2: Pending Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between transition-all hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${view === "RETAIL" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Pending {view === 'RETAIL' ? 'Retail' : 'Wholesale'}</p>
              <p className="text-2xl font-bold">৳{(view === "RETAIL" ? (stats?.pending.retail.amount || 0) : (stats?.pending.wholesale.amount || 0)).toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-lg font-semibold">{view === "RETAIL" ? (stats?.pending.retail.count || 0) : (stats?.pending.wholesale.count || 0)}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 flex items-center justify-between transition-all hover:shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Expenses</p>
              <p className="text-2xl font-bold">৳{stats?.totalExpenses.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Monthly</p>
            <p className="text-lg font-semibold text-destructive">GENERAL</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">{view === 'RETAIL' ? 'Retail' : 'Wholesale'} Performance (Today)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={[
              { name: 'Revenue', value: view === 'RETAIL' ? stats?.today.retail.revenue : stats?.today.wholesale.revenue },
              { name: 'Target', value: (view === 'RETAIL' ? stats?.today.retail.revenue : stats?.today.wholesale.revenue) * 1.2 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 16%, 47%)" />
              <Tooltip formatter={(val: number) => [`৳${val}`, "Amount"]} />
              <Area type="monotone" dataKey="value" stroke={view === 'RETAIL' ? 'hsl(225, 100%, 50%)' : 'hsl(25, 100%, 50%)'} fill={view === 'RETAIL' ? 'hsl(225, 100%, 50%)' : 'hsl(25, 100%, 50%)'} fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 text-center flex flex-col items-center justify-center group hover:border-primary/50 transition-all cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <BarChart3 className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <h4 className="font-semibold text-foreground mb-1">Advanced Analytics</h4>
          <p className="text-sm text-muted-foreground max-w-[200px]">Detailed reports and trend mapping coming soon</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
