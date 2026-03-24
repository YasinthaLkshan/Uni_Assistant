import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminDashboardOverviewPage from "../pages/admin/AdminDashboardOverviewPage";
import AdminAcademicEventsPage from "../pages/admin/AdminAcademicEventsPage";
import AdminModulesPage from "../pages/admin/AdminModulesPage";
import AdminTimetablePage from "../pages/admin/AdminTimetablePage";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import GpaCalculatorPage from "../pages/GpaCalculatorPage";
import GpaHistoryPage from "../pages/GpaHistoryPage";
import MyAcademicEventsPage from "../pages/MyAcademicEventsPage";
import MyModulesPage from "../pages/MyModulesPage";
import MyTimetablePage from "../pages/MyTimetablePage";
import RegisterPage from "../pages/RegisterPage";
import TasksPage from "../pages/TasksPage";
import AdminProtectedRoute from "./AdminProtectedRoute";
import ProtectedRoute from "./ProtectedRoute";
import { ROUTE_PATHS } from "./routePaths";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="route-transition">
      <Routes location={location}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTE_PATHS.home} element={<HomePage />} />
          <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
          <Route path={ROUTE_PATHS.adminLogin} element={<AdminLoginPage />} />
          <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTE_PATHS.adminDashboard} element={<AdminDashboardOverviewPage />} />
            <Route
              path={ROUTE_PATHS.adminModules}
              element={<AdminModulesPage />}
            />
            <Route
              path={ROUTE_PATHS.adminTimetable}
              element={<AdminTimetablePage />}
            />
            <Route
              path={ROUTE_PATHS.adminAcademicEvents}
              element={<AdminAcademicEventsPage />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
            <Route path={ROUTE_PATHS.myModules} element={<MyModulesPage />} />
            <Route path={ROUTE_PATHS.myTimetable} element={<MyTimetablePage />} />
            <Route path={ROUTE_PATHS.myEvents} element={<MyAcademicEventsPage />} />
            <Route path={ROUTE_PATHS.tasks} element={<TasksPage />} />
            <Route path={ROUTE_PATHS.gpaCalculator} element={<GpaCalculatorPage />} />
            <Route path={ROUTE_PATHS.gpaHistory} element={<GpaHistoryPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
