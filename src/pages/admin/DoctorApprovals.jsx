import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api, { API_BASE_URL } from "../../utils/api";

export default function DoctorApprovals() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  async function fetchDoctors() {
    try {
      const data = await api.admin.getPendingDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Failed to load pending doctors", error);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.admin.approveDoctor(id);
      // Remove from list
      setDoctors(doctors.filter((d) => d.id !== id));
      alert("Doctor approved successfully!");
    } catch (error) {
      alert("Failed to approve doctor: " + error.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this doctor?")) return;
    try {
      await api.admin.rejectDoctor(id);
      setDoctors(doctors.filter((d) => d.id !== id));
    } catch (error) {
      alert("Failed to reject doctor: " + error.message);
    }
  };

  const resolveAvatar = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="container">
      <Topbar
        title={<>Doctor Verification</>}
        subtitle="Approve, reject or arrange interview for doctors"
        searchPlaceholder="Search pending doctors..."
      />

      {loading ? (
        <div className="p-4">Loading pending applications...</div>
      ) : (
        <div className="list">
          {doctors.length === 0 ? (
            <div className="card">
              <div className="panelTitle">No pending applications</div>
              <div className="panelSub">All doctors have been processed.</div>
            </div>
          ) : (
            doctors.map((d) => (
              <div key={d.id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                    <img src={resolveAvatar(d.avatar)} style={{width: 50, height: 50, borderRadius: 12, objectFit: 'cover'}} alt="" />
                    <div>
                      <div className="panelMain">{d.name}</div>
                      <div className="panelSub">
                        {d.email} • {d.specialty}
                      </div>
                      <div className="panelSub">
                        Clinic: {d.clinic} • {d.city}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn"
                      onClick={() => handleApprove(d.id)}
                    >
                      Approve
                    </button>

                    <button
                      className="btn ghost"
                      style={{color: '#b42318', borderColor: '#ffd0d0', background: '#ffecec'}}
                      onClick={() => handleReject(d.id)}
                    >
                      Reject
                    </button>

                    <button
                      className="btn ghost"
                      onClick={() =>
                        alert(
                          `Interview scheduled for Dr. ${d.name} (Feature coming soon)`
                        )
                      }
                    >
                      arrange Interview
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
