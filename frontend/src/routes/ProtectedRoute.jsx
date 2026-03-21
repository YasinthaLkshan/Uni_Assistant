import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "./routePaths";

const ProtectedRoute = ({ children, redirectTo = ROUTE_PATHS.login }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="shimmer-card" />
        <p className="center-screen">Preparing your workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
