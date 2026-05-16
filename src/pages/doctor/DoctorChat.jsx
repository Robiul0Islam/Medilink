import { Client } from "@stomp/stompjs";
import { useEffect, useMemo, useRef, useState } from "react";
import SockJS from "sockjs-client";
import Topbar from "../../components/Topbar";
import api from "../../utils/api";
import { getSession } from "../../utils/auth";

export default function DoctorChat() {
  const session = getSession();
  const [patients, setPatients] = useState([]);
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

  const fetchPatients = async () => {
    if (session?.userId) {
      try {
        const appts = await api.appointment.getByDoctor(session.userId);
        const map = new Map();
        appts.forEach(a => {
            if (a.patient) map.set(a.patient.id, a.patient);
        });
        const pList = Array.from(map.values());
        setPatients(pList);
        if (pList.length > 0 && !selectedId) {
            setSelectedId(pList[0].id);
        }
      } catch (e) {
        console.error("Failed to fetch patients for chat", e);
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
    fetchPatients();
  }, [session?.userId]);

  useEffect(() => {
    if (!session?.userId) return;

    const wsUrl = "http://localhost:8080/api/ws-chat";
    const socket = new SockJS(wsUrl);
    const client = new Client({
      webSocketFactory: function() { return socket; },
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to WS');
        client.subscribe('/topic/messages/' + session.userId, (msg) => {
          const newMsg = JSON.parse(msg.body);
          if (newMsg.senderId == selectedIdRef.current) {
            setMessages(prev => [...prev, newMsg]);
          }
        });
      },
      onStompError: (frame) => {
        console.error('WS Error', frame);
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

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === Number(selectedId)),
    [patients, selectedId]
  );

  const send = async (e) => {
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

  return (
    <div className="container">
      <Topbar
        title={<>Doctor Chat</>}
        subtitle={`Message patients directly`}
        searchPlaceholder="Search chats..."
      />

      <div className="chatLayout">
        <div className="card chatList">
          <div className="panelTitle">Patients</div>

          <div className="list" style={{ gap: 10 }}>
            {patients.length === 0 && <div className="panelSub">No patients found.</div>}
            {patients.map((p) => (
              <button
                key={p.id}
                className={`chatPerson ${selectedId === p.id ? "active" : ""}`}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="chatAvatar" style={{ display: "grid", placeItems: "center", fontSize: 20 }}>
                  👤
                </div>
                <div className="chatPersonInfo">
                  <div className="chatPersonName">{p.name}</div>
                  <div className="chatPersonSub">{p.email}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card chatBox">
          <div className="chatHeader">
            <div>
              <div className="panelMain">{selectedPatient?.name || "Select a patient"}</div>
              <div className="panelSub">{selectedPatient?.email}</div>
            </div>
            <div className="pill">Active</div>
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
                          <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#eee', display: 'grid', placeItems: 'center', fontSize: 10 }}>👤</div>
                          {selectedPatient?.name}
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
