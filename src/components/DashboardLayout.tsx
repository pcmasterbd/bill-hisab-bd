import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Bell,
  Search,
  Menu,
  Sun,
  Moon,
  Globe,
  ReceiptText,
  User,
  Settings,
  Building2,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/config/translations";
import { AlertTriangle } from "lucide-react";

import { useView } from "@/context/ViewContext";
import ViewToggle from "@/components/ViewToggle";

type NavItem = {
  label: string;
  icon: React.ElementType;
  path: string;
  key?: string;
};

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  userName?: string;
  userRole?: string;
  companyName?: string;
}

import { retailNavItems, wholesaleNavItems } from "@/config/navItems";
import { adminNavItems } from "@/config/adminNavItems";

const DashboardLayout = ({
  children,
  navItems: initialNavItems,
  title,
  userName = "Ratul Islam",
  userRole = "Client",
  companyName = "Faster Food Khulna",
}: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { language, setLanguage, t } = useLanguage();
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null);

  const { view, setView } = useView();
  const { theme, setTheme } = useTheme();

  // Determine which nav items to use based on role and view
  const currentNavItems = userRole === "Admin"
    ? adminNavItems
    : (view === "RETAIL" ? retailNavItems : wholesaleNavItems);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role === "USER") {
        const expiresAt = user.subscriptionExpiresAt || user.trialExpiresAt;
        if (expiresAt) {
          const expiryDate = new Date(expiresAt);
          const now = new Date();
          const diffTime = expiryDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays <= 3 && diffDays > 0) {
            setExpiryWarning(`Your subscription expires in ${diffDays} day${diffDays > 1 ? 's' : ''}. Please renew to avoid interruption.`);
          } else if (diffDays <= 0) {
            // Should be handled by ProtectedRoute but extra layer here
            setExpiryWarning("Your subscription has expired. Please renew your account.");
          }
        }
      }
    }
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "bn" : "en");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"
          } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col fixed h-full z-30`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0 shadow-sm">
            <ReceiptText className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-sidebar-primary-foreground text-sm tracking-tight">
                Bill Hisab BD
              </h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/40">{companyName}</p>
            </div>
          )}
        </div>

        {/* Top Actions */}
        {sidebarOpen && (
          <div className="px-3 py-3 flex items-center gap-2 border-b border-sidebar-border">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-sidebar-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-sidebar-foreground gap-1 text-xs"
              onClick={toggleLanguage}
            >
              <Globe className="w-4 h-4" /> {language === "en" ? "বাংলা" : "English"}
            </Button>
          </div>
        )}

        {/* Retail / Wholesale Toggle */}
        {sidebarOpen && (
          <div className="px-3 py-4 border-b border-sidebar-border">
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {currentNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.key ? t(item.key as any) : item.label}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"
          }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-muted-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("search")}
                className="pl-10 w-64 h-9 rounded-lg bg-secondary/50 border-border text-sm"
              />
            </div>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                3
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-fit gap-3 pl-3 pr-2 rounded-full hover:bg-secondary/80 transition-all border border-border/50">
                  <div className="flex flex-col items-end hidden sm:flex">
                    <p className="text-sm font-bold text-foreground leading-none">{userName}</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-0.5">{userRole}</p>
                  </div>
                  <Avatar className="h-8 w-8 border border-primary/20 bg-primary/10 shadow-sm">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                      {userName.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userRole}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium">{companyName}</span>
                    <span className="text-[10px] text-muted-foreground">Active Company</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/user-dashboard/settings")} className="gap-2 cursor-pointer">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span>Account Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/")}
                  className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {expiryWarning && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl flex items-center gap-3 text-warning animate-pulse">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{expiryWarning}</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
