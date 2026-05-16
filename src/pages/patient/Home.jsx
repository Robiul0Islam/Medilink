import { useEffect, useState } from "react";
import Stars from "../../components/Stars";
import Topbar from "../../components/Topbar";
import api, { API_BASE_URL } from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function Home() {
  const [patient, setPatient] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const session = getSession();

  const [nextAppt, setNextAppt] = useState(null);
  const [bookedDocIds, setBookedDocIds] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFullPost, setShowFullPost] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (session?.userId) {
        try {
          // Fetch patient profile
          const pData = await api.patient.getProfile(session.userId);
          setPatient(pData);
          
          // Fetch doctors
          const dData = await api.doctor.getAllApproved();
          // Sort by popularity (rating descending)
          const sorted = dData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setDoctors(sorted.slice(0, 3)); // Show top 3 highest rated

          // Fetch posts
          const postData = await api.post.getApproved();
          setPosts(postData.sort((a, b) => b.id - a.id).slice(0, 2));

          // Fetch appointments ...
          try {
             const appts = await api.appointment.getByPatient(session.userId);
             
             // Track booked doctors
             const bookedIds = new Set();
             appts.forEach(a => {
                if (a.status === 'PENDING' || a.status === 'SCHEDULED') {
                    bookedIds.add(a.doctor.id);
                }
             });
             setBookedDocIds(bookedIds);

             // Sort by date then time
             const sortedAppts = [...appts].sort((a, b) => {
                 const dateA = new Date(a.appointmentDate + (a.appointmentTime ? 'T' + a.appointmentTime : ''));
                 const dateB = new Date(b.appointmentDate + (b.appointmentTime ? 'T' + b.appointmentTime : ''));
                 return dateA - dateB;
             });

             const scheduled = sortedAppts.filter(a => a.status === 'SCHEDULED');
             const pending = sortedAppts.filter(a => a.status === 'PENDING');
             
             if (scheduled.length > 0) {
                 setNextAppt(scheduled[0]);
             } else if (pending.length > 0) {
                 setNextAppt(pending[0]);
             }
          } catch(e) {
              console.error("Failed to load appointments", e);
          }

        } catch (error) {
          console.error("Failed to load home data", error);
        }
      }
    }

    if (session?.userId) {
      fetchData(); // Initial fetch
      const interval = setInterval(fetchData, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [session?.userId]);

  if (!patient) return <div className="p-4">Loading...</div>;

  const formatTime = (t) => t ? t.slice(0, 5) : "";

  const resolveAvatar = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  return (
    <div className="container">
      <Topbar
        title={
          <>
            Welcome back, <b>{patient.name}</b> 👋
          </>
        }
        subtitle={`📍 ${patient.city || "Dhaka"}, Bangladesh • Find doctors, book appointments, view reports`}
        searchPlaceholder="Search doctors, departments..."
      />

      <section className="grid">
        <div className="col">
          <div className="sectionHeader">
            <div className="sectionTitle">Recommended Doctors (Bangladesh)</div>
            <button className="seeAll" onClick={() => window.location.href='/p/doctors'}>See All →</button>
          </div>

          <div className="list">
            {doctors.map((d) => (
              <div key={d.id} className="card doctorCard">
                <img className="avatar" src={resolveAvatar(d.avatar)} alt={d.name} />

                <div className="docInfo">
                  <div className="docName docNameDark">{d.name}</div>

                  <div className="docSpec">{d.specialty}</div>

                  <div className="ratingRow">
                    <Stars value={d.rating || 0} />
                    <div className="ratingText">
                      <b>{(d.rating || 0).toFixed(1)}</b> ({d.reviewCount || 0} Reviews)
                    </div>
                  </div>

                  <div className="metaRow">📍 {d.clinic} · {d.status || "Available"}</div>
                </div>

                <div className="rightCol">
                  <div className="pill">{d.status || "Available"}</div>
                  {bookedDocIds.has(d.id) ? (
                    <button className="bookBtn" style={{backgroundColor: '#ccc', cursor: 'default'}} disabled>Booked</button>
                  ) : d.status === 'Not Available' ? (
                    <button className="bookBtn" style={{backgroundColor: '#fca5a5', cursor: 'not-allowed', color: '#7f1d1d'}} disabled>Unavailable</button>
                  ) : (
                    <button className="bookBtn" onClick={() => window.location.href='/p/doctors'}>Book</button>
                  )}
                </div>
              </div>
            ))}
            {doctors.length === 0 && <div className="text-gray-500">No doctors found.</div>}
          </div>

          <div className="sectionHeader mt">
            <div className="sectionTitle">Health Awareness Posts</div>
            <button className="seeAll" onClick={() => window.location.href='/p/awareness'}>See All →</button>
          </div>

          <div className="shows">
            {posts.map((p) => (
              <div key={p.id} className="card showCard">
                {/* <div
                  className="showImg"
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1505751172107-16d7a4697e3a?auto=format&fit=crop&q=20&w=400)` }}
                /> */}
                <div className="showBody">
                  <div className="showTitle">{p.title}</div>
                  <div className="showBy">By Dr. {p.doctor?.name}</div>
                  <div className="postSnippet">
                    {p.content?.length > 120 ? p.content.substring(0, 120) + "..." : p.content}
                  </div>
                  <button className="watchBtn" onClick={() => { setSelectedPost(p); setShowFullPost(true); }}>
                    Read More 📖
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <div className="text-gray-500">No posts available.</div>}
          </div>
        </div>

        <aside className="panel">
          <div className="card panelCard">
            <div className="panelTitle">Next Appointment</div>
            <div className="panelRow">
              <div className="dot" style={{ backgroundColor: nextAppt ? (nextAppt.status === 'SCHEDULED' ? '#00e676' : '#ff9800') : '#ddd' }} />
              <div>
                {nextAppt ? (
                    <>
                        <div className="panelMain">{nextAppt.doctor?.name}</div>
                        <div className="panelSub">{nextAppt.doctor?.specialty}</div>
                        <div className="panelSub" style={{ marginTop: 4 }}>
                            {nextAppt.status === 'SCHEDULED' ? (
                                <>
                                    📅 {nextAppt.appointmentDate} at {formatTime(nextAppt.appointmentTime)}<br/>
                                    📍 <b>{nextAppt.doctor?.clinic}</b><br/>
                                    {nextAppt.doctor?.address && <div style={{marginTop:2}}>🏠 {nextAppt.doctor.address}</div>}
                                    {nextAppt.doctor?.phone && <div>📞 {nextAppt.doctor.phone}</div>}
                                </>
                            ) : (
                                <>Status: {nextAppt.status} (Requested: {nextAppt.appointmentDate})</>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="panelMain">No upcoming appointment</div>
                        <div className="panelSub">
                          Book a doctor now!
                        </div>
                    </>
                )}
              </div>
            </div>
            <div className="panelActions">
              <button className="btn">View Details</button>
            </div>
          </div>

          

          <div className="card panelCard">
            <div className="panelTitle">Health Summary</div>
            <div className="summary">
              <div className="summaryItem">
                <div className="k">Heart Rate</div>
                <div className="v">{patient.heartRate || "--"} bpm</div>
              </div>
              <div className="summaryItem">
                <div className="k">Blood Pressure</div>
                <div className="v">{patient.bloodPressure || "--"}</div>
              </div>
              <div className="summaryItem">
                <div className="k">Glucose</div>
                <div className="v">{patient.glucose || "--"}</div>
              </div>
              <div className="summaryItem">
                <div className="k">Weight</div>
                <div className="v">{patient.weight || "--"} kg</div>
              </div>
              <div className="summaryItem">
                <div className="k">Height</div>
                <div className="v">{patient.height || "--"} cm</div>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {showFullPost && selectedPost && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
              <div className="card" style={{ width: 600, maxHeight: '85vh', display: 'flex', flexDirection: 'column', padding: 30, borderRadius: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="showBy" style={{ marginBottom: 0 }}>Health Awareness</div>
                      <button className="iconBtn" style={{ padding: '6px 10px', fontSize: 18 }} onClick={() => setShowFullPost(false)}>✕</button>
                  </div>
                  
                  <div style={{ overflowY: 'auto', marginTop: 20, paddingRight: 10 }}>
                      <div className="panelMain" style={{ fontSize: 24, lineHeight: 1.3, marginBottom: 12 }}>{selectedPost.title}</div>
                      <div className="apptMeta" style={{ marginBottom: 20, fontSize: 14 }}>
                          👨‍⚕️ <b>Dr. {selectedPost.doctor?.name}</b> • {selectedPost.doctor?.specialty} • 📅 {new Date(selectedPost.createdAt).toLocaleDateString()}
                      </div>
                      <div className="panelSub" style={{ color: '#334155', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: 16 }}>
                          {selectedPost.content}
                      </div>
                  </div>

                  <div style={{ marginTop: 24, textAlign: 'right' }}>
                      <button className="btn" onClick={() => setShowFullPost(false)}>Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
