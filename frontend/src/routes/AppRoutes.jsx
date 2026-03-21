import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import TasksPage from "../pages/TasksPage";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTE_PATHS } from "./routePaths";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path={ROUTE_PATHS.home} element={<HomePage />} />
        <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
        <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
          <Route path={ROUTE_PATHS.tasks} element={<TasksPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
    </Routes>
  );
};

export default AppRoutes;
