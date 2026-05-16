import { useEffect, useMemo, useState } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function DoctorReports() {
  const session = getSession();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [type, setType] = useState("Prescription");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [file, setFile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPatients = async () => {
    if (session?.userId) {
      try {
        const appts = await api.appointment.getByDoctor(session.userId);
        // Extract unique patients
        const map = new Map();
        appts.forEach(a => {
           if (a.patient) map.set(a.patient.id, a.patient);
        });
        const pList = Array.from(map.values());
        setPatients(pList);
        if (pList.length > 0 && !selectedPatientId) {
            setSelectedPatientId(pList[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch patients", e);
      }
    }
  };

  const fetchReports = async () => {
    if (selectedPatientId) {
      try {
        const data = await api.report.getByPatient(selectedPatientId);
        // Filter reports created by THIS doctor
        const filtered = data.filter(r => r.doctor?.id === session?.userId);
        setReports(filtered);
      } catch (e) {
        console.error("Failed to fetch reports", e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [session?.userId]);

  useEffect(() => {
    if (selectedPatientId) {
      fetchReports();
    }
  }, [selectedPatientId]);

  const downloadFile = async (url, filename) => {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename || 'medical_report';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error("Download failed", e);
        window.open(url, '_blank');
    }
  };

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === Number(selectedPatientId)),
    [patients, selectedPatientId]
  );

  const addReport = async (e) => {
    e.preventDefault();
    const t = title.trim();
    const d = details.trim();
    if (!t || !d || !selectedPatientId) return;

    setUploading(true);
    try {
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("patientId", selectedPatientId);
            formData.append("doctorId", session.userId);
            formData.append("title", t);
            formData.append("description", d);
            formData.append("reportType", type);
            
            await api.report.upload(formData);
        } else {
            await api.report.create({
                patient: { id: selectedPatientId },
                doctor: { id: session.userId },
                reportType: type,
                title: t,
                description: d,
                reportDate: new Date().toISOString().split('T')[0]
            });
        }
        
        setTitle("");
        setDetails("");
        setFile(null);
        fetchReports();
        alert("Report saved successfully!");
    } catch (e) {
        alert("Failed to save report: " + e.message);
    } finally {
        setUploading(false);
    }
  };

  const removeReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await api.report.delete(id);
      fetchReports();
    } catch (e) {
      alert("Failed to delete: " + e.message);
    }
  };

  return (
    <div className="container">
      <Topbar
        title={<>Doctor Reports</>}
        subtitle="Add medical reports and prescriptions for your patients"
        searchPlaceholder="Search reports..."
      />

      <div className="reportsTop">
        {/* Create */}
        <div className="card reportUpload">
          <div className="reportUploadTitle">Add Report / Prescription</div>
          <div className="reportUploadSub">
            Select patient from your appointments to add details.
          </div>

          <form className="authForm" onSubmit={addReport} style={{ gap: 10 }}>
            <div>
              <div className="label">Patient</div>
              <select
                className="select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                {patients.length === 0 && <option value="">No patients found</option>}
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="label">Type</div>
              <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                <option>Prescription</option>
                <option>Test Report</option>
                <option>Medical Report</option>
              </select>
            </div>

            <div>
              <div className="label">Title</div>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Blood Sugar Test / Prescription for Fever"
                required
              />
            </div>

            <div>
              <div className="label">Attachment (Optional)</div>
              <input
                type="file"
                className="input"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*,.pdf"
              />
            </div>

            <div>
              <div className="label">Details</div>
              <textarea
                className="input"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Write report details / medicines / instructions..."
                style={{ minHeight: 110, resize: "vertical" }}
                required
              />
            </div>

            <button className="btn" type="submit" style={{ width: "fit-content" }} disabled={patients.length === 0 || uploading}>
              {uploading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="card reportStats">
          <div className="panelTitle">Patient Summary</div>
          {selectedPatient ? (
              <>
                <div className="panelMain">{selectedPatient.name}</div>
                <div className="panelSub">{selectedPatient.email}</div>
                <div className="panelSub">City: {selectedPatient.city}</div>
              </>
          ) : (
              <div className="panelSub">No patient selected</div>
          )}

          <div className="summary" style={{ marginTop: 12 }}>
            <div className="summaryItem">
              <div className="k">Consultations</div>
              <div className="v">{reports.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="sectionHeader mt">
        <div className="sectionTitle">My Records for {selectedPatient?.name}</div>
        <button className="seeAll" onClick={() => fetchReports()}>
          Refresh ↻
        </button>
      </div>

      <div className="list">
        {!selectedPatientId ? (
            <div className="card">
                <div className="panelSub">Select a patient to see their records.</div>
            </div>
        ) : reports.length === 0 ? (
          <div className="card">
            <div className="panelTitle">No records found</div>
            <div className="panelSub">Add a report/prescription for this patient.</div>
          </div>
        ) : (
          reports.map((r) => (
            <div key={r.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="apptTitle">
                    {r.title}{" "}
                    <span style={{ color: "#6b7a99", fontWeight: 800, fontSize: 12 }}>
                      ({r.reportType})
                    </span>
                  </div>
                  <div className="apptMeta">
                    📅 {new Date(r.reportDate).toLocaleDateString()} • Recorded: {new Date(r.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  {r.fileUrl && (
                    <>
                      <button className="btn" onClick={() => window.open(`http://localhost:8080/api${r.fileUrl}`, '_blank')}>
                        View File
                      </button>
                      <button className="btn ghost" onClick={() => downloadFile(`http://localhost:8080/api${r.fileUrl}`, r.title)}>
                        Download
                      </button>
                    </>
                  )}
                  <button className="btn ghost" onClick={() => removeReport(r.id)}>
                    Delete
                  </button>
                </div>
              </div>

              <div className="panelSub" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                {r.description}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
