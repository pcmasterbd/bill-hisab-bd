import DashboardLayout from "@/components/DashboardLayout";
import {
    Server,
    Database,
    Cpu,
    Activity,
    Zap,
    ShieldCheck,
    Clock,
    AlertTriangle,
    CheckCircle2,
    RefreshCw,
    ShieldCheck as ShieldIcon,
    Settings
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const AdminSystemHealth = () => {
    const systems = [
        {
            name: "API Gateway",
            status: "Operational",
            uptime: "99.99%",
            latency: "24ms",
            load: 12,
            health: 100
        },
        {
            name: "Turso Database",
            status: "Operational",
            uptime: "99.95%",
            latency: "45ms",
            load: 34,
            health: 100
        },
        {
            name: "Prisma Engine",
            status: "Operational",
            uptime: "100%",
            latency: "8ms",
            load: 5,
            health: 100
        },
        {
            name: "Email Service",
            status: "Operational",
            uptime: "99.8%",
            latency: "120ms",
            load: 2,
            health: 98
        },
    ];

    const resources = [
        { label: "CPU Usage", value: 32, total: "100%", color: "bg-primary" },
        { label: "Memory Usage", value: 64, total: "16GB", color: "bg-info" },
        { label: "Disk Storage", value: 45, total: "500GB", color: "bg-success" },
        { label: "Bandwidth", value: 15, total: "1Gbps", color: "bg-warning" },
    ];

    return (
        <DashboardLayout navItems={adminNavItems} title="System Health" userRole="Admin">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">System Health</h2>
                        <p className="text-muted-foreground">Monitor infrastructure performance and uptime in real-time</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh Status
                    </Button>
                </div>

                {/* Global Status Banner */}
                <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                        <ShieldIcon className="w-6 h-6 text-success" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-success">All Systems Operational</h4>
                        <p className="text-xs text-success/80">Last checked: Just now • No incidents reported in the last 24 hours.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* System Services Status */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
                                <h3 className="font-semibold text-card-foreground">Service Health</h3>
                                <Activity className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="divide-y divide-border">
                                {systems.map((service) => (
                                    <div key={service.name} className="p-6 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-secondary">
                                                    <Server className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-card-foreground">{service.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="flex h-2 w-2 rounded-full bg-success"></span>
                                                        <span className="text-xs text-success font-medium">{service.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-card-foreground">{service.uptime}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Uptime</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase">Latency</p>
                                                <p className="text-xs font-semibold">{service.latency}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase">Current Load</p>
                                                <p className="text-xs font-semibold">{service.load}%</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-muted-foreground uppercase">Stability</p>
                                                <p className="text-xs font-semibold">{service.health}%</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Incidents / Logs */}
                        <div className="bg-card border border-border rounded-xl shadow-sm">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <h3 className="font-semibold text-card-foreground">Recent Events</h3>
                                <Clock className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="p-6 space-y-4">
                                {[
                                    { time: "10:45 AM", event: "SSL Certificate renewed successfully", type: "info" },
                                    { time: "09:12 AM", event: "Database backup completed (2.4 GB)", type: "success" },
                                    { time: "Yesterday", event: "Brief latency spike detected in Dhaka region", type: "warning" },
                                ].map((log, i) => (
                                    <div key={i} className="flex gap-4 items-start">
                                        <span className="text-[11px] font-medium text-muted-foreground w-16 pt-0.5">{log.time}</span>
                                        <div className="flex items-start gap-2">
                                            {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                                            {log.type === 'info' && <Zap className="w-4 h-4 text-info shrink-0" />}
                                            {log.type === 'warning' && <AlertTriangle className="w-4 h-4 text-warning shrink-0" />}
                                            <p className="text-sm text-card-foreground">{log.event}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure Resources */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                            <h3 className="font-semibold text-card-foreground mb-6">Resource Allocation</h3>
                            <div className="space-y-8">
                                {resources.map((res) => (
                                    <div key={res.label} className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-muted-foreground">{res.label}</p>
                                                <p className="text-lg font-bold text-card-foreground">{res.value}%</p>
                                            </div>
                                            <span className="text-xs text-muted-foreground">of {res.total}</span>
                                        </div>
                                        <Progress value={res.value} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Database className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-card-foreground">Turso Cluster</h4>
                                    <p className="text-xs text-muted-foreground">Region: ap-south-1</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Database Size</span>
                                    <span className="font-medium">124.5 MB</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Read Requests</span>
                                    <span className="font-medium text-success">Low Load</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Write Requests</span>
                                    <span className="font-medium text-success">Healthy</span>
                                </div>
                            </div>
                            <Button variant="secondary" className="w-full mt-6 text-xs h-9">
                                View Database Logs
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminSystemHealth;
