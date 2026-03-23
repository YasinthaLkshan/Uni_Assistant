import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminDashboardOverviewPage from "../pages/admin/AdminDashboardOverviewPage";
import AdminModulePage from "../pages/admin/AdminModulePage";
import DashboardPage from "../pages/DashboardPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
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
              path={ROUTE_PATHS.adminTimetable}
              element={
                <AdminModulePage
                  title="Timetable Management"
                  description="Manage timetable sessions by group, day, venue, and lecturer assignments."
                />
              }
            />
            <Route
              path={ROUTE_PATHS.adminStudentGroups}
              element={
                <AdminModulePage
                  title="Student Groups"
                  description="Maintain student group structures and keep academic cohorts well organized."
                />
              }
            />
            <Route
              path={ROUTE_PATHS.adminAssignments}
              element={
                <AdminModulePage
                  title="Assignments"
                  description="Publish and track assignment schedules, submission windows, and updates."
                />
              }
            />
            <Route
              path={ROUTE_PATHS.adminPresentations}
              element={
                <AdminModulePage
                  title="Presentations"
                  description="Plan presentation slots, evaluation panels, and communication notices."
                />
              }
            />
            <Route
              path={ROUTE_PATHS.adminViva}
              element={
                <AdminModulePage
                  title="Viva"
                  description="Coordinate viva sessions, examiner allocations, and completion status."
                />
              }
            />
            <Route
              path={ROUTE_PATHS.adminLabTests}
              element={
                <AdminModulePage
                  title="Lab Tests"
                  description="Manage lab test plans with schedules, venues, and grouped student batches."
                />
              }
            />
            <Route
              path={ROUTE_PATHS.adminExams}
              element={
                <AdminModulePage
                  title="Exams"
                  description="Oversee exam scheduling, hall allocations, and academic milestone readiness."
                />
              }
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
            <Route path={ROUTE_PATHS.tasks} element={<TasksPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={ROUTE_PATHS.home} replace />} />
      </Routes>
    </div>
  );
};

export default AppRoutes;
