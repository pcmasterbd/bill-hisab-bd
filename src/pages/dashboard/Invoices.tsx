import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import { userNavItems } from "@/config/navItems";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  DollarSign,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const invoices = [
  { id: "INV-001", customer: "আহমেদ হোসেন", amount: "৳ 12,500", status: "Paid", dueDate: "28 Feb 2026", issuedDate: "26 Feb 2026" },
  { id: "INV-002", customer: "ফাতেমা বেগম", amount: "৳ 8,200", status: "Unpaid", dueDate: "05 Mar 2026", issuedDate: "26 Feb 2026" },
  { id: "INV-003", customer: "করিম উদ্দিন", amount: "৳ 15,800", status: "Paid", dueDate: "27 Feb 2026", issuedDate: "25 Feb 2026" },
  { id: "INV-004", customer: "নাসরিন আক্তার", amount: "৳ 6,400", status: "Overdue", dueDate: "20 Feb 2026", issuedDate: "18 Feb 2026" },
  { id: "INV-005", customer: "রফিকুল ইসলাম", amount: "৳ 22,100", status: "Paid", dueDate: "26 Feb 2026", issuedDate: "24 Feb 2026" },
  { id: "INV-006", customer: "সালমা খাতুন", amount: "৳ 9,300", status: "Unpaid", dueDate: "10 Mar 2026", issuedDate: "24 Feb 2026" },
  { id: "INV-007", customer: "জাহিদ হাসান", amount: "৳ 4,500", status: "Overdue", dueDate: "15 Feb 2026", issuedDate: "10 Feb 2026" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-success/10 text-success",
  Unpaid: "bg-warning/10 text-warning",
  Overdue: "bg-destructive/10 text-destructive",
};

const Invoices = () => {
  return (
    <DashboardLayout navItems={userNavItems} title="Invoices" userRole="User">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Invoices"
          value="324"
          change="This month"
          changeType="neutral"
          icon={<FileText className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Paid"
          value="৳ 3,85,200"
          change="268 invoices"
          changeType="positive"
          icon={<DollarSign className="w-5 h-5 text-success" />}
          iconBg="bg-success/10"
        />
        <StatCard
          title="Pending"
          value="৳ 45,800"
          change="38 invoices"
          changeType="negative"
          icon={<FileText className="w-5 h-5 text-warning" />}
          iconBg="bg-warning/10"
        />
        <StatCard
          title="Overdue"
          value="৳ 18,400"
          change="18 invoices"
          changeType="negative"
          icon={<FileText className="w-5 h-5 text-destructive" />}
          iconBg="bg-destructive/10"
        />
      </div>

      {/* Invoices Table */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="font-semibold text-card-foreground">All Invoices</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." className="pl-9 h-9 w-56 bg-secondary/50 border-border text-sm" />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Create Invoice
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Issued</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-primary">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-card-foreground">{invoice.customer}</td>
                  <td className="px-6 py-4 text-sm font-medium text-card-foreground">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[invoice.status]}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.issuedDate}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{invoice.dueDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Invoices;
