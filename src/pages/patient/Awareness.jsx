import { useEffect, useState } from "react";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";

export default function Awareness() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await api.post.getApproved();
        setPosts(data.sort((a, b) => b.id - a.id));
      } catch (error) {
        console.error("Failed to load posts", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="container">
      <Topbar
        title={<>Health Awareness</>}
        subtitle="Insights and tips from our verified medical experts"
        searchPlaceholder="Search articles..."
      />

      

      {loading ? (
        <div className="p-4">Loading health articles...</div>
      ) : (
        <div className="list" style={{ gap: 20 }}>
          {posts.length === 0 ? (
            <div className="card">
                <div className="panelTitle">No articles found</div>
                <div className="panelSub">Check back later for new health insights.</div>
            </div>
          ) : (
            posts.map((p) => (
              <div key={p.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'flex-start', gap: 20 }}>
                    <div style={{ flex: 1 }}>
                        <div className="apptTitle" style={{ fontSize: 20, color: '#1a2333', marginBottom: 8 }}>{p.title}</div>
                        <div className="apptMeta" style={{ marginBottom: 16 }}>
                            👨‍⚕️ <b>Dr. {p.doctor?.name}</b> • {p.doctor?.specialty} • 📅 {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                        <div className="panelSub" style={{ color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: 15 }}>
                            {p.content}
                        </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
