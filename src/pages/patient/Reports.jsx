import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const session = getSession();

  // Form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState(null);
  const [hr, setHr] = useState("");
  const [bp, setBp] = useState("");
  const [glu, setGlu] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    if (session?.userId) {
      try {
        const data = await api.report.getByPatient(session.userId);
        setReports(data || []);
      } catch (error) {
        console.error("Failed to load reports", error);
      }
    }
  };

  useEffect(() => {
    fetchReports();
  }, [session?.userId]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("patientId", session.userId);
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("heartRate", hr);
    formData.append("bloodPressure", bp);
    formData.append("glucose", glu);
    formData.append("weight", weight);
    formData.append("height", height);

    try {
      await api.report.upload(formData);
      alert("Report uploaded and health summary updated!");
      setShowModal(false);
      resetForm();
      fetchReports();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setFile(null);
    setHr("");
    setBp("");
    setGlu("");
    setWeight("");
    setHeight("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Unknown Date";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

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
          // Fallback
          window.open(url, '_blank');
      }
  };

  return (
    <div className="container">
      <Topbar
        title={<>Reports</>}
        subtitle="View, download and upload medical reports"
        searchPlaceholder="Search reports..."
      />

      <div className="reportsTop">
        <div className="card reportUpload">
          <div className="reportUploadTitle">Upload New Report</div>
          <div className="reportUploadSub">
            Upload PDF/Image. Keep your medical history updated.
          </div>
          <button className="btn" style={{ width: "fit-content" }} onClick={() => setShowModal(true)}>
            Upload
          </button>
        </div>

        <div className="card reportStats">
          <div className="panelTitle">Summary</div>
          <div className="summary">
            <div className="summaryItem">
              <div className="k">Total Reports</div>
              <div className="v">{reports.length}</div>
            </div>
            <div className="summaryItem">
              <div className="k">Latest</div>
              <div className="v">
                {reports.length > 0 ? formatDate(reports[0].reportDate) : "--"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sectionHeader mt">
        <div className="sectionTitle">Recent Medical Records</div>
        <button className="seeAll" onClick={fetchReports}>Refresh ↻</button>
      </div>

      <div className="list">
        {reports.map((r) => (
          <div key={r.id} className="card reportRow">
            <div className="reportLeft">
              <div className="reportIcon">📄</div>
              <div>
                <div className="apptTitle">{r.title}</div>
                <div className="apptSub">{r.description || "Medical Report"}</div>
                <div className="apptMeta">
                  📅 {formatDate(r.reportDate)} • {r.doctor ? `Dr. ${r.doctor.name}` : "Patient Upload"}
                </div>
              </div>
            </div>

            <div className="reportRight">
              <div className="tag ok">Verified</div>
              <div className="apptBtns">
                {r.fileUrl ? (
                    <>
                        <button className="btn ghost" onClick={() => downloadFile(`http://localhost:8080/api${r.fileUrl}`, r.title)}>
                            Download
                        </button>
                        <button className="btn" onClick={() => window.open(`http://localhost:8080/api${r.fileUrl}`, '_blank')}>
                            View
                        </button>
                    </>
                ) : (
                    <button className="btn" disabled style={{ opacity: 0.5 }}>No File</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && <div className="text-gray-500">No reports found.</div>}
      </div>

      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: 20
        }}>
            <div className="card" style={{ width: 550, maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="panelTitle">Upload Report & Update Vitals</div>
                <div className="panelSub">Fill in your health summary along with the report.</div>
                
                <form className="authForm" onSubmit={handleUpload} style={{ marginTop: 20, gap: 16 }}>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <div className="label">Report Title</div>
                            <input className="input" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. ECG Report" />
                        </div>
                        <div>
                            <div className="label">Heart Rate (bpm)</div>
                            <input className="input" value={hr} onChange={e => setHr(e.target.value)} placeholder="e.g. 72" />
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <div className="label">Report File</div>
                            <input type="file" className="input" required onChange={e => setFile(e.target.files[0])} accept="image/*,.pdf" />
                        </div>
                        <div>
                            <div className="label">Blood Pressure</div>
                            <input className="input" value={bp} onChange={e => setBp(e.target.value)} placeholder="e.g. 120/80" />
                        </div>
                    </div>

                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div>
                            <div className="label">Glucose</div>
                            <input className="input" value={glu} onChange={e => setGlu(e.target.value)} placeholder="e.g. 5.6" />
                        </div>
                        <div>
                            <div className="label">Weight (kg)</div>
                            <input className="input" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 70" />
                        </div>
                        <div>
                            <div className="label">Height (cm)</div>
                            <input className="input" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 175" />
                        </div>
                    </div>

                    <div>
                        <div className="label">Report Details / Description</div>
                        <textarea className="input" rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the report findings..." />
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button className="btn ghost" type="button" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="btn" type="submit" disabled={loading}>{loading ? "Uploading..." : "Save & Upload"}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
