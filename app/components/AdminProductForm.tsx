"use client";

import { useState } from "react";
import { Plus, Image as ImageIcon, Loader2 } from "lucide-react";

export default function AdminProductForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      price: parseFloat(formData.get("price") as string),
      category: formData.get("category"),
      image: formData.get("image"),
      description: formData.get("description"),
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert("Бараа амжилттай нэмэгдлээ!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Plus className="text-violet-500" /> Шинэ бараа нэмэх
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase ml-2">Барааны нэр</label>
            <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-violet-500/50 transition" placeholder="Nike Air..." />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/40 uppercase ml-2">Үнэ (₮)</label>
            <input name="price" type="number" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-violet-500/50 transition" placeholder="250000" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/40 uppercase ml-2">Ангилал</label>
          <select name="category" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-violet-500/50 transition appearance-none">
            <option value="shoes">Гутал</option>
            <option value="electronics">Электроник</option>
            <option value="home">Гэр ахуй</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/40 uppercase ml-2">Зургийн URL</label>
          <div className="relative">
            <ImageIcon className="absolute left-4 top-3.5 text-white/20" size={18} />
            <input name="image" required className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-violet-500/50 transition" placeholder="https://..." />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-white/40 uppercase ml-2">Тайлбар</label>
          <textarea name="description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 outline-none focus:border-violet-500/50 transition" placeholder="Барааны тухай товчхон..." />
        </div>

        <button 
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 py-4 rounded-2xl font-bold shadow-lg shadow-violet-600/20 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Барааг бүртгэх"}
        </button>
      </form>
    </div>
  );
}