import { useState, useMemo } from "react";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { useAuth } from "@/_core/hooks/useAuth";

const MEN_SUBCATEGORIES = ["shirts", "pants", "pajamas", "shoes", "accessories"];

export default function Men() {
  const { isAuthenticated } = useAuth();
  const [subcategory, setSubcategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products = [], isLoading } = trpc.products.list.useQuery({
    gender: "men",
    limit: 100,
  });

  const { data: favList = [] } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const favSet = useMemo(() => new Set((favList as any[]).map((f: any) => f.productId)), [favList]);

  const filteredProducts = useMemo(() => {
    return (products as any[]).filter((p: any) => {
      if (subcategory !== "all" && p.subcategory.toLowerCase() !== subcategory.toLowerCase()) return false;
      const price = parseFloat(String(p.price));
      if (price < priceRange[0] || price > priceRange[1]) return false;
      return true;
    });
  }, [products, subcategory, priceRange]);

  const clearAllFilters = () => {
    setSubcategory("all");
    setPriceRange([0, 1000]);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />

      {/* Page Header */}
      <div className="bg-[#111] border-b border-[#2A2A2A]">
        <div className="container mx-auto px-4 py-12">
          <p className="text-[#C9A84C] text-[10px] uppercase tracking-[0.3em] font-bold mb-3">Collection</p>
          <h1 className="font-serif text-5xl font-bold text-[#F5F0EB] mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>Men's Fashion</h1>
          
          {/* Category Pills relocation */}
          <div className="flex overflow-x-auto whitespace-nowrap no-scrollbar gap-3 pb-2">
            <button
              onClick={() => setSubcategory("all")}
              className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all ${
                subcategory === "all"
                  ? "bg-[#C9A84C] text-black border-[#C9A84C]"
                  : "bg-transparent text-[#A0A0A0] border-[#333] hover:border-[#C9A84C]"
              }`}
            >
              All Pieces
            </button>
            {MEN_SUBCATEGORIES.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubcategory(sub)}
                className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all ${
                  subcategory === sub
                    ? "bg-[#C9A84C] text-black border-[#C9A84C]"
                    : "bg-transparent text-[#A0A0A0] border-[#333] hover:border-[#C9A84C]"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <p className="text-[11px] uppercase tracking-widest text-[#A0A0A0]">
            <span className="text-[#F5F0EB] font-bold">{filteredProducts.length}</span> Results
          </p>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[#1A1A1A] border border-[#333] rounded-none text-[10px] uppercase tracking-widest font-bold text-[#F5F0EB]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
            Filters
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-72 shrink-0">
            <div className="sticky top-28">
              <FilterSidebar
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                totalCount={(products as any[]).length}
                filteredCount={filteredProducts.length}
                onClearAll={clearAllFilters}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-[100] md:hidden">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0D0D0D] p-8 border-l border-[#2A2A2A] overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="font-serif text-xl text-[#F5F0EB]" style={{ fontFamily: '"Playfair Display", serif' }}>Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="text-[#A0A0A0] hover:text-[#F5F0EB]">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <FilterSidebar
                  priceRange={priceRange}
                  onPriceChange={(r) => { setPriceRange(r); setMobileFiltersOpen(false); }}
                  totalCount={(products as any[]).length}
                  filteredCount={filteredProducts.length}
                  onClearAll={clearAllFilters}
                />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-10 h-10 animate-spin text-[#C9A84C]" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-40 bg-[#111] border border-[#2A2A2A]">
                <div className="w-20 h-20 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#2A2A2A]">
                  <SlidersHorizontal className="w-8 h-8 text-[#666]" />
                </div>
                <h3 className="text-2xl font-serif text-[#F5F0EB] mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>No pieces found</h3>
                <p className="text-[#A0A0A0] max-w-sm mx-auto mb-10 text-sm">We couldn't find any items matching your current filters. Adjust your selection or browse the entire collection.</p>
                <button 
                  onClick={clearAllFilters}
                  className="px-8 py-3 bg-[#C9A84C] text-black font-bold uppercase tracking-widest text-[10px]"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorited={favSet.has(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
