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
  Bookmark,   // ШИНЭ: Хадгалахад
  Package,    // ШИНЭ: Захиалгад
  X,          // Хаах товч
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";

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

// --- Сонгосон хэсгийг харуулах төрөл ---
type ViewMode = "chat" | "saved" | "orders";

export default function ChatStoryUI() {
  const { isSignedIn, user } = useUser();
  const [view, setView] = useState<ViewMode>("chat"); // Одоогийн харагдац
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [savedProducts, setSavedProducts] = useState<Product[]>([]); // Хадгалсан бараанууд
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Хадгалсан бараа болон захиалгыг fetch хийх (API-тайгаа холбох хэсэг)
  const fetchSaved = async () => {
    try {
      const res = await fetch("/api/saved");
      const data = await res.json();
      setSavedProducts(data);
    } catch (e) { console.error(e); }
  };

  const saveProduct = async (product: Product) => {
    setSavedProducts(prev => [...prev, product]);
    // API Call: fetch("/api/saved", { method: "POST", body: JSON.stringify({ productId: product.id }) });
  };

  const sendMessage = async (preset?: string) => {
    const text = (preset ?? input).trim();
    if (!text || sending) return;
    setView("chat"); // Чат бичихэд шууд чат руу шилжинэ

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
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl transition">
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>
          
          <div className="p-3 space-y-2">
            <button onClick={() => { setMessages([]); setView("chat"); }} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition group">
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              {sidebarOpen && <span>Шинэ чат</span>}
            </button>

            {/* ШИНЭ: ХАДГАЛСАН БОЛОН ЗАХИАЛГА ХЭСЭГ */}
            <div className="pt-4 space-y-1">
              <button 
                onClick={() => setView("orders")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'orders' ? 'bg-violet-600/20 text-violet-400' : 'hover:bg-white/5 text-white/60'}`}
              >
                <Package size={18} />
                {sidebarOpen && <span className="text-sm">Миний захиалгууд</span>}
              </button>
              <button 
                onClick={() => setView("saved")}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${view === 'saved' ? 'bg-fuchsia-600/20 text-fuchsia-400' : 'hover:bg-white/5 text-white/60'}`}
              >
                <Bookmark size={18} />
                {sidebarOpen && <span className="text-sm">Хадгалсан бараа</span>}
              </button>
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

          <div className="p-4 border-t border-white/5">
            <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center"}`}>
              <UserButton afterSignOutUrl="/" />
              {sidebarOpen && <span className="text-sm font-medium">{user?.firstName || "Hulan"}</span>}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative">
          <header className="h-16 border-b border-white/5 bg-[#04050b]/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
            <h2 className="text-sm font-medium text-white/60">
              {view === "chat" ? "AI Assistant" : view === "saved" ? "Хадгалсан бараа" : "Захиалгын түүх"}
            </h2>
            <div className="flex items-center gap-3">
               <button className="relative p-2 hover:bg-white/5 rounded-xl transition text-white/50 hover:text-white">
                 <ShoppingCart size={18}/>
                 {cart.length > 0 && <span className="absolute top-1 right-1 h-4 w-4 bg-violet-600 rounded-full text-[10px] flex items-center justify-center text-white">{cart.length}</span>}
               </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {/* --- ЧАТ ХАРАГДАЦ --- */}
              {view === "chat" && (
                <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-6">
                   {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-3xl flex items-center justify-center shadow-xl mb-6">
                        <Sparkles size={32} />
                      </div>
                      <h1 className="text-3xl font-bold mb-2">Юу хайж байна вэ?</h1>
                      <p className="text-white/40">Текстээр эсвэл зураг оруулж бараагаа хайгаарай.</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-[2rem] p-5 ${m.role === "user" ? "bg-violet-600 shadow-lg shadow-violet-900/20" : "bg-white/[0.04] border border-white/10"}`}>
                          <p className="text-[15px]">{m.text}</p>
                          {m.products && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {m.products.map(p => (
                                <div key={p.id} className="bg-black/40 border border-white/10 rounded-2xl p-3">
                                  <img src={p.image} className="h-32 w-full object-cover rounded-xl mb-3" />
                                  <h4 className="font-bold text-xs truncate">{p.name}</h4>
                                  <div className="flex gap-2 mt-3">
                                    <button onClick={() => addToCart(p)} className="flex-1 py-2 bg-violet-600 rounded-lg text-[10px]">Сагслах</button>
                                    <button onClick={() => saveProduct(p)} className="p-2 bg-white/5 rounded-lg hover:text-fuchsia-400"><Bookmark size={14}/></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {sending && <Loader2 className="animate-spin text-violet-500 mx-auto" />}
                  <div ref={messagesEndRef} />
                </motion.div>
              )}

              {/* --- ХАДГАЛСАН БАРАА ХАРАГДАЦ --- */}
              {view === "saved" && (
                <motion.div key="saved" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Хадгалсан бараанууд</h2>
                    <button onClick={() => setView("chat")} className="p-2 hover:bg-white/5 rounded-full"><X size={20}/></button>
                  </div>
                  {savedProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]">
                      <Bookmark size={40} className="mx-auto mb-4 text-white/10" />
                      <p className="text-white/30">Танд хадгалсан бараа одоогоор алга.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {savedProducts.map(p => (
                        <div key={p.id} className="bg-white/[0.03] border border-white/10 rounded-3xl p-4 group">
                          <img src={p.image} className="h-40 w-full object-cover rounded-2xl mb-4 group-hover:scale-105 transition duration-300" />
                          <h3 className="font-bold text-sm mb-1">{p.name}</h3>
                          <p className="text-violet-400 font-bold text-sm mb-4">{p.price.toLocaleString()}₮</p>
                          <button onClick={() => addToCart(p)} className="w-full py-2 bg-white/5 hover:bg-violet-600 rounded-xl text-[10px] transition">Сагсанд нэмэх</button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* --- ЗАХИАЛГА ХАРАГДАЦ --- */}
              {view === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
                  <h2 className="text-2xl font-bold mb-8">Миний захиалгууд</h2>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div className="h-20 w-20 bg-violet-600/20 rounded-2xl flex items-center justify-center text-violet-400">
                          <Package size={32} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="font-bold">Захиалга #ORD-2026-00{i}</h3>
                          <p className="text-xs text-white/40 mt-1">Нийт: ₮{ (540000 * i).toLocaleString() } | 2026-04-16</p>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-500">
                          ХҮРГЭГДЭЖ БАЙГАА
                        </div>
                        <button className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs transition">Дэлгэрэнгүй</button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <footer className="p-4 md:p-6 bg-gradient-to-t from-[#04050b] to-transparent">
            <div className="max-w-4xl mx-auto relative">
              <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-[2rem] p-2 backdrop-blur-xl">
                <button className="p-3 text-white/30 hover:text-white"><ImageIcon size={20} /></button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="AI-аас бараа асуух..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 outline-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="bg-violet-600 p-3 rounded-2xl shadow-lg shadow-violet-600/20"
                >
                  <Send size={18} />
                </button>
              </div>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}