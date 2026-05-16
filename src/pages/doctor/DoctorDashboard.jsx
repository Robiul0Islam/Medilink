import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function DoctorDashboard() {
  const session = getSession();
  const nav = useNavigate();
  const [stats, setStats] = useState({ pending: 0, scheduled: 0, chats: 0, posts: 0 });
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!session?.userId) return;
      
      try {
        const results = await Promise.allSettled([
          api.appointment.getByDoctor(session.userId),
          api.chat.getConversations(session.userId),
          api.post.getByDoctor(session.userId)
        ]);

        const appts = results[0].status === 'fulfilled' ? results[0].value : [];
        const convs = results[1].status === 'fulfilled' ? results[1].value : [];
        const posts = results[2].status === 'fulfilled' ? results[2].value : [];

        if (results.some(r => r.status === 'rejected')) {
            console.warn("Some dashboard components failed to load", results);
        }

        const pending = appts.filter(a => a.status === 'PENDING');
        const scheduled = appts.filter(a => a.status === 'SCHEDULED');
        
        setStats({ 
          pending: pending.length, 
          scheduled: scheduled.length, 
          chats: convs.length, 
          posts: posts.length 
        });

        setPendingList(pending.slice(0, 5));

        // Show scheduled visits starting from today
        const today = new Date();
        today.setHours(0,0,0,0);

        const upcoming = scheduled.filter(a => {
            const apptDate = new Date(a.appointmentDate);
            // Add a little buffer for timezones (Local vs UTC)
            apptDate.setHours(0,0,0,0);
            return apptDate >= today;
        });

        // Sort upcoming by date/time
        const sorted = upcoming.sort((a, b) => {
            const dateA = new Date(a.appointmentDate + 'T' + (a.appointmentTime || '00:00'));
            const dateB = new Date(b.appointmentDate + 'T' + (b.appointmentTime || '00:00'));
            return dateA - dateB;
        });
        
        setUpcomingAppts(sorted.slice(0, 10)); // Show up to top 10 upcoming

      } catch (e) {
        console.error("Critical failure in dashboard data fetch", e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [session?.userId]);

  const formatTime = (t) => t ? t.slice(0, 5) : "--:--";

  return (
    <div className="container">
      <Topbar
        title={<>Welcome back, <b>Dr. {session?.name || "Doctor"}</b> 👋</>}
        subtitle="Here's what's happening with your practice today."
        searchPlaceholder="Search in dashboard..."
      />

      <div className="apptStats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="card statCard" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="statK">Pending Requests</div>
          <div className="statV" style={{ fontSize: 24 }}>{stats.pending}</div>
        </div>
        <div className="card statCard" style={{ borderLeft: '4px solid #1f6feb' }}>
          <div className="statK">Upcoming Visits</div>
          <div className="statV" style={{ fontSize: 24 }}>{stats.scheduled}</div>
        </div>
        <div className="card statCard" style={{ borderLeft: '4px solid #2ea44f' }}>
          <div className="statK">Active Chats</div>
          <div className="statV" style={{ fontSize: 24 }}>{stats.chats}</div>
        </div>
        <div className="card statCard" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="statK">My Posts</div>
          <div className="statV" style={{ fontSize: 24 }}>{stats.posts}</div>
        </div>
      </div>

      <div className="grid">
        <div className="col">
          <div className="sectionHeader">
            <div className="sectionTitle">New Pending Requests</div>
            <button className="seeAll" onClick={() => nav("/doctor/appointments")}>Manage All →</button>
          </div>

          <div className="list">
             {loading ? <div className="p-4">Loading requests...</div> : 
              pendingList.length === 0 ? (
                <div className="card" style={{ padding: '20px', textAlign: 'center', opacity: 0.7 }}>
                    No new pending requests.
                </div>
              ) : (
                pendingList.map(a => (
                    <div key={a.id} className="card apptCard" style={{ padding: '12px 16px' }}>
                        <div className="apptLeft">
                            <div className="apptInfo">
                                <div className="apptTitle" style={{ fontSize: 14 }}>{a.patient?.name}</div>
                                <div className="apptSub" style={{ fontSize: 12 }}>Requested: {a.appointmentDate}</div>
                            </div>
                        </div>
                        <button className="btn ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => nav("/doctor/appointments")}>Details</button>
                    </div>
                ))
              )
             }
          </div>

          <div className="sectionHeader mt">
            <div className="sectionTitle">Scheduled Visits (Next 10 Days)</div>
            <button className="seeAll" onClick={() => nav("/doctor/appointments")}>View All →</button>
          </div>

          <div className="list">
             {loading ? <div className="p-4">Loading schedule...</div> : 
              upcomingAppts.length === 0 ? (
                <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
                    <div className="panelMain">No visits scheduled for the next 10 days.</div>
                </div>
              ) : (
                upcomingAppts.map(a => (
                    <div key={a.id} className="card apptCard" style={{ cursor: 'pointer' }} onClick={() => nav("/doctor/appointments")}>
                        <div className="apptLeft">
                            <div className="apptDate" style={{ background: '#eaf2ff', color: '#1f6feb', borderColor: '#cfe0ff' }}>
                                <div className="apptDay">{new Date(a.appointmentDate).getDate()}</div>
                                <div className="apptMon">{new Date(a.appointmentDate).toLocaleString('default', { month: 'short' }).toUpperCase()}</div>
                            </div>
                            <div className="apptInfo">
                                <div className="apptTitle">{a.patient?.name}</div>
                                <div className="apptSub">{a.notes || "Checkup"}</div>
                                <div className="apptMeta">🕒 {formatTime(a.appointmentTime)} · 📍 {a.patient?.city || "Clinic"}</div>
                            </div>
                        </div>
                        <div className="apptRight">
                            <div className="apptStatus scheduled">{a.status}</div>
                        </div>
                    </div>
                ))
              )
             }
          </div>
        </div>

      </div>
    </div>
  );
}
