import React, { useState, useEffect } from "react";
import { Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { askGemini, parseGeminiJson } from "@/lib/gemini";
import { mockProducts, Product } from "@/lib/mockProducts";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface CompleteTheLookProps {
  currentProduct: Product;
}

export default function CompleteTheLook({ currentProduct }: CompleteTheLookProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    async function getSuggestions() {
      setIsLoading(true);
      try {
        // STEP A & B & C: Filter catalog manually first to reduce token usage and improve relevance
        const filteredCatalog = mockProducts.filter(p => {
          if (p.id === currentProduct.id) return false;
          if (p.gender !== currentProduct.gender) return false;
          if (p.subcategory === currentProduct.subcategory) return false;
          
          // Color Harmony Rules
          const c = currentProduct.color.toLowerCase();
          const pColor = p.color.toLowerCase();
          
          const isNeutral = (color: string) => ['black', 'white', 'beige', 'ivory', 'grey', 'khaki'].includes(color);
          const isBold = (color: string) => ['red', 'blue', 'green', 'navy', 'emerald', 'burgundy'].includes(color);
          const isPastel = (color: string) => ['pastel', 'pink', 'cream', 'sand', 'blush', 'lilac'].includes(color);

          if (isNeutral(c)) return true; // Anything matches
          if (isBold(c)) return isNeutral(pColor); // Bold matches neutrals
          if (isPastel(c)) return isPastel(pColor) || ['white', 'cream', 'ivory'].includes(pColor); // Pastel matches pastels/whites
          
          return true;
        }).filter(p => p.style.some(s => currentProduct.style.includes(s)));

        const prompt = `The user is viewing ${currentProduct.name}, a ${currentProduct.category}, color ${currentProduct.color}, 
        style ${currentProduct.style.join(", ")}. From this filtered list: ${JSON.stringify(filteredCatalog)},
        pick the best 3 products to complete the outfit (e.g. if viewing a top, pick a bottom and outer layer).
        Return ONLY a JSON array of product IDs.`;

        const response = await askGemini(prompt);
        const ids = parseGeminiJson(response);
        const matched = mockProducts.filter(p => ids.includes(p.id));
        setRecommendations(matched);
      } catch (e) {
        // Fallback: just show 3 random valid pieces
        const fallback = mockProducts
          .filter(p => p.gender === currentProduct.gender && p.subcategory !== currentProduct.subcategory)
          .slice(0, 3);
        setRecommendations(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    getSuggestions();
  }, [currentProduct.id]);

  if (isLoading) {
    return (
      <div className="py-24 text-center border-t border-[#2A2A2A]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A84C] mx-auto mb-4" />
        <p className="text-[10px] uppercase tracking-widest text-[#666] font-bold">Aya is styling your look...</p>
      </div>
    );
  }

  if (recommendations.length === 0 && !isLoading) return null;

  return (
    <section className="py-24 border-t border-[#2A2A2A]">
      <div className="flex items-center gap-3 mb-12">
        <Sparkles className="w-5 h-5 text-[#C9A84C]" />
        <h3 className="text-2xl font-serif italic" style={{ fontFamily: '"Playfair Display", serif' }}>Complete the Look 👗</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {recommendations.map(product => (
          <div key={product.id} className="bg-[#111] border border-[#2A2A2A] group relative overflow-hidden">
            <Link href={`/product/${product.id}`}>
              <div className="aspect-[3/4] overflow-hidden cursor-pointer">
                <img src={product.imageUrl} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" alt={product.name} />
              </div>
            </Link>
            <div className="p-6">
              <h4 className="text-[11px] uppercase tracking-widest font-bold mb-2 text-[#F5F0EB]">{product.name}</h4>
              <p className="text-[#C9A84C] font-bold mb-6">${product.price}</p>
              <Button 
                onClick={() => addItem(product, 1, product.sizes[0], product.colors[0])}
                className="w-full bg-transparent border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black h-12 rounded-none uppercase tracking-widest text-[9px] font-bold transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-2" /> Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length < 3 && (
        <p className="mt-8 text-center text-[#444] text-[10px] uppercase tracking-widest font-bold">
          We're adding more items soon — check back! 🛍️
        </p>
      )}
    </section>
  );
}
