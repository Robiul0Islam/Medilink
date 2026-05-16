import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api, { API_BASE_URL } from "../../utils/api";
import { clearSession, getSession, setSession } from "../../utils/auth";

export default function Settings() {
  const session = getSession();
  const userId = session?.userId;
  const userRole = session?.role;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({
    name: "", city: "", weight: "", height: "", heartRate: "", bloodPressure: "", glucose: "", bmi: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: ""
  });
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("info");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        let data;
        if (userRole === "PATIENT") {
          data = await api.patient.getProfile(userId);
        } else if (userRole === "DOCTOR") {
          data = await api.doctor.getById(userId);
        } else {
          data = await api.auth.getCurrentUser();
        }
        setProfile(data);
        setProfileForm({
          name: data.name || "",
          city: data.city || "",
          weight: data.weight || "",
          height: data.height || "",
          heartRate: data.heartRate || "",
          bloodPressure: data.bloodPressure || "",
          glucose: data.glucose || "",
          bmi: data.bmi || "",
          specialty: data.specialty || "",
          clinic: data.clinic || ""
        });
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [userId, userRole]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setAvatarFile(file);
          setAvatarPreview(URL.createObjectURL(file));
      }
  };

  const handleSaveProfile = async () => {
    setMsg("");
    setSaving(true);
    try {
      if (session.role === "PATIENT") {
        const formData = new FormData();
        if (avatarFile) formData.append("file", avatarFile);
        formData.append("name", profileForm.name);
        formData.append("city", profileForm.city);
        formData.append("weight", profileForm.weight);
        formData.append("height", profileForm.height);
        formData.append("heartRate", profileForm.heartRate);
        formData.append("bloodPressure", profileForm.bloodPressure);
        formData.append("glucose", profileForm.glucose);

        const updated = await api.patient.updateProfileFormData(session.userId, formData);
        setProfile(updated);
        setProfileForm(prev => ({ ...prev, bmi: updated.bmi })); 
        
        // Update local session to reflect changes globally
        const newSession = { ...session, name: updated.name, avatar: updated.avatar, city: updated.city };
        setSession(newSession);
        
        setAvatarFile(null);
        setAvatarPreview(null);
      } else if (session.role === "DOCTOR") {
        const formData = new FormData();
        if (avatarFile) formData.append("file", avatarFile);
        formData.append("name", profileForm.name);
        formData.append("city", profileForm.city);
        formData.append("specialty", profileForm.specialty);
        formData.append("clinic", profileForm.clinic);
        formData.append("address", profileForm.address || "");
        formData.append("phone", profileForm.phone || "");

        const updated = await api.doctor.updateProfileFormData(session.userId, formData);
        setProfile(updated);
        
        // Update local session to reflect changes globally
        const newSession = { ...session, name: updated.name, avatar: updated.avatar, city: updated.city };
        setSession(newSession);
        
        setAvatarFile(null);
        setAvatarPreview(null);
      }
      setMsg("Profile updated successfully!");
      setMsgType("success");
    } catch (error) {
      setMsg("Failed to update profile.");
      setMsgType("error");
      console.error(error);
    } finally {
        setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setMsg("Please fill all password fields");
      setMsgType("error");
      return;
    }
    try {
      await api.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMsg("Password changed successfully!");
      setMsgType("success");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (e) {
      setMsg(e.message || "Failed to change password");
      setMsgType("error");
    }
  };

  if (loading) return <div className="p-4">Loading settings...</div>;
  if (!profile) return <div className="p-4">Failed to load profile.</div>;

  const getAvatarUrl = () => {
      if (avatarPreview) return avatarPreview;
      if (profile?.avatar) return `${API_BASE_URL}${profile.avatar}`;
      return "https://via.placeholder.com/150";
  };

  return (
    <div className="container">
      <Topbar
        title={<>Settings</>}
        subtitle="Profile, security and preferences"
        searchPlaceholder="Search settings..."
      />

      <div className="settingsGrid">
        <div className="card settingCard">
          <div className="panelTitle">Personal Details</div>

          <div className="profileRow" style={{ position: 'relative' }}>
            <div style={{ position: 'relative', width: 100, height: 100 }}>
                <img
                    className="profileAvatar"
                    src={getAvatarUrl()}
                    alt={profile.name}
                    style={{ width: 100, height: 100, objectFit: 'cover' }}
                />
                <label style={{
                    position: 'absolute', bottom: 0, right: 0,
                    background: '#1f6feb', color: '#fff', borderRadius: '50%',
                    width: 32, height: 32, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', border: '2px solid #fff'
                }}>
                    📷
                    <input type="file" style={{ display: 'none' }} onChange={handleFileChange} accept="image/*" />
                </label>
            </div>
            <div style={{ flex: 1 }}>
              <div className="panelMain">{profile.name}</div>
              <div className="panelSub">{profile.city || "City not set"}, Bangladesh</div>
              <div className="panelSub">{profile.email}</div>
              <div className="pill" style={{marginTop: 5}}>{session.role}</div>
            </div>
          </div>

          <div className="formGrid" style={{ marginTop: 24 }}>
            <div>
              <div className="label">Full Name</div>
              <input 
                className="input" 
                name="name" 
                value={profileForm.name} 
                onChange={handleProfileChange} 
              />
            </div>

            <div>
              <div className="label">City</div>
              <input 
                className="input" 
                name="city" 
                value={profileForm.city} 
                onChange={handleProfileChange} 
              />
            </div>

            {session.role === "PATIENT" && (
              <>
                <div className="grid col-2" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <div className="label">Weight (kg)</div>
                        <input 
                            className="input" 
                            name="weight" 
                            placeholder="e.g. 70"
                            value={profileForm.weight} 
                            onChange={handleProfileChange} 
                        />
                    </div>
                    <div>
                        <div className="label">Height (feet)</div>
                        <input 
                            className="input" 
                            name="height" 
                            placeholder="e.g. 5.8"
                            value={profileForm.height} 
                            onChange={handleProfileChange} 
                        />
                    </div>
                </div>

                <div className="grid col-2" style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <div className="label">Blood Pressure</div>
                        <input 
                            className="input" 
                            name="bloodPressure" 
                            placeholder="e.g. 120/80"
                            value={profileForm.bloodPressure} 
                            onChange={handleProfileChange} 
                        />
                    </div>
                    <div>
                        <div className="label">Glucose</div>
                        <input 
                            className="input" 
                            name="glucose" 
                            placeholder="e.g. 6.5"
                            value={profileForm.glucose} 
                            onChange={handleProfileChange} 
                        />
                    </div>
                </div>

                <div>
                    <div className="label">Heart Rate (bpm)</div>
                    <input 
                        className="input" 
                        name="heartRate" 
                        placeholder="e.g. 72"
                        value={profileForm.heartRate} 
                        onChange={handleProfileChange} 
                    />
                </div>

                
              </>
            )}

            {session.role === "DOCTOR" && (
              <>
                <div>
                  <div className="label">Specialty</div>
                  <input 
                    className="input" 
                    name="specialty" 
                    value={profileForm.specialty} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div>
                  <div className="label">Clinic</div>
                  <input 
                    className="input" 
                    name="clinic" 
                    value={profileForm.clinic} 
                    onChange={handleProfileChange} 
                  />
                </div>

                <div>
                  <div className="label">Clinic Address</div>
                  <input 
                    className="input" 
                    name="address" 
                    value={profileForm.address || ""} 
                    onChange={handleProfileChange} 
                    placeholder="e.g. Dhaka Medical College Hospital"
                  />
                </div>
                 <div>
                  <div className="label">Contact Phone No.</div>
                  <input 
                    className="input" 
                    name="phone" 
                    value={profileForm.phone || ""} 
                    onChange={handleProfileChange} 
                    placeholder="e.g. +880123456789"
                  />
                </div>
              </>
            )}
          </div>

          <div className="panelActions">
            <button className="btn" onClick={handleSaveProfile} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
            </button>
            <button className="btn ghost" onClick={() => window.location.reload()}>Reset</button>
          </div>
        </div>

        <div className="card settingCard">
          

          <div className="list" style={{ gap: 15 }}>
            <div className="securitySection">
              <div className="panelMain">Change Password</div>
              
              {msg && <div className={`authMsg ${msgType} mb-2`}>{msg}</div>}

              <div className="formGrid mb-5" style={{gridTemplateColumns: '1fr'}}>
                <div>
                  <div className="label">Current Password</div>
                  <input 
                    className="input" 
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    placeholder="********"
                  />
                </div>
                <div>
                  <div className="label">New Password</div>
                  <input 
                    className="input" 
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="********"
                  />
                </div>
              </div>

              <button 
                className="btn ghost updateBtn-m-4" 
                onClick={handleUpdatePassword}
              >
                Update Password
              </button>
            </div>

            <div className="securityRow border-t pt-4">
              <div>
                <div className="panelMain">Logout</div>
                <div className="panelSub">Delete session and return to login.</div>
              </div>
              <button
                className="btn"
                style={{ background: "#b42318" }}
                onClick={() => {
                  clearSession();
                  window.location.href = "/login";
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
