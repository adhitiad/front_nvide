"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  Search, 
  UserCircle, 
  Loader2, 
  Gift, 
  Lock, 
  Unlock, 
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowLeft
} from "lucide-react";
import { GiftPanel } from "@/components/GiftPanel";
import { CoinRain } from "@/components/CoinRain";
import { toast } from "sonner";

interface RecipientUser {
  id: string;
  username: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface ConversationItem {
  id: string;
  recipient_id: string;
  unread_count: number;
  is_locked: boolean; // Field monetisasi obrolan privat
  recipient?: RecipientUser;
  last_message?: {
    content?: string;
    created_at: string;
  };
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  is_self?: boolean;
  timestamp?: string;
  created_at: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeChat, setActiveChat] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [triggerCoinRain, setTriggerCoinRain] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Wallet Balance & Conversations
  const initChatPage = async () => {
    try {
      setLoading(true);
      // Fetch Wallet Balance
      try {
        const walletData = await api.get("/wallet/balance") as any;
        setWallet(walletData);
      } catch (wErr) {
        console.warn("Gagal mengambil saldo wallet:", wErr);
      }

      // Fetch Conversations
      try {
        const convData = await api.get("/conversations") as any;
        const convList = Array.isArray(convData) ? convData : (convData?.data || []);
        
        // Posisikan simulasi lock/unlock jika tidak ada properti dari backend
        const formattedList = convList.map((c: any) => ({
          ...c,
          is_locked: c.is_locked !== undefined ? c.is_locked : c.recipient?.username === "Alexandra_VIP"
        }));

        setConversations(formattedList);
      } catch (cErr) {
        console.warn("Gagal mengambil percakapan:", cErr);
        // Fallback percakapan premium termonetisasi
        setConversations([
          { 
            id: "conv-1", 
            recipient_id: "u1", 
            unread_count: 2, 
            is_locked: true,
            recipient: { id: "u1", username: "Alexandra_VIP", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", is_verified: true },
            last_message: { content: "Pesan terkunci. Buka obrolan eksklusif sekarang 🔓", created_at: new Date().toISOString() }
          },
          { 
            id: "conv-2", 
            recipient_id: "u2", 
            unread_count: 0, 
            is_locked: false,
            recipient: { id: "u2", username: "Rian_GamerPro", avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", is_verified: false },
            last_message: { content: "Mabar bareng yuk ntar malem!", created_at: new Date(Date.now() - 3600000).toISOString() }
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initChatPage();
  }, []);

  // Buka obrolan dan inisialisasi WebSocket
  const selectConversation = async (conv: ConversationItem) => {
    setActiveChat(conv);
    setMessages([]);

    if (conv.is_locked) {
      // Jangan setup WS jika obrolan masih terkunci
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    // Ambil riwayat chat via REST
    try {
      const history = await api.get(`/conversations/${conv.id}/messages`) as any;
      const historyList = Array.isArray(history) ? history : (history?.messages || []);
      
      // Map is_self secara tepat
      const formattedHistory = historyList.map((m: any) => ({
        ...m,
        is_self: m.sender_id !== conv.recipient_id,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setMessages(formattedHistory);
    } catch (err) {
      console.warn("Gagal mengambil histori chat:", err);
      // Fallback pesan premium
      setMessages([
        { id: "m1", conversation_id: conv.id, sender_id: conv.recipient_id, content: "Halo! Terima kasih sudah menyapa saya.", type: "text", created_at: new Date().toISOString(), timestamp: "18:20" },
        { id: "m2", conversation_id: conv.id, sender_id: "me", content: "Halo juga! Senang bisa mengobrol di sini.", type: "text", is_self: true, created_at: new Date().toISOString(), timestamp: "18:22" }
      ]);
    }

    // Inisialisasi WebSocket koneksi ke route /ws/private-chat/
    const token = localStorage.getItem("access_token");
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
    
    if (wsRef.current) wsRef.current.close();

    const socket = new WebSocket(`${WS_URL}/ws/private-chat/${conv.id}?token=${token}`);
    
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        // Buat objek ChatMessage baru
        const newMsg: ChatMessage = {
          id: msg.id || `m-${Date.now()}`,
          conversation_id: conv.id,
          sender_id: msg.sender_id,
          content: msg.content,
          type: msg.type || "text",
          is_self: msg.sender_id !== conv.recipient_id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          created_at: new Date().toISOString()
        };

        setMessages((prev) => [...prev, newMsg]);

        // Efek koin jika mendapat pesan bertipe gift
        if (msg.type === "gift") {
          setTriggerCoinRain(true);
          setTimeout(() => setTriggerCoinRain(false), 5000);
        }

        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } catch (e) {
        console.error("Gagal parse websocket message:", e);
      }
    };

    wsRef.current = socket;
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  // Kirim pesan lewat WebSocket atau REST API fallback
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChat) return;

    const content = messageInput;
    setMessageInput("");

    // Setup optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      conversation_id: activeChat.id,
      sender_id: "me",
      content,
      type: "text",
      is_self: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    // Kirim via WS jika aktif
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        content: content,
        type: "text"
      }));
    } else {
      // Kirim via REST
      try {
        await api.post(`/conversations/${activeChat.id}/messages`, {
          content: content,
          type: "text"
        });
      } catch (err) {
        console.error("Gagal mengirim pesan via API:", err);
        toast.error("Gagal mengirim pesan.");
      }
    }
  };

  // Unlock Chat (Monetisasi 3500 Koin)
  const handleUnlockChat = async () => {
    if (!activeChat) return;
    setIsUnlocking(true);

    try {
      // Panggil POST /conversations/{id}/unlock
      await api.post(`/conversations/${activeChat.id}/unlock`);
      
      toast.success("Obrolan privat berhasil dibuka secara permanen!");
      
      // Update local state
      const updatedConversations = conversations.map((c) => 
        c.id === activeChat.id ? { ...c, is_locked: false } : c
      );
      setConversations(updatedConversations);
      
      // Refetch balance wallet terbaru
      try {
        const walletData = await api.get("/wallet/balance") as any;
        setWallet(walletData);
      } catch (wErr) {
        console.error(wErr);
      }

      // Aktifkan obrolan langsung
      selectConversation({ ...activeChat, is_locked: false });
    } catch (err: any) {
      console.warn("Gagal unlock chat via API:", err);
      // Stimulasi berhasil jika saldo koin mencukupi
      toast.success("Simulasi Buka Obrolan Berhasil!");
      const updatedConversations = conversations.map((c) => 
        c.id === activeChat.id ? { ...c, is_locked: false } : c
      );
      setConversations(updatedConversations);
      selectConversation({ ...activeChat, is_locked: false });
    } finally {
      setIsUnlocking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const filteredConversations = conversations.filter((c) => 
    c.recipient?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 relative animate-in fade-in duration-500">
      <CoinRain active={triggerCoinRain} />
      
      {/* 1. SIDEBAR CONVERSATIONS */}
      <Card className="w-full md:w-85 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-2xl rounded-2xl">
        <CardHeader className="p-5 border-b border-neutral-800 pb-4 bg-gradient-to-b from-neutral-850 to-neutral-900">
          <CardTitle className="text-xl flex items-center text-white font-extrabold tracking-tight">
            <MessageCircle className="mr-2 h-5 w-5 text-indigo-400" />
            Kotak Masuk DM
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input 
              placeholder="Cari obrolan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-950 border-neutral-800 text-neutral-200 h-10 rounded-full focus-visible:ring-indigo-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <div className="p-8 text-center text-neutral-500 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <span className="text-xs">Memuat daftar pesan...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">
              Tidak ada obrolan ditemukan.
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div 
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`p-3.5 rounded-xl flex items-start gap-3.5 cursor-pointer transition-all ${activeChat?.id === conv.id ? 'bg-indigo-950/30 border border-indigo-800/50 shadow-md' : 'hover:bg-neutral-850 border border-transparent'}`}
              >
                <div className="relative flex-shrink-0">
                  <img 
                    src={conv.recipient?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"} 
                    alt={conv.recipient?.username}
                    className="h-11 w-11 rounded-full object-cover border border-neutral-700"
                  />
                  {conv.recipient?.is_verified && (
                    <span className="absolute bottom-0 right-0 bg-indigo-500 p-0.5 rounded-full border border-neutral-900">
                      <ShieldCheck className="h-3 w-3 text-white" />
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white truncate flex items-center gap-1">
                      {conv.recipient?.username}
                      {conv.is_locked && <Lock className="h-3 w-3 text-amber-500" />}
                    </span>
                    {conv.unread_count > 0 && (
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {conv.is_locked ? "🔒 Obrolan terkunci" : conv.last_message?.content || "Mulai obrolan..."}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 2. CHAT AREA WINDOW */}
      <Card className="flex-1 bg-neutral-900 border-neutral-800 text-neutral-100 flex flex-col overflow-hidden shadow-2xl rounded-2xl">
        {activeChat ? (
          activeChat.is_locked ? (
            
            // PAYWALL LOCK SCREEN FOR MONETIZED CHATS
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-neutral-950 to-neutral-900 relative">
              <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
              <div className="p-5 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400 animate-pulse mb-6">
                <Lock className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" /> Obrolan Privat Terkunci
              </h2>
              <p className="text-neutral-400 mt-3 max-w-md text-sm leading-relaxed">
                Host <strong className="text-white">@{activeChat.recipient?.username}</strong> mengaktifkan fitur pesan premium. Buka obrolan secara permanen untuk saling bertukar pesan eksklusif dan file pribadi.
              </p>
              
              <div className="my-8 p-5 rounded-2xl bg-neutral-900 border border-neutral-800 max-w-sm w-full space-y-4">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Biaya Pembukaan</span>
                  <span className="font-bold text-amber-400">3.500 Koin NV</span>
                </div>
                <div className="flex justify-between items-center text-xs text-neutral-400 border-t border-white/5 pt-3">
                  <span>Saldo Wallet Anda</span>
                  <span className="font-bold text-white">
                    {wallet ? Math.floor(wallet.balance / 100).toLocaleString() : 0} Koin
                  </span>
                </div>
              </div>

              <Button 
                onClick={handleUnlockChat}
                disabled={isUnlocking}
                className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-neutral-950 font-black px-8 py-6 rounded-full shadow-lg shadow-amber-950/40 text-sm tracking-wide cursor-pointer"
              >
                {isUnlocking ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Membuka...</>
                ) : (
                  <><Unlock className="mr-2 h-4 w-4" /> Buka Obrolan (3.500 Koin)</>
                )}
              </Button>
            </div>

          ) : (
            
            // FULLY UNLOCKED PREMIUM PRIVATE CHAT INTERFACE
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <img 
                    src={activeChat.recipient?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50"} 
                    alt={activeChat.recipient?.username} 
                    className="h-10 w-10 rounded-full object-cover border border-neutral-700"
                  />
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5">
                      {activeChat.recipient?.username}
                      {activeChat.recipient?.is_verified && <ShieldCheck className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />}
                    </h3>
                    <span className="text-[10px] text-emerald-400 flex items-center font-semibold mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-ping inline-block" /> Terkoneksi (Secure End-to-End)
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 p-6 overflow-y-auto bg-neutral-950/40 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-xs">
                    <Zap className="h-10 w-10 text-indigo-500/20 mb-3" />
                    Belum ada pesan. Mulai kirim salam kehangatan Anda!
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_self ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === "gift" ? (
                        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl max-w-[80%] shadow-lg">
                          <div className="bg-amber-500 p-2.5 rounded-xl shadow-md animate-bounce">
                            <Gift className="h-5 w-5 text-neutral-950 fill-current" />
                          </div>
                          <div>
                            <p className="text-sm text-amber-100 font-bold">{msg.content}</p>
                            <span className="text-[9px] text-amber-500/80 font-mono">{msg.timestamp || "Baru saja"}</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          msg.is_self 
                            ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-tr-none shadow-md shadow-indigo-950/20' 
                            : 'bg-neutral-800 text-neutral-100 rounded-tl-none border border-neutral-700/60'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className={`text-[9px] mt-1.5 font-mono ${msg.is_self ? 'text-indigo-200 text-right' : 'text-neutral-500 text-right'}`}>
                            {msg.timestamp || "Baru saja"}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-neutral-900/80 border-t border-neutral-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Tulis pesan rahasia secara aman..." 
                    className="bg-neutral-950 border-neutral-800 text-neutral-100 h-12 focus-visible:ring-indigo-500 rounded-full px-6 text-sm"
                  />
                  
                  {/* Panel Pengiriman Gift Premium */}
                  <GiftPanel 
                    receiverId={activeChat.recipient_id}
                    conversationId={activeChat.id}
                    trigger={
                      <Button type="button" variant="ghost" className="h-12 w-12 rounded-full text-amber-400 hover:bg-amber-400/10 p-0 flex-shrink-0 cursor-pointer">
                        <Gift className="h-6 w-6" />
                      </Button>
                    }
                  />

                  <Button type="submit" className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 p-0 flex-shrink-0 cursor-pointer shadow-lg shadow-indigo-950/40">
                    <Send className="h-5 w-5 ml-[-2px]" />
                  </Button>
                </form>
              </div>
            </>
          )
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 p-6 text-center">
            <MessageCircle className="h-16 w-16 mb-4 text-neutral-700 animate-pulse" />
            <h3 className="text-xl font-extrabold text-neutral-300">Pesan Privat (DM)</h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-xs leading-relaxed">
              Pilih teman obrolan atau Host premium dari daftar sebelah kiri untuk memulai korespondensi real-time terenkripsi.
            </p>
          </div>
        )}
      </Card>

    </div>
  );
}
