import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "./routePaths";

const AdminRoute = () => {
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
    return <Navigate to={ROUTE_PATHS.home} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
