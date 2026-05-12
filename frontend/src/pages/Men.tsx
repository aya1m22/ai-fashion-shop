import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { catalogToProduct } from "@/lib/catalogAdapter";
import { initialCatalog } from "@shared/catalog";

const STATIC_MEN = initialCatalog.filter((p) => p.gender === "men").map(catalogToProduct);

const FILTERS = ["All", "shirts", "pants", "shoes", "pajamas", "accessories"];
const filterLabels: Record<string, string> = {
  All: "All", shirts: "Shirts", pants: "Pants",
  shoes: "Shoes", pajamas: "Pajamas", accessories: "Accessories",
};

export default function Men() {
  const [activeFilter, setActiveFilter] = useState("All");

  useMemo(() => { document.title = "StyleAI — Men's Collection"; }, []);

  const { data: rawProducts, isLoading, isError } = trpc.products.list.useQuery({
    gender: "men", limit: 100,
  });

  // Live data when backend is up; static catalog when it's down (GitHub Pages, no server)
  const products = useMemo(
    () => isError ? STATIC_MEN : (rawProducts ?? []).map(catalogToProduct),
    [rawProducts, isError],
  );

  const filteredProducts = useMemo(() => {
    if (activeFilter === "All") return products;
    return products.filter((p) => p.subcategory.toLowerCase() === activeFilter.toLowerCase());
  }, [products, activeFilter]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-serif mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Men's Collection
          </h1>
          <p className="text-[#A0A0A0] uppercase tracking-[0.3em] text-[10px] font-bold">
            Timeless Essentials & Modern Craftsmanship
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-16 border-y border-[#2A2A2A] py-4">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all border ${
                activeFilter === filter
                  ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5"
                  : "border-transparent text-[#666] hover:text-[#A0A0A0]"
              }`}
            >
              {filterLabels[filter]}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#111] border border-[#2A2A2A] overflow-hidden">
                <Skeleton className="h-[320px] w-full bg-[#1A1A1A]" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-[#1A1A1A]" />
                  <Skeleton className="h-4 w-1/3 bg-[#1A1A1A]" />
                  <Skeleton className="h-10 w-full bg-[#1A1A1A]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid (live or static fallback) */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-[#666] italic">No items found in this category.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
