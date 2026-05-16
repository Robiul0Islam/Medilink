import { useEffect, useMemo, useState } from "react";
import Stars from "../../components/Stars";
import Topbar from "../../components/Topbar";
import api, { API_BASE_URL } from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [patientCity, setPatientCity] = useState("Dhaka");
  const session = getSession();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [bookDate, setBookDate] = useState("");
  const [bookReason, setBookReason] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [sortOption, setSortOption] = useState("Recommended");

  const [bookedDocIds, setBookedDocIds] = useState(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await api.doctor.getAllApproved();
        setDoctors(data);

        if (session?.userId) {
          const profile = await api.patient.getProfile(session.userId);
          setPatientCity(profile.city || "Dhaka");
          
          // Fetch existing appointments to mark as booked
          const appts = await api.appointment.getByPatient(session.userId);
          const bookedIds = new Set();
          appts.forEach(a => {
              if ((a.status === 'PENDING' || a.status === 'SCHEDULED') && a.doctor) {
                  bookedIds.add(a.doctor.id);
              }
          });
          setBookedDocIds(bookedIds);
        }
      } catch (error) {
        console.error("Failed to load doctors", error);
      }
    }

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [session?.userId]);


  async function handleBook() {
      if (!bookDate) {
          alert("Please select a date");
          return;
      }
      if (!session?.userId) {
          alert("Please login to book appointments");
          return;
      }

      try {
          await api.appointment.create({
              patient: { id: session.userId },
              doctor: { id: selectedDoc.id },
              appointmentDate: bookDate,
              notes: bookReason,
              status: "PENDING"
          });
          alert("Appointment requested successfully!");
          setShowModal(false);
          setBookDate("");
          setBookReason("");
          
          // Optimistically update UI
          setBookedDocIds(prev => new Set(prev).add(selectedDoc.id));
      } catch (e) {
          alert("Booking failed: " + e.message);
      }
  }

  async function openReviews(doc) {
      setSelectedDoc(doc);
      try {
          const data = await api.review.getByDoctor(doc.id);
          setReviews(data);
          setShowReviewsModal(true);
      } catch (e) {
          alert("Failed to load reviews");
      }
  }

  function openBook(doc) {
      setSelectedDoc(doc);
      setBookDate("");
      setBookReason("");
      setShowModal(true);
  }

  const resolveAvatar = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  const specialties = useMemo(() => {
    const list = doctors.map(d => d.specialty).filter(Boolean);
    return ["All", ...new Set(list)];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    let result = [...doctors];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        d.name?.toLowerCase().includes(q) || 
        d.specialty?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q) ||
        d.clinic?.toLowerCase().includes(q)
      );
    }

    // 2. Specialty filter
    if (selectedSpecialty !== "All") {
      result = result.filter(d => d.specialty === selectedSpecialty);
    }

    // 3. Sorting
    if (sortOption === "Highest Rated") {
      result.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    } else if (sortOption === "Most Reviewed") {
      result.sort((a, b) => (Number(b.reviewCount) || 0) - (Number(a.reviewCount) || 0));
    }

    return result;
  }, [doctors, searchQuery, selectedSpecialty, sortOption]);

  return (
    <div className="container">
      <Topbar
        title={<>Doctors</>}
        subtitle={`Find specialists in ${patientCity}, Bangladesh`}
        searchPlaceholder="Search doctors, specialties..."
      />

      <div className="doctorTools">
        <div className="toolSearch">
          <span className="searchIcon">🔎</span>
          <input
            className="searchInput"
            placeholder="Search by name, specialty, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select 
            className="select" 
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
        >
          {specialties.map(s => (
            <option key={s} value={s}>{s === "All" ? "All Specialties" : s}</option>
          ))}
        </select>

        <select 
            className="select" 
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="Recommended">Sort: Recommended</option>
          <option value="Highest Rated">Sort: Highest Rated</option>
          <option value="Most Reviewed">Sort: Most Reviewed</option>
        </select>
      </div>

      <div className="doctorGrid">
        {filteredDoctors.map((d) => {
          const isBooked = bookedDocIds.has(d.id);
          return (
            <div key={d.id} className="card docTile">
              <div className="docTop">
                <img
                  className="docTileAvatar"
                  src={resolveAvatar(d.avatar)}
                  alt={d.name}
                />

                <div className="docTopInfo">
                  <div className="docName docNameDark">{d.name}</div>
                  <div className="docSpec">{d.specialty}</div>

                  <div className="ratingRow" style={{ marginTop: 6 }}>
                    <Stars value={d.rating || 0} />
                    <div className="ratingText">
                      <button 
                        className="linkBtn" 
                        style={{ fontSize: 13, padding: 0, fontWeight: 700 }}
                        onClick={() => openReviews(d)}
                      >
                        <b>{(d.rating || 0).toFixed(1)}</b> ({d.reviewCount || 0} Reviews)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="metaRow" style={{ marginTop: 10 }}>
                📍 {d.clinic}
              </div>

              <div className="docBottom">
                <div className="pill">{d.status || "Available"}</div>
                {isBooked ? (
                   <button className="bookBtn" style={{backgroundColor: '#ccc', cursor: 'default'}} disabled>Booked</button>
                ) : d.status === 'Not Available' ? (
                   <button className="bookBtn" style={{backgroundColor: '#fca5a5', cursor: 'not-allowed', color: '#7f1d1d'}} disabled>Unavailable</button>
                ) : (
                   <button className="bookBtn" onClick={() => openBook(d)}>Book Appointment</button>
                )}
              </div>
            </div>
          );
        })}
        {doctors.length === 0 && <div className="text-gray-500 p-4">No doctors found.</div>}
      </div>

      {showModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: 400, padding: 24 }}>
                <div className="panelTitle">Book Appointment</div>
                <div className="panelSub">with Dr. {selectedDoc?.name}</div>
                
                <div style={{ marginTop: 16 }}>
                    <div className="label">Preferred Date</div>
                    <input 
                        className="input" 
                        type="date" 
                        value={bookDate}
                        onChange={e => setBookDate(e.target.value)}
                    />
                </div>
                
                <div style={{ marginTop: 12 }}>
                    <div className="label">Reason / Problem</div>
                    <textarea 
                        className="input" 
                        rows={3}
                        value={bookReason}
                        onChange={e => setBookReason(e.target.value)}
                        placeholder="Describe your issue..."
                    />
                </div>

                <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button className="btn ghost" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn" onClick={handleBook}>Request Appointment</button>
                </div>
            </div>
        </div>
      )}

      {showReviewsModal && selectedDoc && (
          <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
              <div className="card" style={{ width: 500, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 24 }}>
                  <div className="panelTitle">Patient Reviews</div>
                  <div className="panelSub">for Dr. {selectedDoc.name}</div>
                  
                  <div className="list" style={{ marginTop: 20, overflowY: 'auto', flex: 1, paddingRight: 10 }}>
                      {reviews.map(r => (
                          <div key={r.id} className="card" style={{ padding: 16, background: '#f9fbff', marginBottom: 12 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                  <div style={{ fontWeight: 800, color: '#1f2a44' }}>{r.patient?.name || "Patient"}</div>
                                  <Stars value={r.rating} />
                              </div>
                              <div style={{ fontSize: 13, fontStyle: 'italic', color: '#6b7a99' }}>
                                  "{r.comment || "No comment provided."}"
                              </div>
                              <div style={{ fontSize: 11, marginTop: 8, color: '#94a3b8' }}>
                                  {new Date(r.createdAt).toLocaleDateString()}
                              </div>
                          </div>
                      ))}
                      {reviews.length === 0 && <div className="text-gray-500 text-center py-6">No reviews yet for this doctor.</div>}
                  </div>

                  <div style={{ marginTop: 20, textAlign: 'right' }}>
                      <button className="btn" onClick={() => setShowReviewsModal(false)}>Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
