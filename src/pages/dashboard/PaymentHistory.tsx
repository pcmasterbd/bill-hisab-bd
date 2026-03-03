import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import { toast } from "sonner";
import { API_URL } from "@/config/api";
import { Button } from "@/components/ui/button";
import { userNavItems } from "@/config/navItems";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Loader2,
  Receipt,
} from "lucide-react";
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

interface Payment {
  id: string;
  orderId: string | null;
  customerId: string | null;
  amount: number;
  method: string;
  type: string;
  transactionId: string | null;
  note: string | null;
  createdAt: string;
  order?: { id: string };
  customer?: { name: string; phone: string };
}

const PaymentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [type, setType] = useState("INCOME");
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      setPayments(data);
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async () => {
    if (!amount || !method) {
      toast.error("Input Error", { description: "Amount and Method are required" });
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          method,
          type,
          orderId: orderId || null,
          transactionId: transactionId || null,
          note
        })
      });

      if (!res.ok) throw new Error("Failed to record payment");

      toast.success("Success", { description: "Payment recorded successfully" });
      setIsAddOpen(false);
      fetchPayments();

      // Reset form
      setAmount("");
      setOrderId("");
      setTransactionId("");
      setNote("");
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm("Are you sure? This will also revert the order balance if linked.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/payments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Failed to delete payment");

      toast.success("Deleted", { description: "Payment record removed" });
      fetchPayments();
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    }
  };

  const filteredPayments = payments.filter(p =>
    p.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = payments.filter(p => p.type === 'INCOME').reduce((s, p) => s + p.amount, 0);
  const totalExpense = payments.filter(p => p.type === 'EXPENSE').reduce((s, p) => s + p.amount, 0);

  return (
    <DashboardLayout navItems={userNavItems} title="Payment History" userRole="User">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-xl font-bold text-card-foreground">Transaction Management</h2>
          <p className="text-sm text-muted-foreground">Monitor your business cash flow and order payments</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4" /> Record Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Transaction Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (৳)</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INCOME">Income</SelectItem>
                      <SelectItem value="EXPENSE">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BKASH">bKash</SelectItem>
                    <SelectItem value="NAGAD">Nagad</SelectItem>
                    <SelectItem value="ROCKET">Rocket</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center justify-between">
                  Order ID (Optional)
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Links to order balance</span>
                </label>
                <Input
                  placeholder="Paste order UUID"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction/Ref ID</label>
                <Input
                  placeholder="e.g., BK-928374"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Note</label>
                <Input
                  placeholder="Additional details..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAddPayment}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Net Cash Flow"
          value={`৳ ${(totalIncome - totalExpense).toLocaleString()}`}
          icon={<Wallet className="w-5 h-5 text-primary" />}
          iconBg="bg-primary/10"
        />
        <StatCard
          title="Total Income"
          value={`৳ ${totalIncome.toLocaleString()}`}
          icon={<ArrowUpRight className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          title="Total Expenses"
          value={`৳ ${totalExpense.toLocaleString()}`}
          icon={<ArrowDownLeft className="w-5 h-5 text-rose-500" />}
          iconBg="bg-rose-500/10"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search ID, customer, or note..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left border-b border-border">
                <th className="px-6 py-4 font-semibold text-muted-foreground">Transaction ID</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Details</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Method</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Amount</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Receipt className="w-12 h-12 mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-muted-foreground">No transactions found</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-[10px] text-muted-foreground mb-1 uppercase tracking-tight">
                        {payment.id.split('-')[0]}
                      </div>
                      <div className="font-semibold text-card-foreground flex items-center gap-1.5">
                        {payment.transactionId || 'N/A'}
                        {payment.type === 'INCOME' ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-card-foreground font-medium">
                        {payment.orderId ? `Order #${payment.orderId.split('-')[0].toUpperCase()}` : 'General Transaction'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {payment.customer?.name || payment.note || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`font-bold ${payment.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {payment.type === 'INCOME' ? '+' : '-'} ৳{payment.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PaymentHistory;
