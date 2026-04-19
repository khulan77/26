"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Send,
  Image as ImageIcon,
  ShoppingCart,
  Sparkles,
  Clock3,
  ChevronRight,
  Plus,
  Loader2,
  Bookmark,
  Package,
  X,
  LayoutDashboard,
  LogOut, // ШИНЭ: Гарах дүрс
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, UserButton, useClerk } from "@clerk/nextjs"; // ШИНЭ: useClerk нэмсэн

// --- Төрлүүд (Types) ---
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description?: string | null;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  products?: Product[];
};

type HistoryItem = {
  id: number | string;
  title: string;
  time: string;
};

type ViewMode = "chat" | "saved" | "orders";

export default function ChatStoryUI() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk(); // ШИНЭ: Sign out функц
  const [view, setView] = useState<ViewMode>("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Хөгжүүлэгчийн эрх шалгах
  const isAdmin = user?.publicMetadata?.role === "ADMIN" || user?.firstName === "Hulan" || user?.firstName === "dev";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const addToCart = (product: Product) => {
    setCart(prev => [...prev, product]);
  };

  const saveProduct = async (product: Product) => {
    setSavedProducts(prev => [...prev, product]);
  };

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || sending) return;
    setView("chat");

    const userMessage: ChatMessage = { id: Date.now(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    if (!preset) setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        text: data.reply || "Танд тохирох барааг оллоо.",
        products: Array.isArray(data.products) ? data.products : [],
      }]);
    } catch (error) { console.error(error); } finally { setSending(false); }
  };

  return (
    <div className="min-h-screen bg-[#04050b] text-white selection:bg-violet-500/30">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      </div>

      <div className="relative flex h-screen overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`border-r border-white/5 bg-white/[0.02] backdrop-blur-3xl transition-all duration-500 hidden lg:flex flex-col ${sidebarOpen ? "w-72" : "w-20"}`}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            {sidebarOpen && <span className="font-bold text-xl bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">ChatStory</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl transition text-white/50">
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>
          
          <div className="p-3 space-y-2">
            <button onClick={() => { setMessages([]); setView("chat"); }} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              {sidebarOpen && <span>Шинэ чат</span>}
            </button>

            <div className="pt-4 space-y-1">
              <button 
                onClick={() => setView("orders")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'orders' ? 'bg-violet-600/20 text-violet-400 font-bold border border-violet-600/20' : 'hover:bg-white/5 text-white/60'}`}
              >
                <Package size={18} />
                {sidebarOpen && <span className="text-sm">Миний захиалгууд</span>}
              </button>
              <button 
                onClick={() => setView("saved")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'saved' ? 'bg-fuchsia-600/20 text-fuchsia-400 font-bold border border-fuchsia-600/20' : 'hover:bg-white/5 text-white/60'}`}
              >
                <Bookmark size={18} />
                {sidebarOpen && <span className="text-sm">Хадгалсан бараа</span>}
              </button>

              {isAdmin && sidebarOpen && (
                <a href="/admin" className="block pt-10 px-2">
                  <div className="flex items-center gap-3 p-3 bg-violet-600/10 border border-violet-600/20 rounded-2xl text-violet-400 hover:bg-violet-600/20 transition-all group">
                    <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Админ самбар</span>
                  </div>
                </a>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
             {sidebarOpen && <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2 py-4">Түүх</p>}
             {history.map((item) => (
               <button key={item.id} onClick={() => setView("chat")} className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition text-left group">
                 <Clock3 size={14} className="text-white/20 group-hover:text-violet-400" />
                 {sidebarOpen && <span className="truncate text-sm text-white/70">{item.title}</span>}
               </button>
             ))}
          </div>

          {/* SIDEBAR FOOTER: USER & LOGOUT */}
          <div className="p-4 border-t border-white/5 bg-white/[0.01]">
            <div className={`flex items-center gap-3 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
              <div className="flex items-center gap-3">
                <UserButton afterSignOutUrl="/" />
                {sidebarOpen && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold truncate max-w-[100px]">{user?.firstName || "Hulan"}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">{isAdmin ? "Admin" : "Customer"}</span>
                  </div>
                )}
              </div>
              
              {sidebarOpen && (
                <button 
                  onClick={() => signOut(() => window.location.href = "/")}
                  className="p-2 hover:bg-red-500/10 text-white/20 hover:text-red-500 rounded-xl transition group"
                  title="Гарах"
                >
                  <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 border-b border-white/5 bg-[#04050b]/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
            <h2 className="text-sm font-medium text-white/60">
              {view === "chat" ? "AI Assistant" : view === "saved" ? "Хадгалсан бараа" : "Захиалгын түүх"}
            </h2>
            <div className="flex items-center gap-3">
               <button className="relative p-2 hover:bg-white/5 rounded-xl transition text-white/50 hover:text-white group">
                 <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                 {cart.length > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-violet-600 rounded-full text-[10px] flex items-center justify-center text-white font-bold">{cart.length}</span>}
               </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {view === "chat" && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
                   {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-violet-600/40 mb-8 relative group">
                        <Sparkles size={40} className="group-hover:rotate-12 transition-transform duration-500" />
                        <div className="absolute inset-0 rounded-[2.5rem] bg-white/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h1 className="text-4xl font-black mb-3">Юу хайж байна вэ?</h1>
                      <p className="text-white/40 max-w-sm mx-auto leading-relaxed">Текстээр эсвэл зураг оруулж өөрт хэрэгтэй бараагаа AI-аас асууж олоорой.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-[2rem] p-5 shadow-2xl ${m.role === "user" ? "bg-violet-600 text-white" : "bg-white/[0.04] border border-white/10"}`}>
                          <p className="text-[15px] leading-relaxed">{m.text}</p>
                          {m.products && m.products.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {m.products.map(p => (
                                <div key={p.id} className="bg-[#0b0c1a] border border-white/5 rounded-[1.5rem] overflow-hidden group/card hover:border-violet-500/30 transition-all duration-300">
                                  <div className="relative h-40 overflow-hidden">
                                    <img src={p.image} className="h-full w-full object-cover transition duration-500 group-hover/card:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  </div>
                                  <div className="p-4">
                                    <h4 className="font-bold text-xs truncate mb-2">{p.name}</h4>
                                    <p className="text-violet-400 font-bold text-sm mb-4">{p.price.toLocaleString()}₮</p>
                                    <div className="flex gap-2">
                                      <button onClick={() => addToCart(p)} className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-[10px] font-bold transition">Сагслах</button>
                                      <button onClick={() => saveProduct(p)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl hover:text-fuchsia-400 transition"><Bookmark size={14}/></button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {sending && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-violet-500" size={32} /></div>}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}

              {/* ... Хадгалсан болон Захиалгын хэсэг хэвээрээ ... */}
              {view === "saved" && (
                <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div>
                      <h2 className="text-3xl font-black">Хадгалсан бараа</h2>
                      <p className="text-white/40 text-sm mt-1">Нийт {savedProducts.length} бараа хадгалсан байна</p>
                    </div>
                    <button onClick={() => setView("chat")} className="p-3 hover:bg-white/5 rounded-full transition"><X size={24}/></button>
                  </div>
                  {savedProducts.length === 0 ? (
                    <div className="text-center py-32 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                      <Bookmark size={48} className="mx-auto mb-6 text-white/10" />
                      <p className="text-white/30 font-medium">Танд хадгалсан бараа одоогоор алга.</p>
                      <button onClick={() => setView("chat")} className="mt-6 text-violet-400 text-sm font-bold hover:underline">Бараа хайх</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      {savedProducts.map(p => (
                        <div key={p.id} className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-4 group hover:bg-white/[0.06] transition-all">
                          <img src={p.image} className="h-48 w-full object-cover rounded-[1.5rem] mb-4 group-hover:scale-105 transition duration-300 shadow-xl" />
                          <h3 className="font-bold text-sm mb-1 truncate">{p.name}</h3>
                          <p className="text-violet-400 font-bold text-sm mb-4">{p.price.toLocaleString()}₮</p>
                          <button onClick={() => addToCart(p)} className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-[11px] font-black transition">САГСАНД НЭМЭХ</button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {view === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-black mb-8">Миний захиалгууд</h2>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center group hover:bg-white/[0.05] transition">
                        <div className="h-24 w-24 bg-violet-600/10 rounded-[2rem] flex items-center justify-center text-violet-400 border border-violet-600/20">
                          <Package size={40} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                             <h3 className="font-bold text-xl">#ORD-2026-00{i}</h3>
                             <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500">
                                ХҮРГЭГДЭЖ БАЙГАА
                             </span>
                          </div>
                          <p className="text-sm text-white/40 font-medium">Нийт төлөлт: <span className="text-white">₮{ (540000 * i).toLocaleString() }</span> | Огноо: 2026-04-16</p>
                        </div>
                        <button className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold transition border border-white/5">Дэлгэрэнгүй</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <footer className="p-4 md:p-8 bg-gradient-to-t from-[#04050b] via-[#04050b]/90 to-transparent">
            <div className="max-w-4xl mx-auto relative">
              <div className="relative flex items-center bg-white/[0.04] border border-white/10 rounded-[2.5rem] p-3 backdrop-blur-3xl shadow-2xl">
                <button className="p-4 text-white/30 hover:text-white transition"><ImageIcon size={22} /></button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Бараа хайх эсвэл AI-аас асуух..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] px-2 outline-none placeholder:text-white/20"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="bg-violet-600 hover:bg-violet-500 p-4 rounded-2xl shadow-xl shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
             </div>
          </footer>
        </main>
      </div>

      {/* --- SECRET ADMIN FLOATING BUTTON --- */}
      {isAdmin && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="fixed bottom-10 right-10 z-[100]"
        >
          <a href="/admin">
            <div className="flex items-center gap-3 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-1.5 rounded-full shadow-2xl shadow-violet-600/50 group overflow-hidden max-w-[64px] hover:max-w-[220px] transition-all duration-500 ease-in-out border border-white/20">
              <div className="h-12 w-12 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md">
                <LayoutDashboard className="text-white animate-pulse" size={24} />
              </div>
              <span className="pr-8 font-black text-xs text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Admin Panel
              </span>
            </div>
          </a>
        </motion.div>
      )}
    </div>
  );
}