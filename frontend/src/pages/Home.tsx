import { Link } from "wouter";
import { Sparkles, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

const HERO_CATEGORIES = [
  {
    label: "Women",
    href: "/women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    description: "Dresses, Shirts, Bags & more",
  },
  {
    label: "Men",
    href: "/men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&q=80",
    description: "Shirts, Pants, Shoes & Accessories",
  },
];

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl overflow-hidden border border-stone-100" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="skeleton aspect-[3/4]" />
          <div className="p-4 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [favIds, setFavIds] = useState<Set<number>>(new Set());

  const { data: featuredWomen = [], isLoading: womenLoading } = trpc.products.list.useQuery({ gender: "women", limit: 4 });
  const { data: featuredMen = [], isLoading: menLoading } = trpc.products.list.useQuery({ gender: "men", limit: 4 });
  const { data: favList = [] } = trpc.favorites.list.useQuery(undefined, { enabled: isAuthenticated });

  const favSet = useMemo(() => new Set((favList as any[]).map((f: any) => f.productId)), [favList]);

  const handleFavChange = (productId: number, isFav: boolean) => {
    setFavIds((prev) => {
      const next = new Set(prev);
      if (isFav) next.add(productId); else next.delete(productId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-stone-900 text-white overflow-hidden">
        <div className="container py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="animate-hero-reveal text-stone-400 text-sm font-medium uppercase tracking-widest mb-4" style={{ animationDelay: "0ms" }}>
              AI-Powered Fashion
            </p>
            <h1 className="animate-hero-reveal font-display text-5xl md:text-6xl font-bold leading-tight mb-6" style={{ animationDelay: "100ms" }}>
              Discover Your<br />
              <span className="text-amber-400">Perfect Style</span>
            </h1>
            <p className="animate-hero-reveal text-stone-300 text-lg mb-8 leading-relaxed" style={{ animationDelay: "200ms" }}>
              Curated fashion for every occasion. Let our AI Stylist analyze your skin tone and recommend the perfect colors for your wardrobe.
            </p>
            <div className="animate-hero-reveal flex flex-wrap gap-4" style={{ animationDelay: "300ms" }}>
              <Link href="/women" className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-white text-stone-900 font-semibold rounded-full hover:bg-stone-100 transition-all duration-200 hover:shadow-lg">
                Shop Women
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/men" className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-stone-700 text-white font-semibold rounded-full hover:bg-stone-600 transition-all duration-200 hover:shadow-lg">
                Shop Men
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/ai-stylist" className="btn-press animate-pulse-glow inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-stone-900 font-semibold rounded-full hover:bg-amber-300 transition-all duration-200">
                <Sparkles className="w-4 h-4" />
                AI Stylist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="animate-fade-in-up font-display text-3xl font-bold text-stone-900">Shop by Gender</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6 stagger-children">
          {HERO_CATEGORIES.map((cat) => (
            <Link key={cat.href} href={cat.href} className="group relative overflow-hidden rounded-2xl aspect-[16/9] block card-lift">
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-display text-3xl font-bold text-white mb-1">{cat.label}</h3>
                <p className="text-stone-300 text-sm mb-3">{cat.description}</p>
                <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium border border-white/40 px-4 py-1.5 rounded-full group-hover:bg-white group-hover:text-stone-900 transition-all duration-300">
                  Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Stylist Banner */}
      <section className="container pb-16">
        <div className="bg-gradient-to-r from-stone-900 to-stone-700 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex-1 relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400 animate-float" />
              <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">AI-Powered</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">Color Recommendations<br />Tailored to You</h2>
            <p className="text-stone-300 mb-6">Upload a photo and our AI analyzes your skin tone to recommend the perfect clothing colors, watch metals, and ring finishes.</p>
            <Link href="/ai-stylist" className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-amber-400 text-stone-900 font-semibold rounded-full hover:bg-amber-300 transition-all duration-200 hover:shadow-lg hover:shadow-amber-400/20">
              <Sparkles className="w-4 h-4" />
              Try AI Stylist
            </Link>
          </div>
          <div className="hidden md:flex gap-3 relative z-10">
            {["Warm Tones", "Cool Tones", "Neutral Tones", "Deep Tones"].map((tone, i) => (
              <div key={tone} className="animate-fade-in-up bg-stone-800/80 backdrop-blur-sm rounded-xl p-4 text-center min-w-[90px] hover:bg-stone-700 transition-colors duration-200" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-2 animate-float ${
                  tone === "Warm Tones" ? "bg-amber-400" :
                  tone === "Cool Tones" ? "bg-blue-400" :
                  tone === "Neutral Tones" ? "bg-stone-400" : "bg-stone-600 border border-stone-500"
                }`} style={{ animationDelay: `${i * 200}ms` }} />
                <p className="text-white text-xs font-medium">{tone}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Women */}
      <section className="container pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-1">New Arrivals</p>
            <h2 className="font-display text-3xl font-bold text-stone-900">Women's Collection</h2>
          </div>
          <Link href="/women" className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors duration-200 group">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
        {womenLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featuredWomen as any[]).map((product: any, idx: number) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favSet.has(product.id)}
                onFavoriteChange={handleFavChange}
                animationDelay={idx * 80}
              />
            ))}
          </div>
        )}
      </section>

      {/* Featured Men */}
      <section className="container pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-stone-500 text-xs uppercase tracking-widest mb-1">New Arrivals</p>
            <h2 className="font-display text-3xl font-bold text-stone-900">Men's Collection</h2>
          </div>
          <Link href="/men" className="flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors duration-200 group">
            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
        {menLoading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featuredMen as any[]).map((product: any, idx: number) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorited={favSet.has(product.id)}
                onFavoriteChange={handleFavChange}
                animationDelay={idx * 80}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
                <span className="text-stone-900 text-xs font-bold">S</span>
              </div>
              <span className="font-display text-white font-semibold">StyleAI</span>
            </div>
            <p className="text-sm">© 2026 StyleAI. AI-powered fashion for everyone.</p>
            <div className="flex gap-6 text-sm">
              <Link href="/women" className="hover:text-white transition-colors duration-200">Women</Link>
              <Link href="/men" className="hover:text-white transition-colors duration-200">Men</Link>
              <Link href="/ai-stylist" className="hover:text-white transition-colors duration-200">AI Stylist</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
