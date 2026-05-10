import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import { useAuth } from "@/_core/hooks/useAuth";

const WOMEN_SUBCATEGORIES = ["dresses", "shirts", "pants", "pajamas", "bags", "accessories", "shoes"];

export default function Women() {
  const { isAuthenticated } = useAuth();
  const [subcategory, setSubcategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: products = [], isLoading } = trpc.products.list.useQuery({
    gender: "women",
    limit: 100,
  });

  const { data: favList = [] } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });
  const favSet = useMemo(() => new Set((favList as any[]).map((f: any) => f.productId)), [favList]);

  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    (products as any[]).forEach((p: any) => {
      (p.colors || []).forEach((c: string) => colorSet.add(c));
    });
    return Array.from(colorSet).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products as any[]).filter((p: any) => {
      if (subcategory !== "all" && p.subcategory !== subcategory) return false;
      const price = parseFloat(String(p.price));
      if (price < priceRange[0] || price > priceRange[1]) return false;
      if (selectedColors.length > 0) {
        const hasColor = (p.colors || []).some((c: string) => selectedColors.includes(c));
        if (!hasColor) return false;
      }
      return true;
    });
  }, [products, subcategory, priceRange, selectedColors]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="container py-10">
          <p className="text-stone-500 text-xs uppercase tracking-widest mb-2">Collection</p>
          <h1 className="font-display text-4xl font-bold text-stone-900 mb-1">Women's Fashion</h1>
          <p className="text-stone-500 text-sm">Dresses · Shirts · Pants · Pajamas · Bags · Accessories · Shoes</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Mobile Filter Toggle */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-stone-900">{filteredProducts.length}</span> products
          </p>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-full text-sm font-medium text-stone-700 hover:border-stone-400 transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-56 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                subcategories={WOMEN_SUBCATEGORIES}
                selectedSubcategory={subcategory}
                onSubcategoryChange={setSubcategory}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                selectedColors={selectedColors}
                onColorsChange={setSelectedColors}
                availableColors={availableColors}
                totalCount={(products as any[]).length}
                filteredCount={filteredProducts.length}
              />
            </div>
          </div>

          {/* Mobile Filter Drawer */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-stone-900/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-stone-900">Filters</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-stone-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <FilterSidebar
                  subcategories={WOMEN_SUBCATEGORIES}
                  selectedSubcategory={subcategory}
                  onSubcategoryChange={(s) => { setSubcategory(s); setMobileFiltersOpen(false); }}
                  priceRange={priceRange}
                  onPriceChange={setPriceRange}
                  selectedColors={selectedColors}
                  onColorsChange={setSelectedColors}
                  availableColors={availableColors}
                  totalCount={(products as any[]).length}
                  filteredCount={filteredProducts.length}
                />
              </div>
            </div>
          )}

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-32 px-4 rounded-2xl border-2 border-dashed border-stone-200 bg-white/50">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-stone-400" />
                </div>
                <h3 className="text-xl font-display font-semibold text-stone-900 mb-2">No products found</h3>
                <p className="text-stone-500 max-w-sm mx-auto mb-6">We couldn't find any items matching your current filters. Try removing some filters or check back later for new arrivals.</p>
                <button 
                  onClick={() => { setSubcategory("all"); setPriceRange([0, 500]); setSelectedColors([]); }}
                  className="px-6 py-2 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product: any, idx: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorited={favSet.has(product.id)}
                    animationDelay={idx * 40}
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
