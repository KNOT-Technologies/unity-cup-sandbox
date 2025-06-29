import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const isAuthenticated = !!localStorage.getItem("authToken");

    if (!isAuthenticated) {
        return <Navigate to="/business/login" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
