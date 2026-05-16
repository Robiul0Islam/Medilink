import { useNavigate } from "react-router-dom";
import { useUI } from "../context/UIContext";
import { getSession } from "../utils/auth";

export default function Topbar({ title, subtitle, searchPlaceholder = "Search..." }) {
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();
  const session = getSession();

  const handleNotifications = () => {
    if (session?.role === "ADMIN") navigate("/admin/doctor-approvals");
    else if (session?.role === "DOCTOR") navigate("/doctor/appointments");
    else navigate("/p/appointments");
  };

  const handleMessages = () => {
    if (session?.role === "DOCTOR") navigate("/doctor/chat");
    else navigate("/p/chat");
  };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="iconBtn mobileOnly" onClick={toggleSidebar} aria-label="Menu" style={{ fontSize: 20 }}>☰</button>
        <div>
            <div className="hello">{title}</div>
            <div className="sub">{subtitle}</div>
        </div>
      </div>

      <div className="topbarRight">
        <div className="iconBtnWrap">
            <button className="iconBtn" aria-label="Notifications" onClick={handleNotifications}>
            🔔
            </button>
            {/* Simulation: Only show badge if logged in */}
            {session && <span className="badge"></span>}
        </div>
        
        <div className="iconBtnWrap">
            <button className="iconBtn" aria-label="Messages" onClick={handleMessages}>
            💬
            </button>
            {session && <span className="badge"></span>}
        </div>
      </div>
    </header>
  );
}
