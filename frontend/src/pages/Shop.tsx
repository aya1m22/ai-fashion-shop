import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X, ShoppingBag, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import { catalogToProduct } from "@/lib/catalogAdapter";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/lib/mockProducts";
import { toast } from "sonner";
import { initialCatalog } from "@shared/catalog";

const STATIC_ALL = initialCatalog.map(catalogToProduct);

type SortOption = "default" | "price-asc" | "price-desc";

export default function Shop() {
  const { addItem } = useCart();

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "men" | "women">("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("default");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  useMemo(() => {
    document.title = "StyleAI — Shop All";
  }, []);

  const { data: rawProducts, isLoading, isError } = trpc.products.list.useQuery({
    limit: 200,
  });

  // Live data when backend is up; static catalog as fallback (GitHub Pages, no server)
  const allProducts = useMemo(
    () => isError ? STATIC_ALL : (rawProducts ?? []).map(catalogToProduct),
    [rawProducts, isError],
  );

  const subcategories = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.subcategory.toLowerCase()));
    return Array.from(set).sort();
  }, [allProducts]);

  const filtered = useMemo(() => {
    let list = allProducts;

    if (genderFilter !== "all") {
      list = list.filter((p) => p.gender === genderFilter);
    }
    if (subcategoryFilter !== "all") {
      list = list.filter(
        (p) => p.subcategory.toLowerCase() === subcategoryFilter,
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q),
      );
    }

    if (sort === "price-asc") {
      list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sort === "price-desc") {
      list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    return list;
  }, [allProducts, genderFilter, subcategoryFilter, search, sort]);

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] ?? "");
    setSelectedColor(product.colors[0] ?? "");
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    if (!selectedSize) {
      toast.error("Please select a size.");
      return;
    }
    if (!selectedColor) {
      toast.error("Please select a colour.");
      return;
    }
    addItem(selectedProduct, 1, selectedSize, selectedColor);
    setSelectedProduct(null);
  };

  const genderBadge = (gender: "men" | "women") =>
    gender === "women"
      ? "bg-pink-900/20 text-pink-400"
      : "bg-blue-900/20 text-blue-400";

  return (
    <div
      className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1
            className="text-5xl font-serif mb-4"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Shop All
          </h1>
          <p className="text-[#A0A0A0] uppercase tracking-[0.3em] text-[10px] font-bold">
            {isLoading ? "Loading catalogue…" : `${filtered.length} items`}
          </p>
        </header>

        {/* Filter & Search Bar */}
        <div className="bg-[#111] border border-[#2A2A2A] p-4 mb-12 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0D0D0D] border border-[#2A2A2A] pl-12 pr-10 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#A0A0A0]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Gender filter */}
          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value as "all" | "men" | "women");
              setSubcategoryFilter("all");
            }}
            className="bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer hover:border-[#444] transition-all"
          >
            <option value="all">All</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>

          {/* Subcategory filter */}
          <select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            className="bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer hover:border-[#444] transition-all"
          >
            <option value="all">All Categories</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-[10px] uppercase tracking-widest font-bold outline-none cursor-pointer hover:border-[#444] transition-all"
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#111] border border-[#2A2A2A] overflow-hidden">
                <Skeleton className="h-[280px] w-full bg-[#1A1A1A]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-[#1A1A1A]" />
                  <Skeleton className="h-4 w-1/3 bg-[#1A1A1A]" />
                  <Skeleton className="h-9 w-full bg-[#1A1A1A]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Grid (live or static fallback — no error screen) */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="group bg-[#111] border border-[#2A2A2A] overflow-hidden transition-all duration-300 hover:border-[#C9A84C]/30 flex flex-col cursor-pointer"
                onClick={() => openDetail(product)}
              >
                {/* Image */}
                <div className="relative h-[280px] overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Gender badge */}
                  <span
                    className={`absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ${genderBadge(product.gender)}`}
                  >
                    {product.gender}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#F5F0EB] mb-1 line-clamp-1 group-hover:text-[#C9A84C] transition-colors">
                    {product.name}
                  </p>
                  <p className="text-[9px] text-[#555] uppercase tracking-widest mb-3">
                    {product.subcategory}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[#C9A84C] font-bold text-sm">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest ${
                        product.stock === "out of stock"
                          ? "text-red-500"
                          : product.stock === "low stock"
                          ? "text-orange-400"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDetail(product);
                    }}
                    className="w-full mt-3 h-9 bg-transparent border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C] hover:text-[#C9A84C] rounded-none uppercase tracking-[0.15em] font-bold text-[9px] transition-all"
                  >
                    <ShoppingBag className="w-3 h-3 mr-1.5" /> Quick Add
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filtered.length === 0 && (
          <div className="py-32 text-center">
            <SlidersHorizontal className="w-12 h-12 text-[#333] mx-auto mb-6" />
            <h3
              className="text-2xl font-serif mb-3"
              style={{ fontFamily: '"Playfair Display", serif' }}
            >
              No results found
            </h3>
            <p className="text-[#666] italic mb-6">
              Try adjusting your search or filters.
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setGenderFilter("all");
                setSubcategoryFilter("all");
                setSort("default");
              }}
              className="bg-[#C9A84C] text-black rounded-none h-11 px-8 uppercase tracking-widest font-bold text-[10px]"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />

      {/* Product Detail Sheet */}
      <Sheet open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg bg-[#0D0D0D] border-l border-[#2A2A2A] text-[#F5F0EB] overflow-y-auto p-0"
        >
          {selectedProduct && (
            <>
              {/* Product Image */}
              <div className="h-[380px] overflow-hidden">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8">
                <SheetHeader className="mb-6 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ${genderBadge(selectedProduct.gender)}`}
                    >
                      {selectedProduct.gender} · {selectedProduct.subcategory}
                    </span>
                    <span className="text-[#C9A84C] font-bold text-lg">
                      ${parseFloat(selectedProduct.price).toFixed(2)}
                    </span>
                  </div>
                  <SheetTitle
                    className="text-2xl font-serif text-[#F5F0EB] text-left leading-snug"
                    style={{ fontFamily: '"Playfair Display", serif' }}
                  >
                    {selectedProduct.name}
                  </SheetTitle>
                </SheetHeader>

                {/* Rating placeholder */}
                <div className="flex items-center gap-1.5 mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.round(selectedProduct.rating) ? "text-[#C9A84C] fill-current" : "text-[#333]"}`}
                    />
                  ))}
                  <span className="text-[#666] text-xs ml-1">
                    {selectedProduct.rating.toFixed(1)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[#A0A0A0] text-sm leading-relaxed mb-8 italic">
                  {selectedProduct.description}
                </p>

                {/* Size Selector */}
                {selectedProduct.sizes.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#666] mb-3">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-[3rem] px-3 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            selectedSize === size
                              ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10"
                              : "border-[#2A2A2A] text-[#666] hover:border-[#444]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colour Selector */}
                {selectedProduct.colors.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#666] mb-3">
                      Colour
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${
                            selectedColor === color
                              ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/10"
                              : "border-[#2A2A2A] text-[#666] hover:border-[#444]"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddToCart}
                  disabled={selectedProduct.stock === "out of stock"}
                  className="w-full h-14 bg-[#C9A84C] text-black rounded-none uppercase tracking-[0.2em] font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {selectedProduct.stock === "out of stock"
                    ? "Out of Stock"
                    : "Add to Cart"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
