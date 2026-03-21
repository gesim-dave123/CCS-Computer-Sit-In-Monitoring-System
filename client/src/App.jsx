import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/loginPage";
import RegisterPage from "./pages/register";
import DashboardPage from "./pages/dashboard";
import AdminDashboard from "./pages/adminDashboard";
import AdminStudentsPage from "./pages/adminStudents";
import AdminSitInPage from "./pages/adminSitIn";
import AdminSitInRecordsPage from "./pages/adminSitInRecords";
import AdminSitInReportsPage from "./pages/adminSitInReports";

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
    const enforceAuth = () => {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const path = window.location.pathname;

      const isAdminPath = path.startsWith("/admin");
      const isStudentPath = path === "/dashboard";

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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
