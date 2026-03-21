import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "./routePaths";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="shimmer-card" />
        <p className="center-screen">Preparing your workspace...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={ROUTE_PATHS.login} replace />;
};

export default ProtectedRoute;
