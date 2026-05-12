import React, { useState, useEffect } from "react";
import { Star, ShoppingBag, Sparkles, Loader2 } from "lucide-react";
import { askGemini } from "@/lib/gemini";
import { mockProducts, Product } from "@/lib/mockProducts";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

export default function TodaysPick() {
  const [product, setProduct] = useState<Product | null>(null);
  const [tip, setTip] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    async function getPick() {
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
      const pick = mockProducts[dayOfYear % mockProducts.length];
      setProduct(pick);

      // Check cache
      const cachedTip = sessionStorage.getItem(`todays_tip_${pick.id}`);
      if (cachedTip) {
        setTip(cachedTip);
        setIsLoading(false);
      } else {
        try {
          const prompt = `Give me one short styling tip for: ${pick.name}. Maximum 15 words. Sound like a friendly stylist.`;
          const stylingTip = await askGemini(prompt);
          setTip(stylingTip);
          sessionStorage.setItem(`todays_tip_${pick.id}`, stylingTip);
        } catch (e) {
          setTip("A versatile piece that brings effortless elegance to any ensemble. 💫");
        } finally {
          setIsLoading(false);
        }
      }
    }

    getPick();
  }, []);

  if (!product) return null;

  return (
    <section className="py-24 bg-[#111] border-y border-[#2A2A2A] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          {/* Image */}
          <div className="w-full md:w-1/2 relative group">
            <div className="aspect-[4/5] overflow-hidden border border-[#2A2A2A]">
              <img src={product.imageUrl} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt={product.name} />
            </div>
            <div className="absolute top-8 left-8 bg-[#C9A84C] text-black px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] font-bold shadow-xl">
              Today's Pick 🌟
            </div>
          </div>

          {/* Content */}
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-2 text-[#C9A84C] mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Limited Time Recommendation</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-[#F5F0EB]" style={{ fontFamily: '"Playfair Display", serif' }}>
              {product.name}
            </h2>

            <div className="flex items-center gap-6 mb-8">
              <span className="text-3xl font-bold text-[#C9A84C]">${product.price}</span>
              <div className="flex items-center gap-1 text-[#C9A84C]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold">{product.rating}</span>
                <span className="text-[#666] text-sm ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="bg-[#1A1A1A] border-l-2 border-[#C9A84C] p-8 mb-10 min-h-[100px] flex items-center">
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-[#666]" />
              ) : (
                <p className="text-xl font-serif italic text-[#A0A0A0] leading-relaxed">
                  "{tip}"
                </p>
              )}
            </div>

            <Button 
              onClick={() => addItem(product, 1, product.sizes[0], product.colors[0])}
              className="bg-[#C9A84C] text-black h-16 px-12 rounded-none uppercase tracking-[0.2em] font-bold text-xs hover:bg-[#B0923D] transition-all shadow-[0_0_30px_rgba(201,168,76,0.2)]"
            >
              <ShoppingBag className="w-4 h-4 mr-3" /> Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
