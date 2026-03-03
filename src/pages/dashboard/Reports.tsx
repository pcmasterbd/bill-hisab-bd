import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { userNavItems } from "@/config/navItems";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  BarChart3,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Plus,
  Trash2,
  Eye,
  FileText,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Report {
  id: string;
  title: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  data: string;
  createdAt: string;
}

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("SALES");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async () => {
    if (!newTitle || !startDate || !endDate) {
      toast.error("Error", { description: "Please fill all fields" });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          periodStart: startDate,
          periodEnd: endDate
        })
      });

      if (!res.ok) throw new Error("Failed to generate report");

      toast.success("Success", { description: "Report generated successfully" });
      setIsCreateOpen(false);
      fetchReports();

      // Reset form
      setNewTitle("");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to delete report");

      toast.success("Deleted", { description: "Report removed" });
      if (selectedReport?.id === id) setSelectedReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const parsedData = selectedReport ? JSON.parse(selectedReport.data) : null;

  return (
    <DashboardLayout navItems={userNavItems} title="Reports" userRole="User">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Business Analytics</h2>
          <p className="text-sm text-muted-foreground">Manage and view your saved report snapshots</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Generate New Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Report Snapshot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Title</label>
                <Input
                  placeholder="e.g., February 2024 Sales"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES">Sales Report</SelectItem>
                    <SelectItem value="INVENTORY">Inventory Report</SelectItem>
                    <SelectItem value="PROFIT">Profit/Loss Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateReport}>Generate & Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Reports List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" /> Saved Reports
          </h3>

          {loading ? (
            <p className="text-sm text-muted-foreground italic">Loading snapshots...</p>
          ) : reports.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl">
              <p className="text-sm text-muted-foreground">No saved reports yet</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedReport?.id === report.id
                    ? "bg-primary/5 border-primary shadow-sm"
                    : "bg-card border-border shadow-sm"
                  }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm truncate pr-2">{report.title}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteReport(report.id);
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-muted">{report.type}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report Content */}
        <div className="lg:col-span-2">
          {!selectedReport ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-muted/20 border border-dashed rounded-2xl">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="w-8 h-8 text-primary/40" />
              </div>
              <h3 className="font-semibold text-card-foreground">No Report Selected</h3>
              <p className="text-sm text-muted-foreground max-w-xs mt-2">
                Click on a saved report from the list to view its analytical details and generated charts.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {/* Header Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Total Revenue"
                  value={`৳ ${parsedData.totalRevenue.toLocaleString()}`}
                  icon={<DollarSign className="w-4 h-4 text-primary" />}
                  iconBg="bg-primary/10"
                />
                <StatCard
                  title="Total Orders"
                  value={parsedData.totalOrders.toString()}
                  icon={<ShoppingCart className="w-4 h-4 text-emerald-500" />}
                  iconBg="bg-emerald-500/10"
                />
                <StatCard
                  title="Avg Value"
                  value={`৳ ${parsedData.avgOrderValue.toLocaleString()}`}
                  icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
                  iconBg="bg-blue-500/10"
                />
              </div>

              {/* Chart */}
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{selectedReport.title} Analysis</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Snapshot from {new Date(selectedReport.periodStart).toLocaleDateString()} to {new Date(selectedReport.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" /> Export PDF
                  </Button>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Revenue', value: parsedData.totalRevenue },
                    { name: 'Target', value: parsedData.totalRevenue * 1.2 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `৳${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Details Table */}
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="px-6 py-4 bg-muted/30 border-b border-border">
                  <h4 className="font-semibold text-sm">Snapshot Metadata</h4>
                </div>
                <div className="p-6 grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium uppercase">Report ID</label>
                    <p className="font-mono text-[10px] mt-1 pr-4 truncate">{selectedReport.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium uppercase">Period Type</label>
                    <p className="mt-1">{selectedReport.type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium uppercase">Generated On</label>
                    <p className="mt-1">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium uppercase">Status</label>
                    <p className="mt-1 flex items-center gap-1.5 text-emerald-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Finalized
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
