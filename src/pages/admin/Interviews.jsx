import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import { loadUsers, saveUsers } from "../../utils/auth";

export default function Interviews() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const doctors = users.filter((u) => u.role === "Doctor");

  const markInterviewScheduled = (id) => {
    const next = users.map((u) =>
      u.id === id ? { ...u, interview: "Scheduled" } : u
    );
    setUsers(next);
    saveUsers(next);
  };

  const markInterviewCompleted = (id) => {
    const next = users.map((u) =>
      u.id === id ? { ...u, interview: "Completed" } : u
    );
    setUsers(next);
    saveUsers(next);
  };

  return (
    <div className="container">
      <Topbar
        title={<>Interviews</>}
        subtitle="Arrange and manage doctor interviews (demo)"
        searchPlaceholder="Search doctors..."
      />

      <div className="list">
        {doctors.length === 0 ? (
          <div className="card">
            <div className="panelTitle">No doctors found</div>
          </div>
        ) : (
          doctors.map((d) => (
            <div key={d.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div className="panelMain">{d.name}</div>
                  <div className="panelSub">
                    {d.email} • {d.specialization}
                  </div>
                  <div className="panelSub">
                    Account Status: <b>{d.status}</b>
                  </div>
                  <div className="panelSub">
                    Interview: <b>{d.interview || "Not Scheduled"}</b>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    className="btn"
                    onClick={() => markInterviewScheduled(d.id)}
                  >
                    Schedule
                  </button>
                  <button
                    className="btn ghost"
                    onClick={() => markInterviewCompleted(d.id)}
                  >
                    Mark Completed
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="panelTitle">Admin Note</div>
        <div className="panelSub">
          • Admin may schedule interview before approval<br />
          • After interview, Admin can approve/reject doctor account (Doctor Approvals page)
        </div>
      </div>
    </div>
  );
}
