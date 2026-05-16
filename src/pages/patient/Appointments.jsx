import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api, { API_BASE_URL } from "../../utils/api";
import { getSession } from "../../utils/auth";

const resolveAvatar = (path) => {
  if (!path) return "https://via.placeholder.com/150";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}${path}`;
};

function AppointmentCard({ a, onCancel, onView }) {
  const date = new Date(a.appointmentDate);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
  
  const formatTime = (t) => t ? t.slice(0, 5) : "--:--";

  return (
    <div className="card apptCard">
      <div className="apptLeft">
        <div className="apptDate">
          <div className="apptDay">{day}</div>
          <div className="apptMon">{month}</div>
        </div>

        <div className="apptInfo">
          <div className="apptTitle">Dr. {a.doctor?.name || "Doctor"}</div>
          <div className="apptSub">
            {a.doctor?.specialty || "Specialist"} • {a.doctor?.clinic || "Hospital"}
          </div>
          <div className="apptMeta">
            🕒 {formatTime(a.appointmentTime)} • 📍 {a.doctor?.city || "Dhaka"}
            {a.status === 'SCHEDULED' && (
              <div style={{ marginTop: 6, color: '#1f6feb', fontWeight: '800', fontSize: '12px' }}>
                🏠 {a.doctor?.address} <br/> 📞 {a.doctor?.phone}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="apptRight">
        <div className={`apptStatus ${a.status.toLowerCase()}`}>{a.status}</div>
        <div className="apptBtns">
          {(a.status === 'SCHEDULED' || a.status === 'PENDING') && (
            <button className="btn ghost" onClick={() => onCancel(a.id)}>Cancel</button>
          )}
          <button className="btn" onClick={() => onView(a)}>View</button>
        </div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const session = getSession();

  const fetchData = async () => {
    if (session?.userId) {
      try {
        const [apptData, profileData] = await Promise.all([
          api.appointment.getByPatient(session.userId),
          api.patient.getProfile(session.userId)
        ]);

        // Sort by date then time
        apptData.sort((a, b) => {
           const dateA = new Date(a.appointmentDate + (a.appointmentTime ? 'T' + a.appointmentTime : ''));
           const dateB = new Date(b.appointmentDate + (b.appointmentTime ? 'T' + b.appointmentTime : ''));
           return dateB - dateA; // Newest first
        });

        setAppointments(apptData);
        setPatient(profileData);
      } catch (error) {
        console.error("Failed to load appointments", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [session?.userId]);

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await api.appointment.update(id, { status: 'CANCELLED' });
      fetchData(); // Refresh
    } catch (e) {
      alert("Failed to cancel appointment: " + e.message);
    }
  };

  const openDetails = (appt) => {
    setSelectedAppt(appt);
    setShowDetails(true);
  };

  const openReviewModal = (appt) => {
    setSelectedAppt(appt);
    setReviewRating(5);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
      e.preventDefault();
      if (!selectedAppt) return;
      
      setIsSubmitting(true);
      try {
          await api.review.create({
              patient: { id: session.userId },
              doctor: { id: selectedAppt.doctor.id },
              rating: reviewRating,
              comment: reviewComment
          });
          alert("Thank you for your review!");
          setShowReviewModal(false);
          fetchData(); // Refresh stats/data if needed
      } catch (e) {
          alert("Failed to submit review: " + e.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  const upcoming = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING');
  const past = appointments.filter(a => a.status === 'COMPLETED');
  const cancelled = appointments.filter(a => a.status === 'CANCELLED' || a.status === 'REJECTED');

  if (!patient) return <div className="p-4">Loading...</div>;

  const formatTime = (t) => t ? t.slice(0, 5) : "--:--";

  return (
    <div className="container">
      <Topbar
        title={<>Appointments</>}
        subtitle={`Manage your visits • ${patient.city || "Dhaka"}, Bangladesh`}
        searchPlaceholder="Search appointments..."
      />

      <div className="apptStats">
        <div className="card statCard">
          <div className="statK">Active Requests</div>
          <div className="statV">{upcoming.length}</div>
        </div>

        <div className="card statCard">
          <div className="statK">Completed</div>
          <div className="statV">
            {past.length}
          </div>
        </div>

        <div className="card statCard">
          <div className="statK">Cancelled/Rejected</div>
          <div className="statV">
            {cancelled.length}
          </div>
        </div>

        <div className="card statCard">
          <div className="statK">Patient</div>
          <div className="statV">{patient.name}</div>
        </div>
      </div>

      <div className="apptGrid">
        <div>
          <div className="sectionHeader">
            <div className="sectionTitle">Upcoming & Pending</div>
            <button className="seeAll" onClick={() => window.location.href='/p/doctors'}>New ➕</button>
          </div>

          <div className="list">
            {upcoming.map((a) => (
              <AppointmentCard key={a.id} a={a} onCancel={handleCancel} onView={openDetails} />
            ))}
            {upcoming.length === 0 && <div className="text-gray-500 py-4 font-bold">No active appointment requests.</div>}
          </div>

          <div className="sectionHeader mt">
            <div className="sectionTitle">Past Appointments</div>
            <button className="seeAll">History →</button>
          </div>

          <div className="list">
            {past.map((a) => (
               <div key={a.id} className="card apptCard">
                 <div className="apptLeft">
                   <div className="apptDate" style={{ background: '#f0f4f8', color: '#6b7a99' }}>
                     <div className="apptDay">{new Date(a.appointmentDate).getDate()}</div>
                     <div className="apptMon">{new Date(a.appointmentDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                   </div>
                   <div className="apptInfo">
                     <div className="apptTitle">Dr. {a.doctor?.name}</div>
                     <div className="apptSub">{a.doctor?.specialty}</div>
                     <div className="apptMeta">Completed on {a.appointmentDate}</div>
                   </div>
                 </div>
                 <div className="apptRight">
                   <div className="apptStatus completed">COMPLETED</div>
                   <div className="apptBtns">
                     <button className="btn" onClick={() => openReviewModal(a)}>Rate & Review</button>
                     <button className="btn ghost" onClick={() => openDetails(a)}>View</button>
                   </div>
                 </div>
               </div>
            ))}
            {cancelled.map((a) => (
               <AppointmentCard key={a.id} a={a} onCancel={handleCancel} onView={openDetails} />
            ))}
             {(past.length + cancelled.length) === 0 && <div className="text-gray-500 py-4 font-bold">No past appointments found.</div>}
          </div>
        </div>
        <div className="mt-5"></div>
        <aside className="panel">

          <div className="card panelCard">
            <div className="panelTitle">Patient Guidelines</div>
            <div className="panelSub" style={{lineHeight: '1.6'}}>
              • <b>Arrive early</b>: Be there 10 mins before time.
              <br />
              • <b>Reports</b>: Always carry your recent medical files.
              <br />
              • <b>Identification</b>: Keep your NID or Hospital ID handy.
              <br />
              • <b>Cancellations</b>: Please cancel at least 2 hours prior.
            </div>
          </div>
        </aside>
      </div>

      {showDetails && selectedAppt && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: 450, padding: 24 }}>
                <div className="panelTitle">Appointment Details</div>
                <div className="panelSub">Ref: #{selectedAppt.id}</div>
                
                <div style={{ marginTop: 20 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                        <img 
                            src={resolveAvatar(selectedAppt.doctor?.avatar)} 
                            alt={selectedAppt.doctor?.name} 
                            style={{ width: 60, height: 60, borderRadius: 16, border: '1px solid #e6edf6' }}
                        />
                        <div>
                            <div className="panelMain" style={{ fontSize: 16 }}>Dr. {selectedAppt.doctor?.name}</div>
                            <div className="panelSub">{selectedAppt.doctor?.specialty}</div>
                        </div>
                    </div>

                    <div className="list" style={{ gap: 10 }}>
                        <div className="summaryItem">
                            <div className="k">Status</div>
                            <div className={`apptStatus ${selectedAppt.status.toLowerCase()}`}>{selectedAppt.status}</div>
                        </div>
                        <div className="summaryItem">
                            <div className="k">Date & Time</div>
                            <div className="v">{selectedAppt.appointmentDate} at {formatTime(selectedAppt.appointmentTime)}</div>
                        </div>
                        <div className="summaryItem">
                            <div className="k">Clinic / Location</div>
                            <div className="v">{selectedAppt.doctor?.clinic || "MediLink Clinic"}</div>
                        </div>
                        {selectedAppt.doctor?.address && (
                            <div className="summaryItem">
                                <div className="k">Address</div>
                                <div className="v" style={{ textAlign: 'right', maxWidth: '60%' }}>{selectedAppt.doctor.address}</div>
                            </div>
                        )}
                        {selectedAppt.doctor?.phone && (
                            <div className="summaryItem">
                                <div className="k">Doctor Contact</div>
                                <div className="v">{selectedAppt.doctor.phone}</div>
                            </div>
                        )}
                        <div className="card" style={{ padding: 12, marginTop: 4, background: '#f9fbff', borderStyle: 'dashed' }}>
                            <div className="label">Problem Description</div>
                            <div style={{ fontSize: 13, lineHeight: '1.4', color: '#1f2a44' }}>
                                {selectedAppt.notes || "No details provided by patient."}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn" onClick={() => setShowDetails(false)}>Close</button>
                </div>
            </div>
        </div>
      )}

      {showReviewModal && selectedAppt && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
              <div className="card" style={{ width: 450, padding: 24 }}>
                  <div className="panelTitle">Rate Your Experience</div>
                  <div className="panelSub">How was your visit with Dr. {selectedAppt.doctor?.name}?</div>
                  
                  <form onSubmit={handleReviewSubmit} style={{ marginTop: 20 }}>
                      <div className="label">Rating</div>
                      <div style={{ display: 'flex', gap: 10, margin: '10px 0 20px 0' }}>
                          {[1, 2, 3, 4, 5].map(s => (
                              <button 
                                  key={s} 
                                  type="button" 
                                  onClick={() => setReviewRating(s)}
                                  style={{
                                      background: reviewRating >= s ? '#ffd700' : '#e6edf6',
                                      border: 'none', borderRadius: '50%', width: 40, height: 40,
                                      cursor: 'pointer', fontSize: 20
                                  }}
                              >
                                  ⭐
                              </button>
                          ))}
                      </div>

                      <div className="label">Your Feedback (Optional)</div>
                      <textarea 
                          className="input" 
                          rows={4} 
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          placeholder="Tell us about your experience..."
                          style={{ marginBottom: 20 }}
                      />

                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                          <button className="btn ghost" type="button" onClick={() => setShowReviewModal(false)}>Cancel</button>
                          <button className="btn" type="submit" disabled={isSubmitting}>
                              {isSubmitting ? "Submitting..." : "Submit Review"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
}
