import React, { useState } from "react";
import { Dices, X, Loader2, ShoppingBag, Sparkles } from "lucide-react";
import { askGemini, parseGeminiJson } from "@/lib/gemini";
import { mockProducts, Product } from "@/lib/mockProducts";
import { initialCatalog } from "@shared/catalog";
import { catalogToProduct } from "@/lib/catalogAdapter";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

type Gender = "women" | "men";

const ALL_PRODUCTS: Product[] = [
  ...mockProducts,
  ...initialCatalog.map(catalogToProduct),
];

function getByGender(gender: Gender): Product[] {
  return ALL_PRODUCTS.filter(p => p.gender === gender);
}

export default function SurpriseMe() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"gender" | "result">("gender");
  const [gender, setGender] = useState<Gender | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outfit, setOutfit] = useState<{ items: Product[]; story: string } | null>(null);
  const { addItem } = useCart();

  const openAndReset = () => {
    setStep("gender");
    setGender(null);
    setOutfit(null);
    setIsOpen(true);
  };

  const generateSurprise = async (selectedGender: Gender) => {
    setGender(selectedGender);
    setStep("result");
    setIsLoading(true);
    const pool = getByGender(selectedGender);
    try {
      const sample = pool.slice(0, 40);
      const prompt = `You are a fashion stylist. Pick a complete ${selectedGender}'s outfit from this catalog: ${JSON.stringify(sample.map(p => ({ id: p.id, name: p.name, subcategory: p.subcategory, color: p.color })))}.
A complete outfit is 2-3 items that work together (e.g. top + bottom, or dress + outer layer).
Return ONLY a JSON object with:
- itemIds: Array of product IDs from the catalog above
- story: 2-sentence style story about why this combination works starting with "The [product1] paired with..."
Return ONLY valid JSON, no markdown.`;

      const response = await askGemini(prompt);
      const data = parseGeminiJson(response);
      const items = pool.filter(p => (data.itemIds as number[]).includes(p.id));
      if (items.length === 0) throw new Error("no items");
      setOutfit({ items, story: data.story });
    } catch {
      const items = pool.slice(0, 2);
      setOutfit({
        items,
        story: "This spontaneous combination balances effortless charm with contemporary luxury, perfect for making a subtle statement.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const surpriseAgain = () => {
    if (gender) generateSurprise(gender);
  };

  const addAllToCart = () => {
    if (!outfit) return;
    outfit.items.forEach(item => {
      addItem(item, 1, item.sizes[0], item.colors[0]);
    });
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={openAndReset}
        className="fixed bottom-24 right-6 z-40 bg-[#C9A84C] text-black w-14 h-14 rounded-full shadow-[0_0_20px_rgba(201,168,76,0.4)] flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group overflow-hidden"
      >
        <Dices className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] bg-[#0D0D0D] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full max-w-5xl h-[85vh] bg-[#111] border border-[#2A2A2A] relative overflow-hidden flex flex-col md:flex-row">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 z-50 text-[#666] hover:text-[#C9A84C]">
              <X className="w-8 h-8" />
            </button>

            {/* Step 1: Gender selection */}
            {step === "gender" && (
              <div className="w-full flex flex-col items-center justify-center text-center p-12 gap-10">
                <div>
                  <Sparkles className="w-10 h-10 text-[#C9A84C] mx-auto mb-4" />
                  <h3 className="text-3xl font-serif italic mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                    Spin the Wheel of Style
                  </h3>
                  <p className="text-[#666] uppercase tracking-widest text-xs">
                    First, choose your section
                  </p>
                </div>
                <div className="flex gap-6 w-full max-w-sm">
                  {(["women", "men"] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => generateSurprise(g)}
                      className="flex-1 py-5 border border-[#2A2A2A] text-[#A0A0A0] uppercase tracking-[0.2em] text-xs font-bold hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
                    >
                      {g === "women" ? "Women" : "Men"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Loading */}
            {step === "result" && isLoading && (
              <div className="w-full flex flex-col items-center justify-center text-center p-12">
                <div className="relative mb-8">
                  <Sparkles className="w-16 h-16 text-[#C9A84C] animate-pulse" />
                  <Loader2 className="w-24 h-24 text-[#C9A84C]/20 animate-spin absolute inset-0 -m-4" />
                </div>
                <h3 className="text-3xl font-serif italic mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Spinning the wheel of style...
                </h3>
                <p className="text-[#666] uppercase tracking-widest text-xs">Finding your next spontaneous look</p>
              </div>
            )}

            {/* Step 2: Result */}
            {step === "result" && !isLoading && outfit && (
              <>
                {/* Magazine Left (Imagery) */}
                <div className="md:w-3/5 relative bg-[#0D0D0D] p-12 flex gap-4 overflow-hidden border-r border-[#2A2A2A]">
                  <div className="absolute top-12 left-12 z-10">
                    <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C9A84C] block mb-2">StyleAI Exclusive</span>
                    <h2 className="text-7xl font-serif font-bold text-white leading-none mix-blend-difference" style={{ fontFamily: '"Playfair Display", serif' }}>
                      MODERN<br />VIBE
                    </h2>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-4 pt-24">
                    {outfit.items.map((item, idx) => (
                      <div key={item.id} className={`aspect-[3/4] overflow-hidden border border-[#2A2A2A] relative ${idx === 1 ? "md:-translate-y-12" : ""}`}>
                        <img
                          src={item.imageUrl}
                          className="w-full h-full object-cover"
                          alt={item.name}
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400"; }}
                        />
                        <div className="absolute bottom-4 left-4 bg-black/80 px-3 py-1 text-[9px] uppercase tracking-widest font-bold">
                          Item 0{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Magazine Right (Copy) */}
                <div className="md:w-2/5 p-12 flex flex-col justify-center bg-[#111]">
                  <div className="mb-12">
                    <h3 className="text-sm uppercase tracking-[0.3em] text-[#C9A84C] font-bold mb-4">
                      Your Spontaneous {gender === "women" ? "Women's" : "Men's"} Look 🔥
                    </h3>
                    <div className="space-y-4 mb-12">
                      {outfit.items.map(item => (
                        <div key={item.id} className="flex justify-between items-end border-b border-[#2A2A2A] pb-2">
                          <span className="text-[11px] uppercase tracking-widest font-bold text-[#F5F0EB]">{item.name}</span>
                          <span className="text-sm font-serif text-[#666] italic">${item.price}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xl font-serif text-[#A0A0A0] leading-relaxed italic border-l-2 border-[#C9A84C] pl-6 mb-12">
                      "{outfit.story}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={addAllToCart}
                      className="w-full bg-[#C9A84C] text-black h-16 rounded-none uppercase tracking-[0.2em] font-bold text-xs"
                    >
                      <ShoppingBag className="w-4 h-4 mr-3" /> Add Full Outfit to Cart
                    </Button>
                    <Button
                      onClick={surpriseAgain}
                      variant="outline"
                      className="w-full border-[#2A2A2A] text-[#666] hover:text-[#C9A84C] hover:border-[#C9A84C] h-14 rounded-none uppercase tracking-widest text-[10px] font-bold"
                    >
                      Surprise Me Again 🎲
                    </Button>
                    <Button
                      onClick={openAndReset}
                      variant="ghost"
                      className="w-full text-[#444] hover:text-[#666] h-10 rounded-none uppercase tracking-widest text-[9px] font-bold"
                    >
                      Change Section
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
