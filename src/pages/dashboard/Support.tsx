import DashboardLayout from "@/components/DashboardLayout";
import { userNavItems } from "@/config/navItems";
import { LifeBuoy } from "lucide-react";

const Support = () => (
  <DashboardLayout navItems={userNavItems} title="Support" userRole="Client">
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support</h1>
        <p className="text-sm text-muted-foreground">Get help and contact support</p>
      </div>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center mb-4">
          <LifeBuoy className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-lg font-semibold text-foreground mb-1">Need Help?</p>
        <p className="text-muted-foreground">Contact our support team for assistance</p>
      </div>
    </div>
  </DashboardLayout>
);

export default Support;
