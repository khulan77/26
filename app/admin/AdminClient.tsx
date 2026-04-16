"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingUp, Search, Trash2, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default function AdminClient({ sellerId }: { sellerId: string }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview эсевэл add-product
  
  // Бараа нэмэх формын state
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    image: "",
    description: "",
    tags: "",
    stock: "",
    location: "",
  });

  // 1. Датагаа fetch хийж авах
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // 2. Бараа нэмэх функц
  const handleSubmit = async () => {
    if (!form.name || !form.price) return alert("Нэр болон үнийг заавал оруулна уу!");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sellerId,
          price: Number(form.price),
          stock: Number(form.stock || 1),
          tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        alert("Бараа амжилттай нэмэгдлээ!");
        setForm({ name: "", category: "", price: "", image: "", description: "", tags: "", stock: "", location: "" });
        fetchAdminData(); // Жагсаалтыг шинэчлэх
        setActiveTab("overview"); // Хяналтын самбар руу шилжих
      }
    } catch (error) {
      alert("Сервер алдаа гарлаа");
    }
  };

  // 3. Бараа устгах функц
  const deleteProduct = async (id: string) => {
    if (!confirm("Та энэ барааг устгахдаа итгэлтэй байна уу?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p: any) => p.id !== id));
      }
    } catch (error) {
      alert("Устгахад алдаа гарлаа");
    }
  };

  return (
    <div className="min-h-screen bg-[#070812] text-white flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#111322] p-6 flex flex-col gap-6 sticky top-0 h-screen">
        <div className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent px-2">
          ChatStory Admin
        </div>
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 p-3 rounded-2xl transition ${activeTab === "overview" ? "bg-violet-600 shadow-lg shadow-violet-600/20 text-white" : "text-white/40 hover:bg-white/5"}`}
          >
            <TrendingUp size={18} /> Хяналт
          </button>
          <button 
            onClick={() => setActiveTab("add-product")}
            className={`flex items-center gap-3 p-3 rounded-2xl transition ${activeTab === "add-product" ? "bg-violet-600 shadow-lg shadow-violet-600/20 text-white" : "text-white/40 hover:bg-white/5"}`}
          >
            <Plus size={18} /> Бараа нэмэх
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8">
        {activeTab === "overview" ? (
          <div className="space-y-8 max-w-6xl mx-auto">
            <header className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Системийн хяналт</h1>
                <p className="text-white/40 mt-1">Таны дэлгүүрийн идэвхтэй үзүүлэлтүүд</p>
              </div>
              <button onClick={() => setActiveTab("add-product")} className="bg-violet-600 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-violet-500 transition">
                <Plus size={18}/> Шинэ бараа
              </button>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Нийт бараа" value={products.length} color="violet" />
              <StatCard label="Идэвхтэй борлуулагч" value="1" color="fuchsia" />
              <StatCard label="Системийн төлөв" value="Healthy" color="emerald" />
            </div>

            {/* TABLE */}
            <div className="bg-[#111322] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h3 className="font-bold text-lg">Бүх бараанууд</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-white/20" size={16} />
                  <input placeholder="Бараа хайх..." className="bg-[#181a2d] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs outline-none focus:border-violet-500/50 transition" />
                </div>
              </div>
              
              {loading ? (
                <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-violet-500" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold bg-white/[0.01]">
                      <tr>
                        <th className="px-8 py-5">Бараа</th>
                        <th className="px-8 py-5">Ангилал</th>
                        <th className="px-8 py-5">Үнэ</th>
                        <th className="px-8 py-5 text-right">Үйлдэл</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {products.map((p: any) => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-4">
                              <img src={p.image || "/api/placeholder/40/40"} className="h-12 w-12 rounded-xl object-cover bg-white/5 border border-white/10" />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4"><span className="px-3 py-1 bg-white/5 rounded-full text-xs text-white/60">{p.category}</span></td>
                          <td className="px-8 py-4 font-mono font-bold text-violet-400 text-base">₮{p.price.toLocaleString()}</td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => deleteProduct(p.id)} className="p-2.5 hover:bg-red-500/10 rounded-xl text-white/20 hover:text-red-400 transition">
                                <Trash2 size={18}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* FORM SECTION */
          <div className="max-w-3xl mx-auto py-10">
            <div className="bg-[#111322] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-[100px] -z-10" />
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                <Plus className="text-violet-500" /> Шинэ бараа бүртгэх
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Барааны нэр" value={form.name} onChange={(val) => setForm({...form, name: val})} placeholder="Жишээ: Nike Air Max" />
                <Input label="Ангилал" value={form.category} onChange={(val) => setForm({...form, category: val})} placeholder="Жишээ: Shoes" />
                <Input label="Үнэ (₮)" value={form.price} onChange={(val) => setForm({...form, price: val})} placeholder="0.00" />
                <Input label="Үлдэгдэл" value={form.stock} onChange={(val) => setForm({...form, stock: val})} placeholder="1" />
                <div className="col-span-2">
                  <Input label="Зураг URL" value={form.image} onChange={(val) => setForm({...form, image: val})} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                   <label className="block text-xs font-bold text-white/30 uppercase tracking-widest mb-2 ml-2">Тайлбар</label>
                   <textarea 
                    className="w-full rounded-2xl border border-white/10 bg-[#181a2d] p-4 outline-none focus:border-violet-500/50 min-h-[120px] transition" 
                    value={form.description} 
                    onChange={(e) => setForm({...form, description: e.target.value})}
                   />
                </div>
                <Input label="Tags (таслалаар)" value={form.tags} onChange={(val) => setForm({...form, tags: val})} placeholder="new, summer, fashion" />
                <Input label="Байршил" value={form.location} onChange={(val) => setForm({...form, location: val})} placeholder="Улаанбаатар" />
              </div>

              <button 
                onClick={handleSubmit} 
                className="w-full mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-4 font-bold text-white shadow-lg shadow-violet-600/20 hover:scale-[1.01] transition-all active:scale-[0.98]"
              >
                Барааг системд нэмэх
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ТУСЛАХ КОМПОНЕНТУУД
function StatCard({ label, value, color }: any) {
  const colorStyles: any = {
    violet: "border-violet-500/20 bg-violet-500/5 text-violet-400",
    fuchsia: "border-fuchsia-500/20 bg-fuchsia-500/5 text-fuchsia-400",
    emerald: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
  };
  return (
    <div className={`p-8 border rounded-[2.5rem] transition hover:bg-white/[0.02] ${colorStyles[color]}`}>
      <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">{label}</p>
      <h3 className="text-4xl font-black mt-2 text-white">{value}</h3>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 ml-4">{label}</label>
      <input 
        className="w-full rounded-2xl border border-white/10 bg-[#181a2d] px-5 py-3.5 outline-none focus:border-violet-500/50 transition text-sm" 
        placeholder={placeholder} 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
      />
    </div>
  );
}