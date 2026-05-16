import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { UIProvider, useUI } from "./context/UIContext";
import { getSession } from "./utils/auth";

// shared
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

// auth
import { Login, Register } from "./pages";

// patient pages
import Appointments from "./pages/patient/Appointments.jsx";
import Awareness from "./pages/patient/Awareness.jsx";
import Chat from "./pages/patient/Chat.jsx";
import Doctors from "./pages/patient/Doctors.jsx";
import Home from "./pages/patient/Home.jsx";
import Reports from "./pages/patient/Reports.jsx";
import Settings from "./pages/patient/Settings.jsx";

// admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import DoctorApprovals from "./pages/admin/DoctorApprovals.jsx";
import Interviews from "./pages/admin/Interviews.jsx";
import PostApprovals from "./pages/admin/PostApprovals.jsx";

// doctor pages
import DoctorAppointments from "./pages/doctor/DoctorAppointments.jsx";
import DoctorChat from "./pages/doctor/DoctorChat.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorPosts from "./pages/doctor/DoctorPosts.jsx";
import DoctorReports from "./pages/doctor/DoctorReports.jsx";

function DefaultRedirect() {
  const session = getSession();

  if (!session) return <Navigate to="/login" replace />;

  if (session.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (session.role === "DOCTOR") return <Navigate to="/doctor/dashboard" replace />;

  return <Navigate to="/p/home" replace />;
}

export default function App() {
  const location = useLocation();
  const session = getSession();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <UIProvider>
      <AppContent isAuthPage={isAuthPage} session={session} />
    </UIProvider>
  );
}

function AppContent({ isAuthPage, session }) {
    const { isSidebarOpen, closeSidebar } = useUI();
    
    return (
        <div className={isAuthPage ? "authShell" : "app"}>
        {!isAuthPage ? (
            <>
                <Sidebar session={session} />
                {isSidebarOpen && <div className="sidebarOverlay" onClick={closeSidebar}></div>}
            </>
        ) : null}

        <main className={isAuthPage ? "authMain" : "main"}>
            <Routes>
          {/* Root */}
          <Route path="/" element={<DefaultRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* =====================
              PATIENT ROUTES (/p)
          ===================== */}
          <Route
            path="/p/home"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT"]}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/appointments"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT"]}>
                <Appointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/doctors"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT"]}>
                <Doctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/chat"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT"]}>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/reports"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/awareness"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT"]}>
                <Awareness />
              </ProtectedRoute>
            }
          />
          <Route
            path="/p/settings"
            element={
              <ProtectedRoute session={session} allowRoles={["PATIENT", "DOCTOR", "ADMIN"]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* =====================
              ADMIN ROUTES
          ===================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute session={session} allowRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctor-approvals"
            element={
              <ProtectedRoute session={session} allowRoles={["ADMIN"]}>
                <DoctorApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/post-approvals"
            element={
              <ProtectedRoute session={session} allowRoles={["ADMIN"]}>
                <PostApprovals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/interviews"
            element={
              <ProtectedRoute session={session} allowRoles={["ADMIN"]}>
                <Interviews />
              </ProtectedRoute>
            }
          />

          {/* =====================
              DOCTOR ROUTES
          ===================== */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute session={session} allowRoles={["DOCTOR"]}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute session={session} allowRoles={["DOCTOR"]}>
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/chat"
            element={
              <ProtectedRoute session={session} allowRoles={["DOCTOR"]}>
                <DoctorChat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/posts"
            element={
              <ProtectedRoute session={session} allowRoles={["DOCTOR"]}>
                <DoctorPosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/reports"
            element={
              <ProtectedRoute session={session} allowRoles={["DOCTOR"]}>
                <DoctorReports />
              </ProtectedRoute>
            }
          />

          {/* fallback */}
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </main>
    </div>
  );
}
