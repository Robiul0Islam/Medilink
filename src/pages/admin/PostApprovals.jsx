import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";

export default function PostApprovals() {
  const [posts, setPosts] = useState([]);
  const [approvedPosts, setApprovedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const [pending, approved] = await Promise.all([
        api.admin.getPendingPosts(),
        api.post.getApproved()
      ]);
      setPosts(pending);
      setApprovedPosts(approved);
    } catch (error) {
      console.error("Failed to load posts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.admin.approvePost(id);
      fetchPosts();
      alert("Post approved!");
    } catch (error) {
      alert("Failed to approve: " + error.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this post?")) return;
    try {
      await api.admin.rejectPost(id);
      fetchPosts();
    } catch (error) {
      alert("Failed to reject: " + error.message);
    }
  };

  return (
    <div className="container">
      <Topbar
        title={<>Post Approvals</>}
        subtitle="Approve or reject awareness posts created by doctors"
        searchPlaceholder="Search posts..."
      />

      <div className="apptStats">
        <div className="card statCard">
          <div className="statK">Pending</div>
          <div className="statV">{posts.length}</div>
        </div>
        <div className="card statCard">
          <div className="statK">Approved</div>
          <div className="statV">{approvedPosts.length}</div>
        </div>
        <div className="card statCard">
          <div className="statK">Total</div>
          <div className="statV">{posts.length + approvedPosts.length}</div>
        </div>
      </div>

      <div className="sectionHeader mt">
        <div className="sectionTitle">Pending Posts</div>
        <button className="seeAll" onClick={() => fetchPosts()}>
          Refresh ↻
        </button>
      </div>

      <div className="list">
        {loading ? (
            <div className="p-4">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="card">
            <div className="panelTitle">No pending posts</div>
            <div className="panelSub">
              Doctors have not submitted any posts for review yet.
            </div>
          </div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="apptTitle">{p.title}</div>
                  <div className="apptMeta">
                    👨‍⚕️ {p.doctor?.name} • {p.doctor?.email} • 📅{" "}
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="tag warn">Pending</div>
              </div>

              <div className="panelSub" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
                {p.content}
              </div>

              <div className="panelActions" style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => handleApprove(p.id)}>
                  Approve
                </button>
                <button className="btn ghost" onClick={() => handleReject(p.id)}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sectionHeader mt">
        <div className="sectionTitle">Recently Approved</div>
      </div>

      <div className="list">
        {approvedPosts.slice(0, 5).map((p) => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div className="apptTitle">{p.title}</div>
                <div className="apptMeta">
                  👨‍⚕️ {p.doctor?.name} • 📅 {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="tag ok">Approved</div>
            </div>
            <div className="panelSub" style={{ marginTop: 10 }}>
              {p.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
