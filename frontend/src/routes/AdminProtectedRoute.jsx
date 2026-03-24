import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "./routePaths";

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="shimmer-card" />
        <p className="center-screen">Preparing admin workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.adminLogin} replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />;
  }

  return children || <Outlet />;
};

export default AdminProtectedRoute;
