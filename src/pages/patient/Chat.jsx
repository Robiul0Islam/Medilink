import { Client } from "@stomp/stompjs";
import { useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Topbar from "../../components/Topbar";
import api, { API_BASE_URL } from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function Chat() {
  const session = getSession();
  const [partners, setPartners] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const messagesEndRef = useRef(null);
  const selectedIdRef = useRef(selectedId);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPartners = async () => {
    if (session?.userId) {
      try {
        const data = await api.chat.getConversationPartners(session.userId);
        setPartners(data.map(p => ({
            id: p.id,
            name: p.name,
            specialty: p.specialty,
            clinic: p.clinic,
            avatar: p.avatar,
            status: p.status
        })));
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch chat partners", e);
      }
    }
  };

  const fetchMessages = async () => {
    if (session?.userId && selectedId) {
      try {
        const msgs = await api.chat.getConversation(session.userId, selectedId);
        setMessages(msgs);
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [session?.userId]);

  useEffect(() => {
    if (!session?.userId) return;

    const wsUrl = "http://localhost:8080/api/ws-chat";
    const socket = new SockJS(wsUrl);
    const client = new Client({
      webSocketFactory: function() { return socket; },
      debug: (str) => console.log(str),
      onConnect: () => {
        client.subscribe('/topic/messages/' + session.userId, (msg) => {
          const newMsg = JSON.parse(msg.body);
          if (newMsg.senderId == selectedIdRef.current) {
            setMessages(prev => [...prev, newMsg]);
          }
        });
      }
    });

    client.activate();
    setStompClient(client);

    return () => {
        if (client) client.deactivate();
    };
  }, [session?.userId]);

  useEffect(() => {
    if (selectedId) {
      fetchMessages();
    }
  }, [selectedId, session?.userId]);

  const selectedDoctor = useMemo(
    () => partners.find((d) => d.id === Number(selectedId)),
    [partners, selectedId]
  );

  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || !selectedId || !stompClient?.connected) return;

    const msgPayload = {
        senderId: session.userId,
        receiverId: selectedId,
        content: t,
        createdAt: new Date().toISOString()
    };

    stompClient.publish({
        destination: '/app/chat.send',
        body: JSON.stringify(msgPayload)
    });

    setMessages(prev => [...prev, { ...msgPayload, id: Date.now() }]);
    setText("");
  };

  const resolveAvatar = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    if (path.startsWith("http")) return path;
    return API_BASE_URL + path;
  };

  return (
    <div className="container">
      <Topbar
        title={<>Chat</>}
        subtitle={`Message doctors directly and get medical advice`}
        searchPlaceholder="Search chats..."
      />

      <div className="chatLayout">
        <div className="card chatList">
          <div className="panelTitle">Doctors</div>

          <div className="list" style={{ gap: 10 }}>
            {partners.length === 0 && <div className="panelSub">No active chats. Start by booking a doctor!</div>}
            {partners.map((d) => (
              <button
                key={d.id}
                className={`chatPerson ${selectedId === d.id ? "active" : ""}`}
                onClick={() => setSelectedId(d.id)}
              >
                <img className="chatAvatar" src={resolveAvatar(d.avatar)} alt={d.name} />
                <div className="chatPersonInfo">
                  <div className="chatPersonName">{d.name}</div>
                  <div className="chatPersonSub">{d.specialty}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card chatBox">
          <div className="chatHeader">
            <div>
              <div className="panelMain">{selectedDoctor?.name || "Select a doctor"}</div>
              <div className="panelSub">{selectedDoctor?.clinic}</div>
            </div>
            <div className="pill">{selectedDoctor?.status || "Active"}</div>
          </div>

          <div className="chatMessages">
            {messages.length === 0 && <div className="text-center p-10 text-gray-400">No messages yet. Start the conversation!</div>}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chatMsgRow ${(m.senderId || m.sender?.id) == session?.userId ? "me" : "them"}`}
              >
                <div className="chatBubble">
                  {(m.senderId || m.sender?.id) != session?.userId && (
                      <div style={{ fontSize: 11, fontWeight: 1000, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <img src={resolveAvatar(selectedDoctor?.avatar)} style={{ width: 18, height: 18, borderRadius: '50%' }} alt="" />
                          Dr. {selectedDoctor?.name}
                      </div>
                  )}
                  <div className="chatText">{m.content}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 }}>
                    <div className="chatTime">
                        {new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {(m.senderId || m.sender?.id) == session?.userId && (
                        <div style={{ fontSize: 10, opacity: 0.6 }}>
                            {m.isRead ? '✓✓' : '✓'}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatInputRow" onSubmit={send}>
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              disabled={!selectedId}
            />
            <button className="btn" type="submit" disabled={!selectedId}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
