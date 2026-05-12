import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { trpc } from '@/lib/trpc';

const Home: React.FC = () => {
  const { data: trendingProducts = [] } = trpc.products.list.useQuery({ limit: 4 });

  const categories = [
    { name: 'Dresses', href: '/women?subcategory=Dresses' },
    { name: 'Shirts', href: '/men?subcategory=Shirts' },
    { name: 'Pants', href: '/men?subcategory=Pants' },
    { name: 'Shoes', href: '/women?subcategory=Shoes' },
    { name: 'Accessories', href: '/women?subcategory=Accessories' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full overflow-hidden">
        {/* Editorial Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400")',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/45" />
        
        {/* Grain Texture */}
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
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <Link href="/women">
              <Button className="bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold px-10 py-7 rounded-none uppercase tracking-widest text-xs transition-all">
                Shop Women
              </Button>
            </Link>
            <Link href="/ai-stylist">
              <Button variant="outline" className="border-[#F5F0EB] text-[#F5F0EB] hover:bg-[#F5F0EB] hover:text-black font-bold px-10 py-7 rounded-none uppercase tracking-widest text-xs transition-all">
                Meet Your AI Stylist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories Strip */}
      <section className="py-12 border-b border-[#2A2A2A] bg-[#111]">
        <div className="container mx-auto px-4 overflow-x-auto whitespace-nowrap no-scrollbar">
          <div className="flex justify-center gap-4">
            {categories.map((cat) => (
              <Link key={cat.name} href={cat.href}>
                <button className="px-8 py-3 rounded-full border border-[#333] text-[10px] uppercase tracking-widest font-bold text-[#A0A0A0] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
                  {cat.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
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
          {trendingProducts.length > 0 ? (
            trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))
          ) : (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#1A1A1A] animate-pulse" />
            ))
          )}
        </div>
      </section>

      {/* AI Stylist Banner */}
      <section className="bg-[#1A1A1A] py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C] opacity-[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <Sparkles className="w-12 h-12 text-[#C9A84C] mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl font-serif mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
            Your Personal AI Stylist
          </h2>
          <p className="text-[#A0A0A0] max-w-2xl mx-auto mb-10 text-lg">
            Powered by Claude AI, our stylist analyzes your preferences and features to suggest the perfect luxury pieces for any occasion.
          </p>
          <Link href="/ai-stylist">
            <Button className="bg-transparent border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black font-bold px-12 py-8 rounded-none uppercase tracking-[0.2em] text-xs transition-all">
              Start Your Style Analysis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 border-t border-[#2A2A2A] text-center">
        <p className="text-[#666] text-xs uppercase tracking-widest">
          &copy; {new Date().getFullYear()} STYLEAI LUXURY FASHION. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default Home;
