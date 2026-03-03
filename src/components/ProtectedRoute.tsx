import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: "ADMIN" | "USER";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to={user.role === "ADMIN" ? "/admin-dashboard" : "/user-dashboard"} replace />;
    }

    if (user.role === "USER" && user.subscriptionStatus === "EXPIRED") {
        return <Navigate to="/expired" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
