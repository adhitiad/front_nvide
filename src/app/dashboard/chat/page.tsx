"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Search, UserCircle, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch DM Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        // Simulasi/Asli fetch ke backend (di router.go: GET /conversations)
        const data = await api.get("/conversations") as any;
        setConversations(Array.isArray(data) ? data : data.conversations || [
          { id: "conv-1", user: { username: "alexandra", id: "u1" }, last_message: "Halo! Kapan live lagi?", unread: 2 },
          { id: "conv-2", user: { username: "cryptobro", id: "u2" }, last_message: "Thanks gift nya bro", unread: 0 },
        ]);
      } catch (err) {
        console.error("Gagal memuat percakapan", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Buka percakapan spesifik dan setup WebSocket Private Chat
  const selectConversation = async (conv: any) => {
    setActiveChat(conv);
    
    // Fetch History Pesan Private
    try {
      const history = await api.get(`/conversations/${conv.id}/messages`) as any;
      setMessages(Array.isArray(history) ? history : history.messages || []);
    } catch (err) {
      console.error("Gagal fetch pesan history", err);
      // Dummy history fallback
      setMessages([
        { id: "m1", sender_id: "other", content: "Halo!", timestamp: "10:00" },
        { id: "m2", sender_id: "me", content: "Hai, ada apa?", timestamp: "10:05", is_self: true },
        { id: "m3", sender_id: "other", content: conv.last_message, timestamp: "10:06" }
      ]);
    }

    // Connect WebSocket
    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    if (wsRef.current) wsRef.current.close();
    
    // Sesuai dengan router.go: /ws/chat/{conversation_id}
    const socket = new WebSocket(`${WS_URL}/ws/chat/${conv.id}?token=${token}`);
    
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (e) {
        console.error(e);
      }
    };
    
    wsRef.current = socket;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    // Cara 1: Kirim via WebSocket langsung
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        content: messageInput,
      }));
      
      // Update UI optimistik
      setMessages(prev => [...prev, {
        id: `m-${Date.now()}`,
        sender_id: "me",
        content: messageInput,
        is_self: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } else {
      // Cara 2: Kirim via REST POST /conversations/{id}/messages
      try {
        await api.post(`/conversations/${activeChat.id}/messages`, { content: messageInput });
        setMessages(prev => [...prev, {
          id: `m-${Date.now()}`,
          sender_id: "me",
          content: messageInput,
          is_self: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } catch (err) {
        console.error("Gagal mengirim pesan", err);
      }
    }
    
    setMessageInput("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Cleanup WS ketika komponen di-unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6">
      
      {/* Sidebar Daftar Percakapan */}
      <Card className="w-full md:w-80 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-xl">
        <CardHeader className="p-4 border-b border-neutral-800 pb-4">
          <CardTitle className="text-xl flex items-center text-white">
            <MessageCircle className="mr-2 h-5 w-5 text-indigo-400" />
            Pesan (DM)
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Cari pesan..." 
              className="pl-9 bg-neutral-950 border-neutral-800 text-neutral-200"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-neutral-500 flex items-center justify-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              Belum ada percakapan.
            </div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-4 border-b border-neutral-800/50 flex items-start gap-3 cursor-pointer transition-colors ${activeChat?.id === conv.id ? 'bg-indigo-950/30 border-l-4 border-l-indigo-500' : 'hover:bg-neutral-800'}`}
                >
                  <UserCircle className="h-10 w-10 text-neutral-500 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white truncate">{conv.user?.username}</span>
                      {conv.unread > 0 && (
                        <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 truncate">{conv.last_message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Area Obrolan Aktif */}
      <Card className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-xl hidden md:flex">
        {activeChat ? (
          <>
            {/* Header Area Obrolan */}
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
              <div className="flex items-center gap-3">
                <UserCircle className="h-10 w-10 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-lg text-white">{activeChat.user?.username}</h3>
                  <span className="text-xs text-emerald-400 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1 inline-block"></span> Online
                  </span>
                </div>
              </div>
            </div>

            {/* Isi Pesan */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-950/50 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.is_self ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    msg.is_self 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-900/20' 
                      : 'bg-neutral-800 text-neutral-100 rounded-tl-none border border-neutral-700'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <div className={`text-[10px] mt-1 ${msg.is_self ? 'text-indigo-200 text-right' : 'text-neutral-500 text-right'}`}>
                      {msg.timestamp || "Baru saja"}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Pesan */}
            <div className="p-4 bg-neutral-900 border-t border-neutral-800">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ketik pesan rahasia..." 
                  className="bg-neutral-950 border-neutral-700 text-neutral-100 h-12 focus-visible:ring-indigo-500 rounded-full px-6"
                />
                <Button type="submit" className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 p-0 flex-shrink-0">
                  <Send className="h-5 w-5 ml-[-2px]" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
            <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-xl font-medium text-neutral-300">Pesan Pribadi (DM)</h3>
            <p className="mt-2 text-sm text-center max-w-xs">
              Pilih percakapan dari daftar di sebelah kiri untuk mulai mengobrol secara real-time.
            </p>
          </div>
        )}
      </Card>

    </div>
  );
}
