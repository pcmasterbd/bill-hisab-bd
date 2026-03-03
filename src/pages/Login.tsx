import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { API_URL } from "@/config/api";

const features = [
  { label: "Smart Billing" },
  { label: "Stock Tracking" },
  { label: "Order Management" },
  { label: "Business Analytics" },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }

      const data = await response.json();

      // Store auth data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Role-based redirection
      if (data.user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      alert(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 login-gradient flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="mx-auto mb-8 w-24 h-24 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-primary/20">
            <ReceiptText className="w-12 h-12 text-primary-foreground" />
          </div>

          <h1 className="text-4xl font-bold text-login-panel-foreground mb-3 tracking-tight">
            Bill Hisab <span className="text-primary-foreground/60">BD</span>
          </h1>
          <p className="text-login-panel-foreground/60 text-lg mb-12 max-w-sm">
            Professional Billing & Stock Management for modern Bangladesh businesses
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-sidebar-accent/50 border border-sidebar-border"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-feature-dot shrink-0" />
                <span className="text-login-panel-foreground/80 text-sm font-medium">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <ReceiptText className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Bill Hisab BD</h1>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg border border-border/50">
            {/* Welcome Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Welcome back
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-card-foreground mb-1">
              Welcome Back
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Sign in to your account
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl bg-secondary/50 border-border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 rounded-xl bg-secondary/50 border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </label>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold gap-2">
                Login
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <p className="text-center text-muted-foreground text-sm mt-6">
              Contact admin for account access
            </p>

            <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-border">
              <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                Privacy
              </a>
              <span className="text-border">|</span>
              <a href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
