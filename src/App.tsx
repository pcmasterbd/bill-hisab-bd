import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoles from "./pages/AdminRoles";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSystemHealth from "./pages/AdminSystemHealth";
import AdminSettings from "./pages/AdminSettings";
import SubscriptionExpired from "./pages/SubscriptionExpired";
import AdminProducts from "./pages/AdminProducts";
import AdminCustomers from "./pages/AdminCustomers";
import AdminOrders from "./pages/AdminOrders";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import Orders from "./pages/dashboard/Orders";
import Products from "./pages/dashboard/Products";
import Customers from "./pages/dashboard/Customers";
import Reports from "./pages/dashboard/Reports";
import Invoices from "./pages/dashboard/Invoices";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import WholesaleOrders from "./pages/dashboard/WholesaleOrders";
import CreateBill from "./pages/dashboard/CreateBill";
import StockManagement from "./pages/dashboard/StockManagement";
import CompanyOrders from "./pages/dashboard/CompanyOrders";
import CourierIntegration from "./pages/dashboard/CourierIntegration";
import Webhooks from "./pages/dashboard/Webhooks";
import PaymentHistory from "./pages/dashboard/PaymentHistory";
import AIAssistant from "./pages/dashboard/AIAssistant";
import Production from "./pages/dashboard/Production";
import Support from "./pages/dashboard/Support";

const queryClient = new QueryClient();

import ProtectedRoute from "./components/ProtectedRoute";
import { ViewProvider } from "./context/ViewContext";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <ViewProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Login />} />

              {/* User Routes */}
              <Route path="/user-dashboard" element={<ProtectedRoute requiredRole="USER"><Dashboard /></ProtectedRoute>} />
              <Route path="/user-dashboard/create-bill" element={<ProtectedRoute requiredRole="USER"><CreateBill /></ProtectedRoute>} />
              <Route path="/user-dashboard/orders" element={<ProtectedRoute requiredRole="USER"><Orders /></ProtectedRoute>} />
              <Route path="/user-dashboard/products" element={<ProtectedRoute requiredRole="USER"><Products /></ProtectedRoute>} />
              <Route path="/user-dashboard/customers" element={<ProtectedRoute requiredRole="USER"><Customers /></ProtectedRoute>} />
              <Route path="/user-dashboard/reports" element={<ProtectedRoute requiredRole="USER"><Reports /></ProtectedRoute>} />
              <Route path="/user-dashboard/invoices" element={<ProtectedRoute requiredRole="USER"><Invoices /></ProtectedRoute>} />
              <Route path="/user-dashboard/settings" element={<ProtectedRoute requiredRole="USER"><DashboardSettings /></ProtectedRoute>} />
              <Route path="/user-dashboard/wholesale-orders" element={<ProtectedRoute requiredRole="USER"><WholesaleOrders /></ProtectedRoute>} />
              <Route path="/user-dashboard/stock" element={<ProtectedRoute requiredRole="USER"><StockManagement /></ProtectedRoute>} />
              <Route path="/user-dashboard/production" element={<ProtectedRoute requiredRole="USER"><Production /></ProtectedRoute>} />
              <Route path="/user-dashboard/company-orders" element={<ProtectedRoute requiredRole="USER"><CompanyOrders /></ProtectedRoute>} />
              <Route path="/user-dashboard/courier" element={<ProtectedRoute requiredRole="USER"><CourierIntegration /></ProtectedRoute>} />
              <Route path="/user-dashboard/webhooks" element={<ProtectedRoute requiredRole="USER"><Webhooks /></ProtectedRoute>} />
              <Route path="/user-dashboard/payments" element={<ProtectedRoute requiredRole="USER"><PaymentHistory /></ProtectedRoute>} />
              <Route path="/user-dashboard/ai-assistant" element={<ProtectedRoute requiredRole="USER"><AIAssistant /></ProtectedRoute>} />
              <Route path="/user-dashboard/support" element={<ProtectedRoute requiredRole="USER"><Support /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin-dashboard" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin-dashboard/roles" element={<ProtectedRoute requiredRole="ADMIN"><AdminRoles /></ProtectedRoute>} />
              <Route path="/admin-dashboard/analytics" element={<ProtectedRoute requiredRole="ADMIN"><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin-dashboard/system" element={<ProtectedRoute requiredRole="ADMIN"><AdminSystemHealth /></ProtectedRoute>} />
              <Route path="/admin-dashboard/settings" element={<ProtectedRoute requiredRole="ADMIN"><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin-dashboard/products" element={<ProtectedRoute requiredRole="ADMIN"><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin-dashboard/customers" element={<ProtectedRoute requiredRole="ADMIN"><AdminCustomers /></ProtectedRoute>} />
              <Route path="/admin-dashboard/orders" element={<ProtectedRoute requiredRole="ADMIN"><AdminOrders /></ProtectedRoute>} />

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/expired" element={<SubscriptionExpired />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ViewProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
