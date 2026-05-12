import React, { useState } from "react";
import { Ruler, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askGemini } from "@/lib/gemini";
import { Product } from "@/lib/mockProducts";

interface SizeRecommenderProps {
  product: Product;
  onSelectSize: (size: string) => void;
}

export default function SizeRecommender({ product, onSelectSize }: SizeRecommenderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [fit, setFit] = useState("Regular");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<{ size: string; tip: string } | null>(null);

  // Load measurements from localStorage
  useState(() => {
    const saved = localStorage.getItem("user_measurements");
    if (saved) {
      const data = JSON.parse(saved);
      setHeight(data.height || "");
      setUnit(data.unit || "cm");
      setWeight(data.weight || "");
      setWeightUnit(data.weightUnit || "kg");
      setFit(data.fit || "Regular");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      localStorage.setItem("user_measurements", JSON.stringify({ height, unit, weight, weightUnit, fit }));
      
      const prompt = `User height: ${height}${unit}, weight: ${weight}${weightUnit}, fit preference: ${fit}.
      The product is: ${product.name}, category: ${product.category}.
      Recommend the best size from: ${JSON.stringify(product.sizes)}.
      Reply in exactly this format:
      SIZE: [size]
      TIP: [one sentence about fit for this specific product]`;

      const response = await askGemini(prompt);
      
      const sizeMatch = response.match(/SIZE:\s*(.+)/i);
      const tipMatch = response.match(/TIP:\s*(.+)/i);
      
      if (sizeMatch && tipMatch) {
        setRecommendation({ size: sizeMatch[1].trim(), tip: tipMatch[1].trim() });
      } else {
        throw new Error("Parse error");
      }
    } catch (e) {
      setRecommendation({ size: product.sizes[Math.floor(product.sizes.length/2)], tip: "Based on standard fit profiles, this size should offer a comfortable silhouette." });
    } finally {
      setIsLoading(false);
    }
  };

  const selectRecommended = () => {
    if (recommendation) {
      onSelectSize(recommendation.size);
      setIsOpen(false);
      setRecommendation(null);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#666] hover:text-[#C9A84C] transition-colors"
      >
        <Ruler className="w-3 h-3" /> Find My Size 📏
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-[#111] border border-[#2A2A2A] w-full max-w-md p-8 relative overflow-hidden">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-[#666] hover:text-[#F5F0EB]">
              <X className="w-5 h-5" />
            </button>

            {!recommendation ? (
              <>
                <h3 className="text-2xl font-serif mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>Size Recommender</h3>
                <p className="text-[10px] uppercase tracking-widest text-[#666] mb-8 font-bold">Personalized fit analysis</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-[#A0A0A0] font-bold">Height</label>
                      <div className="flex bg-[#0D0D0D] border border-[#2A2A2A]">
                        <input type="text" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-transparent p-3 text-sm outline-none" placeholder="175" required />
                        <select value={unit} onChange={e => setUnit(e.target.value as any)} className="bg-transparent text-[10px] px-2 outline-none border-l border-[#2A2A2A]">
                          <option value="cm">cm</option>
                          <option value="in">in</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase tracking-widest text-[#A0A0A0] font-bold">Weight</label>
                      <div className="flex bg-[#0D0D0D] border border-[#2A2A2A]">
                        <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full bg-transparent p-3 text-sm outline-none" placeholder="70" required />
                        <select value={weightUnit} onChange={e => setWeightUnit(e.target.value as any)} className="bg-transparent text-[10px] px-2 outline-none border-l border-[#2A2A2A]">
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-widest text-[#A0A0A0] font-bold">Preferred Fit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Slim", "Regular", "Relaxed"].map(f => (
                        <button 
                          key={f} type="button" onClick={() => setFit(f)}
                          className={`py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${fit === f ? 'bg-[#C9A84C] border-[#C9A84C] text-black' : 'border-[#2A2A2A] text-[#666] hover:border-[#444]'}`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    disabled={isLoading}
                    className="w-full bg-[#C9A84C] text-black h-14 rounded-none uppercase tracking-widest font-bold text-xs"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get My Size"}
                  </Button>
                </form>
              </>
            ) : (
              <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-[#C9A84C]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#C9A84C]/30">
                  <span className="text-3xl font-serif text-[#C9A84C]">{recommendation.size}</span>
                </div>
                <h3 className="text-2xl font-serif mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Your Recommended Size: {recommendation.size}</h3>
                <p className="text-[#A0A0A0] text-sm leading-relaxed mb-10 px-4 italic">
                  "{recommendation.tip}"
                </p>
                <Button 
                  onClick={selectRecommended}
                  className="w-full bg-[#C9A84C] text-black h-14 rounded-none uppercase tracking-widest font-bold text-xs"
                >
                  Select Size {recommendation.size}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
