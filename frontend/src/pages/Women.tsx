import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { mockProducts } from "@/lib/mockProducts";

export default function Women() {
  const [activeFilter, setActiveFilter] = useState("All");
  
  useMemo(() => {
    document.title = "StyleAI — Women's Collection";
  }, []);

  const filters = ["All", "Tops", "Dresses", "Jackets", "Sale"];

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(p => {
      if (p.gender !== "women") return false;
      if (activeFilter === "All") return true;
      if (activeFilter === "Sale") return p.isSale;
      return p.category.includes(activeFilter);
    });
  }, [activeFilter]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-serif mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Women's Collection</h1>
          <p className="text-[#A0A0A0] uppercase tracking-[0.3em] text-[10px] font-bold">Curated Elegance & Modern Silhouettes</p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 border-y border-[#2A2A2A] py-4">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all border ${
                activeFilter === filter 
                  ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5" 
                  : "border-transparent text-[#666] hover:text-[#A0A0A0]"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-[#666] italic">No items found in this category.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
