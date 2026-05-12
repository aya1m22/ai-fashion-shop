import { useState, useMemo, useEffect } from "react";
import { Loader2, Package, Search, Edit2, Save, X, ChevronDown, ChevronUp, TrendingUp, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";
import { mockProducts as initialProducts } from "@/lib/mockProducts";

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "men" | "women">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    document.title = "StyleAI — Admin Dashboard";
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchGender = genderFilter === "all" || p.gender === genderFilter;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchGender && matchSearch;
    });
  }, [products, genderFilter, search]);

  const handleSave = (id: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, price: editPrice } : p));
    setEditingId(null);
    toast.success("Price updated (Demo Mode)");
  };

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
        <Navbar />
        <div className="container py-32 text-center">
          <Package className="w-16 h-16 text-[#333] mx-auto mb-6" />
          <h2 className="text-3xl font-serif mb-4">Access Denied</h2>
          <p className="text-[#A0A0A0] mb-8 uppercase tracking-widest text-[10px]">Administrative privileges required</p>
          <Link href="/">
            <button className="px-8 py-3 bg-[#C9A84C] text-black font-bold uppercase tracking-widest text-[10px]">Return Home</button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-serif font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Intelligence Hub</h1>
            <p className="text-[#666] uppercase tracking-[0.3em] text-[10px] font-bold">Store Management & Analytics</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
            <div className="bg-[#111] border border-[#2A2A2A] p-6 text-center">
              <p className="text-2xl font-bold text-[#C9A84C]">{products.length}</p>
              <p className="text-[9px] uppercase tracking-widest text-[#666]">Products</p>
            </div>
            <div className="bg-[#111] border border-[#2A2A2A] p-6 text-center">
              <p className="text-2xl font-bold text-green-500">$4.2k</p>
              <p className="text-[9px] uppercase tracking-widest text-[#666]">Daily Sales</p>
            </div>
            <div className="bg-[#111] border border-[#2A2A2A] p-6 text-center hidden md:block">
              <p className="text-2xl font-bold text-blue-500">124</p>
              <p className="text-[9px] uppercase tracking-widest text-[#666]">Active Users</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 bg-[#111] border border-[#2A2A2A] p-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
            <input 
              type="text" 
              placeholder="Filter inventory..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] pl-12 pr-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all"
            />
          </div>
          <select 
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="bg-[#0D0D0D] border border-[#2A2A2A] px-6 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer hover:border-[#444] transition-all"
          >
            <option value="all">All Genders</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>
        </div>

        {/* Inventory List */}
        <div className="space-y-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-[#111] border border-[#2A2A2A] p-4 flex items-center gap-6 group hover:border-[#333] transition-colors">
              <div className="w-16 h-20 bg-[#1A1A1A] overflow-hidden shrink-0">
                <img src={product.imageUrl} className="w-full h-full object-cover" alt={product.name} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold uppercase tracking-tight">{product.name}</h3>
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase tracking-widest ${product.gender === 'women' ? 'bg-pink-900/20 text-pink-500' : 'bg-blue-900/20 text-blue-500'}`}>
                    {product.gender}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[#666] font-bold uppercase tracking-widest">
                  <span>ID: {product.id}</span>
                  <span className="text-[#C9A84C]">${product.price}</span>
                  <span className={product.stockStatus === 'Low Stock' ? 'text-orange-500' : 'text-green-800'}>{product.stockStatus}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {editingId === product.id ? (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={editPrice} 
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-20 bg-[#0D0D0D] border border-[#C9A84C] px-2 py-1 text-xs text-[#C9A84C] outline-none"
                    />
                    <button onClick={() => handleSave(product.id)} className="p-2 text-green-500 hover:bg-green-500/10"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-500/10"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setEditingId(product.id); setEditPrice(product.price); }}
                    className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] text-[#666] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
