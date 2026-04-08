import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import LecturerLayout from "../layouts/LecturerLayout";
import MainLayout from "../layouts/MainLayout";
import AdminLoginPage from "../pages/AdminLoginPage";
import CommunityLoginPage from "../pages/CommunityLoginPage";
import LecturerLoginPage from "../pages/LecturerLoginPage";
import AdminDashboardOverviewPage from "../pages/admin/AdminDashboardOverviewPage";
import AdminAcademicEventsPage from "../pages/admin/AdminAcademicEventsPage";
import AdminFcscInformsPage from "../pages/admin/AdminFcscInformsPage";
import AdminLecturersPage from "../pages/admin/AdminLecturersPage";
import AdminChangeRequestsPage from "../pages/admin/AdminChangeRequestsPage";
import AdminHolidaysPage from "../pages/admin/AdminHolidaysPage";
import AdminModulesPage from "../pages/admin/AdminModulesPage";
import AdminTimetablePage from "../pages/admin/AdminTimetablePage";
import AdminStudentProfilesPage from "../pages/admin/AdminStudentProfilesPage";
import AdminStudentGroupsPage from "../pages/admin/AdminStudentGroupsPage";
import AdminAssignmentsPage from "../pages/admin/AdminAssignmentsPage";
import AdminPresentationsPage from "../pages/admin/AdminPresentationsPage";
import AdminVivaPage from "../pages/admin/AdminVivaPage";
import AdminLabTestsPage from "../pages/admin/AdminLabTestsPage";
import AdminExamsPage from "../pages/admin/AdminExamsPage";
import AdminVivaReviewPage from "../pages/admin/AdminVivaReviewPage";
import DashboardPage from "../pages/DashboardPage";
import FcscDashboardPage from "../pages/FcscDashboardPage";
import FcscInformsPage from "../pages/FcscInformsPage";
import HomePage from "../pages/HomePage";
import LecturerDashboardPage from "../pages/lecturer/LecturerDashboardPage";
import LecturerEventsPage from "../pages/lecturer/LecturerEventsPage";
import LecturerModulesPage from "../pages/lecturer/LecturerModulesPage";
import LecturerStudentsPage from "../pages/lecturer/LecturerStudentsPage";
import LecturerTimetablePage from "../pages/lecturer/LecturerTimetablePage";
import LecturerMaterialUploadsPage from "../pages/lecturer/LecturerMaterialUploadsPage";
import LecturerExamSubmissionPage from "../pages/lecturer/LecturerExamSubmissionPage";
import LecturerChangeRequestsPage from "../pages/lecturer/LecturerChangeRequestsPage";
import LecturerCourseworkUploadPage from "../pages/lecturer/LecturerCourseworkUploadPage";
import LecturerExamSchedulePage from "../pages/lecturer/LecturerExamSchedulePage";
import LecturerSchedulePage from "../pages/lecturer/LecturerSchedulePage";
import LecturerVivaPage from "../pages/lecturer/LecturerVivaPage";
import LoginPage from "../pages/LoginPage";
import StudyAssistantPage from "../pages/StudyAssistantPage";
import GpaCalculatorPage from "../pages/GpaCalculatorPage";
import GpaHistoryPage from "../pages/GpaHistoryPage";
import MyAcademicEventsPage from "../pages/MyAcademicEventsPage";
import MyModulesPage from "../pages/MyModulesPage";
import MyTimetablePage from "../pages/MyTimetablePage";
import RegisterPage from "../pages/RegisterPage";
import TasksPage from "../pages/TasksPage";
import AdminProtectedRoute from "./AdminProtectedRoute";
import LecturerProtectedRoute from "./LecturerProtectedRoute";
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
          <Route path={ROUTE_PATHS.fcscDashboard} element={<FcscDashboardPage />} />
          <Route path={ROUTE_PATHS.adminLogin} element={<AdminLoginPage />} />
          <Route path={ROUTE_PATHS.communityLogin} element={<CommunityLoginPage />} />
          <Route path={ROUTE_PATHS.lecturerLogin} element={<LecturerLoginPage />} />
          <Route path={ROUTE_PATHS.register} element={<RegisterPage />} />
        </Route>

        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path={ROUTE_PATHS.adminDashboard} element={<AdminDashboardOverviewPage />} />
            <Route
              path={ROUTE_PATHS.adminStudentProfiles}
              element={<AdminStudentProfilesPage />}
            />
            <Route
              path={ROUTE_PATHS.adminStudentGroups}
              element={<AdminStudentGroupsPage />}
            />
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
            <Route
              path={ROUTE_PATHS.adminAssignments}
              element={<AdminAssignmentsPage />}
            />
            <Route
              path={ROUTE_PATHS.adminPresentations}
              element={<AdminPresentationsPage />}
            />
            <Route
              path={ROUTE_PATHS.adminViva}
              element={<AdminVivaPage />}
            />
            <Route
              path={ROUTE_PATHS.adminLabTests}
              element={<AdminLabTestsPage />}
            />
            <Route
              path={ROUTE_PATHS.adminExams}
              element={<AdminExamsPage />}
            />
            <Route
              path={ROUTE_PATHS.adminFcscInforms}
              element={<AdminFcscInformsPage />}
            />
            <Route
              path={ROUTE_PATHS.adminLecturers}
              element={<AdminLecturersPage />}
            />
            <Route
              path={ROUTE_PATHS.adminHolidays}
              element={<AdminHolidaysPage />}
            />
            <Route
              path={ROUTE_PATHS.adminChangeRequests}
              element={<AdminChangeRequestsPage />}
            />
            <Route
              path={ROUTE_PATHS.adminVivaReview}
              element={<AdminVivaReviewPage />}
            />
          </Route>
        </Route>

        <Route element={<LecturerProtectedRoute />}>
          <Route element={<LecturerLayout />}>
            <Route path={ROUTE_PATHS.lecturerDashboard} element={<LecturerDashboardPage />} />
            <Route path={ROUTE_PATHS.lecturerModules} element={<LecturerModulesPage />} />
            <Route path={ROUTE_PATHS.lecturerTimetable} element={<LecturerTimetablePage />} />
            <Route path={ROUTE_PATHS.lecturerEvents} element={<LecturerEventsPage />} />
            <Route path={ROUTE_PATHS.lecturerStudents} element={<LecturerStudentsPage />} />
            <Route path={ROUTE_PATHS.lecturerMaterials} element={<LecturerMaterialUploadsPage />} />
            <Route path={ROUTE_PATHS.lecturerExamSubmission} element={<LecturerExamSubmissionPage />} />
            <Route path={ROUTE_PATHS.lecturerCoursework} element={<LecturerCourseworkUploadPage />} />
            <Route path={ROUTE_PATHS.lecturerSchedule} element={<LecturerSchedulePage />} />
            <Route path={ROUTE_PATHS.lecturerChangeRequests} element={<LecturerChangeRequestsPage />} />
            <Route path={ROUTE_PATHS.lecturerExamSchedule} element={<LecturerExamSchedulePage />} />
            <Route path={ROUTE_PATHS.lecturerVivas} element={<LecturerVivaPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
            <Route path={ROUTE_PATHS.studyAssistant} element={<StudyAssistantPage />} />
            <Route path={ROUTE_PATHS.fcscInforms} element={<FcscInformsPage />} />
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
