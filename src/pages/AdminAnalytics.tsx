import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    BarChart3,
    TrendingUp,
    Users,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Calendar,
    Settings,
    LayoutDashboard,
    ShieldCheck,
    Activity
} from "lucide-react";
import { adminNavItems } from "@/config/adminNavItems";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";

const data = [
    { name: "Jan", sales: 4000, users: 2400 },
    { name: "Feb", sales: 3000, users: 1398 },
    { name: "Mar", sales: 2000, users: 9800 },
    { name: "Apr", sales: 2780, users: 3908 },
    { name: "May", sales: 1890, users: 4800 },
    { name: "Jun", sales: 2390, users: 3800 },
    { name: "Jul", sales: 3490, users: 4300 },
];

const pieData = [
    { name: "Retail", value: 400 },
    { name: "Wholesale", value: 300 },
    { name: "Corporate", value: 300 },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

const AdminAnalytics = () => {
    return (
        <DashboardLayout navItems={adminNavItems} title="Admin Analytics" userRole="Admin">
            <div className="space-y-8">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Analytics Overview</h2>
                        <p className="text-muted-foreground">Detailed insights into your business performance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="w-4 h-4" /> Last 30 Days
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" /> Filter
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Revenue"
                        value="৳845,230"
                        change="+12.5%"
                        changeType="positive"
                        icon={<DollarSign className="w-5 h-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <StatCard
                        title="New Users"
                        value="124"
                        change="+18.2%"
                        changeType="positive"
                        icon={<Users className="w-5 h-5 text-primary" />}
                        iconBg="bg-primary/10"
                    />
                    <StatCard
                        title="Active Subscriptions"
                        value="42"
                        change="+5.4%"
                        changeType="positive"
                        icon={<TrendingUp className="w-5 h-5 text-info" />}
                        iconBg="bg-info/10"
                    />
                    <StatCard
                        title="Average Order Value"
                        value="৳6,240"
                        change="-2.1%"
                        changeType="negative"
                        icon={<BarChart3 className="w-5 h-5 text-warning" />}
                        iconBg="bg-warning/10"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-card-foreground">Revenue Growth</h3>
                            <div className="flex items-center gap-1 text-xs text-success font-medium bg-success/10 px-2 py-1 rounded">
                                <ArrowUpRight className="w-3 h-3" /> 14% increment
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold text-card-foreground">User Acquisition</h3>
                            <div className="flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                                <Users className="w-3 h-3" /> Daily active users
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-1">
                        <h3 className="font-semibold text-card-foreground mb-6">Sales by Category</h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                                    <span className="text-xs text-muted-foreground">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-2">
                        <h3 className="font-semibold text-card-foreground mb-6">Recent Growth Performance</h3>
                        <div className="space-y-6">
                            {[
                                { label: "Subscription Conversion", value: 78, trend: "up" },
                                { label: "Customer Retention", value: 92, trend: "up" },
                                { label: "Trial-to-Paid Rate", value: 64, trend: "down" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-foreground">{item.label}</span>
                                        <span className="text-muted-foreground">{item.value}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.trend === 'up' ? 'bg-success' : 'bg-warning'}`}
                                            style={{ width: `${item.value}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAnalytics;
