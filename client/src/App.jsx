import { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/register";
import DashboardPage from "./pages/dashboard";
import StudentHistoryPage from "./pages/studentHistory";
import StudentAnnouncementsPage from "./pages/studentAnnouncements";
import StudentReservationPage from "./pages/studentReservation";
import AdminDashboard from "./pages/adminDashboard";
import AdminStudentsPage from "./pages/adminStudents";
import AdminSitInPage from "./pages/adminSitIn";
import AdminSitInRecordsPage from "./pages/adminSitInRecords";
import AdminSitInReportsPage from "./pages/adminSitInReports";
import AdminAnnouncementsPage from "./pages/adminAnnouncements";
import AdminReservationsPage from "./pages/adminReservations";
import StudentFeedbackPage from "./pages/studentFeedback";
import AdminLabsSoftwarePage from "./pages/adminLabsSoftware";
import AdminTestimonialsPage from "./pages/adminTestimonials";
import AdminReportsPage from "./pages/adminReports";

function StudentProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return children;
}

function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) return children;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize theme from localStorage
    const storedTheme = localStorage.getItem("theme");
    const isDark = storedTheme === "dark" || 
      (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    document.documentElement.classList.toggle("dark", isDark);
    if (!storedTheme) {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    const enforceAuth = () => {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const path = window.location.pathname;

      const isAdminPath = path.startsWith("/admin");
      const isStudentPath = path.startsWith("/dashboard");

      if (!token && (isAdminPath || isStudentPath)) {
        navigate("/login", { replace: true });
        return;
      }

      if (token && isAdminPath && (!user || user.role !== "admin")) {
        navigate("/dashboard", { replace: true });
      }
    };

    enforceAuth();
    window.addEventListener("popstate", enforceAuth);
    window.addEventListener("pageshow", enforceAuth);

    return () => {
      window.removeEventListener("popstate", enforceAuth);
      window.removeEventListener("pageshow", enforceAuth);
    };
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <StudentProtectedRoute>
            <DashboardPage />
          </StudentProtectedRoute>
        }
      />
      <Route
        path="/dashboard/history"
        element={
          <StudentProtectedRoute>
            <StudentHistoryPage />
          </StudentProtectedRoute>
        }
      />
      <Route
        path="/dashboard/announcements"
        element={
          <StudentProtectedRoute>
            <StudentAnnouncementsPage />
          </StudentProtectedRoute>
        }
      />
      <Route
        path="/dashboard/reservations"
        element={
          <StudentProtectedRoute>
            <StudentReservationPage />
          </StudentProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AdminProtectedRoute>
            <AdminStudentsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/sit-in"
        element={
          <AdminProtectedRoute>
            <AdminSitInPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/sit-in/records"
        element={
          <AdminProtectedRoute>
            <AdminSitInRecordsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/sit-in/reports"
        element={
          <AdminProtectedRoute>
            <AdminSitInReportsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <AdminProtectedRoute>
            <AdminAnnouncementsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <AdminProtectedRoute>
            <AdminReservationsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/dashboard/feedback"
        element={
          <StudentProtectedRoute>
            <StudentFeedbackPage />
          </StudentProtectedRoute>
        }
      />
      <Route
        path="/admin/labs-software"
        element={
          <AdminProtectedRoute>
            <AdminLabsSoftwarePage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/testimonials"
        element={
          <AdminProtectedRoute>
            <AdminTestimonialsPage />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminProtectedRoute>
            <AdminReportsPage />
          </AdminProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
