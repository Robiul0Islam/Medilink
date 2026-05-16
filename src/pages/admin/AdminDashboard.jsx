import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingDoctors: 0,
    approvedDoctors: 0,
    pendingPosts: 0,
    approvedPosts: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.admin.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="container">
      <Topbar
        title={<>Admin Dashboard</>}
        subtitle="Manage doctors, posts and platform quality"
        searchPlaceholder="Search admin tools..."
      />

      <div className="apptStats">
        <div className="card statCard">
          <div className="statK">Total Doctors</div>
          <div className="statV">{stats.approvedDoctors + stats.pendingDoctors}</div>
        </div>

        <div className="card statCard">
          <div className="statK">Pending Doctors</div>
          <div className="statV">{stats.pendingDoctors}</div>
        </div>

        <div className="card statCard">
          <div className="statK">Approved Doctors</div>
          <div className="statV">{stats.approvedDoctors}</div>
        </div>

        <div className="card statCard">
          <div className="statK">Pending Posts</div>
          <div className="statV">{stats.pendingPosts}</div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <div className="panelTitle">Admin Capabilities</div>
          <div className="panelSub">
            • Review & approve doctor registrations<br />
            • Arrange doctor interviews when required<br />
            • Approve / reject awareness posts<br />
            • Maintain platform authenticity & quality
          </div>
        </div>

      </div>
    </div>
  );
}
