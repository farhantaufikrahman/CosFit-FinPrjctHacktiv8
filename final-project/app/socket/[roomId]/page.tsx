"use client";

import { socket } from "@/socket";
import { useEffect, useState, useRef, use } from "react";

interface Message {
  id?: string;
  username: string;
  message: string;
  createdAt?: string;
}

export default function SocketPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    try {

      const res = await fetch(`/api/chat/${roomId}`);
      if (!res.ok) throw new Error("Gagal mengambil riwayat chat");
      const data = await res.json();
      
      if (Array.isArray(data.message)) {
        setMessages(data.message);
      } else if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetch chat:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial chat history fetch on mount, not a render loop
    fetchChat();

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);
      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    socket.connect();
    socket.emit("join_room", roomId);

    const handleReceiveMsg = (newMsg: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMsg]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_msg", handleReceiveMsg); 

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_msg", handleReceiveMsg);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const payload = {
      roomId,
      message: messageInput,
      username: "Kamu",
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_msg", payload);
    setMessageInput("");
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50 border-x border-gray-200">
      {/* Header Room */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="font-bold text-lg text-gray-800">Room: {roomId}</h1>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
            <span>•</span>
            <span>Transport: {transport}</span>
          </div>
        </div>
      </div>

      {/* Chat Area (Messages) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 my-10 text-sm">
            Belum ada pesan. Mulai percakapan sekarang!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.username === "Kamu"; // Logika sederhana penentu pengirim
            return (
              <div key={index} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar Initial */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${isMe ? "bg-blue-600" : "bg-indigo-500"}`}>
                  {getInitial(msg.username)}
                </div>

                {/* Bubble Chat */}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                }`}>
                  {!isMe && <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">{msg.username || "Anonim"}</p>}
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-[10px] text-right mt-1 ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                    {formatTime(msg.createdAt || new Date().toISOString())}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Chat Bottom */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-3 flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Tulis pesan..."
          className="flex-1 bg-gray-100 border border-transparent focus:border-blue-500 focus:bg-white rounded-full px-4 py-2 text-sm outline-none transition-all text-gray-800"
        />
        <button
          type="submit"
          disabled={!messageInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}