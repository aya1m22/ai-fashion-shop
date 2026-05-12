import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TodaysPick from '../components/TodaysPick';
import SurpriseMe from '../components/SurpriseMe';
import StyleQuiz from '../components/StyleQuiz';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { catalogToProduct } from '@/lib/catalogAdapter';
import { initialCatalog } from '@shared/catalog';

const STATIC_TRENDING = initialCatalog.slice(0, 4).map(catalogToProduct);

const Home: React.FC = () => {
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  React.useEffect(() => {
    document.title = "StyleAI — Luxury AI-Curated Fashion";
  }, []);

  const { data: rawTrending, isLoading: trendingLoading, isError: trendingError } = trpc.products.list.useQuery({ limit: 4 });
  const trendingProducts = React.useMemo(
    () => trendingError ? STATIC_TRENDING : (rawTrending ?? []).map(catalogToProduct).slice(0, 4),
    [rawTrending, trendingError],
  );

  const categories = [
    { name: 'Dresses', href: '/women' },
    { name: 'Tops', href: '/women' },
    { name: 'Jackets', href: '/men' },
    { name: 'Pants', href: '/men' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400")',
          }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay animate-grain bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="relative h-full container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <h1 
            className="text-6xl md:text-8xl font-serif mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Dress the <br /><span className="italic">Future</span>
          </h1>
          <p className="text-lg md:text-xl text-[#F5F0EB]/80 mb-10 max-w-xl animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            AI-curated fashion. Personally yours. Discover a new era of style tailored to your unique essence.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <Button 
              onClick={() => setIsQuizOpen(true)}
              className="bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold px-10 py-7 rounded-none uppercase tracking-[0.2em] text-xs transition-all h-14 shadow-[0_0_25px_rgba(201,168,76,0.5)] animate-pulse"
            >
              Find My Style ✨
            </Button>
            <div className="flex gap-4">
              <Link href="/women">
                <Button variant="outline" className="border-[#F5F0EB] text-[#F5F0EB] hover:bg-[#F5F0EB] hover:text-black font-bold px-8 py-7 rounded-none uppercase tracking-widest text-[10px] transition-all h-14">
                  Shop Women
                </Button>
              </Link>
              <Link href="/men">
                <Button variant="outline" className="border-[#F5F0EB] text-[#F5F0EB] hover:bg-[#F5F0EB] hover:text-black font-bold px-8 py-7 rounded-none uppercase tracking-widest text-[10px] transition-all h-14">
                  Shop Men
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Pick Section */}
      <TodaysPick />

      {/* Categories Strip */}
      <section className="py-12 border-b border-[#2A2A2A] bg-[#0D0D0D]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href}>
                <button className="px-8 py-3 rounded-none border border-[#2A2A2A] text-[10px] uppercase tracking-widest font-bold text-[#666] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
                  {cat.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 text-[#C9A84C] mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">The Current Selection</span>
            </div>
            <h2 className="text-4xl font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>Trending Now</h2>
          </div>
          <Link href="/women" className="text-sm text-[#C9A84C] hover:underline flex items-center gap-2 uppercase tracking-widest font-bold text-[11px]">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-[#2A2A2A] overflow-hidden">
                  <Skeleton className="h-[320px] w-full bg-[#1A1A1A]" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-4 w-3/4 bg-[#1A1A1A]" />
                    <Skeleton className="h-4 w-1/3 bg-[#1A1A1A]" />
                  </div>
                </div>
              ))
            : trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </section>

      {/* AI Stylist Banner */}
      <section className="bg-[#111] py-32 relative overflow-hidden border-y border-[#2A2A2A]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C] opacity-[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Sparkles className="w-12 h-12 text-[#C9A84C] mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl font-serif mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
            Elevate Your Aesthetic
          </h2>
          <p className="text-[#A0A0A0] max-w-2xl mx-auto mb-10 text-lg">
            Let our proprietary AI analyze your unique profile to curate a capsule collection that speaks to your personality.
          </p>
          <Link href="/ai-stylist">
            <Button className="bg-transparent border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black font-bold px-12 py-8 rounded-none uppercase tracking-[0.2em] text-xs transition-all h-14">
              Consult Aya
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
      
      {/* Surprise Me Floating Button */}
      <SurpriseMe />

      {/* Style Quiz Overlay */}
      <StyleQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
    </div>
  );
};

export default Home;
