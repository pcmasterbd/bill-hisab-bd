import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionExpired = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Account Access Expired</h1>
                <p className="text-muted-foreground mb-8">
                    Your access to Bill Hisab BD has expired. Please contact the administrator to renew your subscription and continue managing your business.
                </p>
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionExpired;
