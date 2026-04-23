import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import { ROUTE_PATHS } from "./routePaths";

const LecturerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="shimmer-card" />
        <p className="center-screen">Preparing lecturer workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.lecturerLogin} replace />;
  }

  if (user?.role !== "lecturer") {
    return <Navigate to={ROUTE_PATHS.dashboard} replace />;
  }

  return children || <Outlet />;
};

export default LecturerProtectedRoute;
