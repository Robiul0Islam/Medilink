import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ session, allowRoles = [], children }) {
  // not logged in
  if (!session) return <Navigate to="/login" replace />;

  // logged in but not allowed role
    if (allowRoles.length && !allowRoles.includes(session.role)) {
    // role-wise fallback
    if (session.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (session.role === "DOCTOR") return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/p/home" replace />;
  }

  return children;
}
