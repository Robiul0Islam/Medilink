import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function DoctorPosts() {
  const session = getSession();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    if (session?.userId) {
      try {
        const data = await api.post.getByDoctor(session.userId);
        setPosts(data);
      } catch (e) {
        console.error("Failed to fetch posts", e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPosts();
    const interval = setInterval(fetchPosts, 30000);
    return () => clearInterval(interval);
  }, [session?.userId]);

  const createPost = async (e) => {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;

    try {
        await api.post.create({
            doctor: { id: session.userId },
            title: t,
            content: b,
            status: "PENDING"
        });
        setTitle("");
        setBody("");
        fetchPosts();
        alert("Post submitted for approval!");
    } catch (e) {
        alert("Failed to create post: " + e.message);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
        await api.post.delete(id);
        fetchPosts();
    } catch (e) {
        alert("Failed to delete post: " + e.message);
    }
  };

  return (
    <div className="container">
      <Topbar
        title={<>Awareness Posts</>}
        subtitle="Create health posts (Admin approval required)"
        searchPlaceholder="Search posts..."
      />

      <div className="reportsTop">
        {/* Create */}
        <div className="card reportUpload">
          <div className="reportUploadTitle">Create New Post</div>
          <div className="reportUploadSub">
            Posts will be visible on home after Admin approval.
          </div>

          <form className="authForm" onSubmit={createPost} style={{ gap: 10 }}>
            <div>
              <div className="label">Title</div>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., How to control blood pressure"
                required
              />
            </div>

            <div>
              <div className="label">Content</div>
              <textarea
                className="input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your health awareness content..."
                style={{ minHeight: 110, resize: "vertical" }}
                required
              />
            </div>

            <button className="btn" type="submit" style={{ width: "fit-content" }}>
              Submit for Approval
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="card reportStats">
          <div className="panelTitle">Summary</div>
          <div className="summary">
            <div className="summaryItem">
              <div className="k">My Posts</div>
              <div className="v">{posts.length}</div>
            </div>
            <div className="summaryItem">
              <div className="k">Approved</div>
              <div className="v">
                {posts.filter((p) => p.status === "APPROVED").length}
              </div>
            </div>
            <div className="summaryItem">
              <div className="k">Pending</div>
              <div className="v">
                {posts.filter((p) => p.status === "PENDING").length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sectionHeader mt">
        <div className="sectionTitle">My Posts</div>
        <button className="seeAll" onClick={() => fetchPosts()}>
          Refresh ↻
        </button>
      </div>

      <div className="list">
        {loading ? (
           <div className="p-4">Loading your posts...</div>
        ) : posts.length === 0 ? (
          <div className="card">
            <div className="panelTitle">No posts yet</div>
            <div className="panelSub">Create your first awareness post.</div>
          </div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div className="apptTitle" style={{fontSize: 16}}>{p.title}</div>
                  <div className="apptMeta">
                    📅 {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{display:'flex', gap:10, alignItems:'center'}}>
                    <div className={`tag ${p.status === "APPROVED" ? "ok" : "warn"}`}>
                      {p.status}
                    </div>
                    <button className="btn ghost" style={{padding: '5px 10px'}} onClick={() => deletePost(p.id)}>Delete</button>
                </div>
              </div>

              <div className="panelSub" style={{ marginTop: 10, whiteSpace: 'pre-wrap', color: '#1f2a44' }}>
                {p.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
