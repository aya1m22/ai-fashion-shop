import { useState, useRef, useEffect } from "react";
import { Sparkles, Upload, Loader2, Check, Briefcase, PartyPopper, Coffee, Layout, ShoppingBag, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mockProducts, Product } from "@/lib/mockProducts";
import { askGemini, parseGeminiJson } from "@/lib/gemini";

const OCCASION_KEYWORDS = [
  "interview", "wedding", "party", "beach", "date", "gym", "work", 
  "funeral", "graduation", "travel", "birthday", "picnic", "dinner"
];

const OCCASION_TIPS: Record<string, string> = {
  interview: "Stick to neutrals, avoid distracting logos, and ensure your fit is tailored. Confidence starts with a polished silhouette.",
  wedding: "Check the dress code carefully. When in doubt, a subtle pattern or a rich solid tone always exudes class.",
  work: "Balance comfort with professionalism. Quality basics paired with one statement piece create the perfect office look.",
  party: "This is your time to shine. Don't be afraid of bold textures, metallics, or unique cuts that spark conversation.",
  date: "Aim for 'effortlessly put together'. A mix of soft fabrics and a structured outer layer works every time.",
  gym: "Focus on performance fabrics that move with you, but don't sacrifice style. Color-coordinated sets are trending."
};

export default function AIStylist() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [activeMode, setActiveMode] = useState<"analysis" | "outfit">("analysis");
  const [gender, setGender] = useState<"men" | "women">("women");
  
  // Occasion Detection State
  const [chatInput, setChatInput] = useState("");
  const [chatResults, setChatResults] = useState<{ products: Product[], occasion: string, tip: string } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    document.title = "StyleAI — AI Personal Stylist";
  }, []);

  const handleChatSearch = async () => {
    const input = chatInput.toLowerCase();
    const occasion = OCCASION_KEYWORDS.find(k => input.includes(k));
    
    if (!occasion) {
      toast.info("I'm Aya, your stylist. Try mentioning an occasion like 'wedding', 'interview', or 'date'!");
      return;
    }

    setIsChatLoading(true);
    try {
      const prompt = `User needs an outfit for ${occasion}. 
      From this catalog: ${JSON.stringify(mockProducts)},
      return the IDs of the best 3 products for this occasion.
      Return ONLY a JSON array of IDs.`;

      const response = await askGemini(prompt);
      
      if (typeof response === "string" && response.includes("API key missing")) {
        toast.error(response);
        setIsChatLoading(false);
        return;
      }

      const ids = parseGeminiJson(response);
      const products = mockProducts.filter(p => ids.includes(p.id));
      
      setChatResults({
        products,
        occasion,
        tip: OCCASION_TIPS[occasion] || "Dress to express your unique essence. Confidence is your best accessory."
      });
      setChatInput("");
    } catch (e) {
      toast.error("Aya is having a moment — please try again 💫");
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1 border border-[#C9A84C] rounded-none mb-6">
              <Sparkles className="w-3 h-3 text-[#C9A84C]" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C]">StyleAI Elite</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              Your Personal AI Stylist
            </h1>
            <p className="text-[#A0A0A0] text-lg max-w-xl mx-auto italic">
              "Hi! I'm Aya, your personal StyleAI stylist 👗 Tell me your occasion, or vibe and I'll find the perfect look for you!"
            </p>
          </div>

          {/* Chat / Occasion Finder */}
          <div className="mb-16">
            <div className="bg-[#111] border border-[#2A2A2A] p-2 flex gap-2">
               <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSearch()}
                  placeholder="Ask Aya: 'What should I wear to a summer wedding?' or 'Outfit for an interview'..."
                  className="flex-1 bg-transparent border-none px-6 py-4 text-sm focus:outline-none placeholder:text-[#333]"
               />
               <Button 
                onClick={handleChatSearch}
                disabled={isChatLoading}
                className="bg-[#C9A84C] text-black rounded-none h-14 px-8 uppercase tracking-widest font-bold text-xs"
               >
                 {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Consult Aya"}
               </Button>
            </div>
            
            {chatResults && (
              <div className="mt-12 space-y-12 animate-in slide-in-from-top-4 duration-500">
                <div className="text-center">
                  <h3 className="text-2xl font-serif italic mb-2 capitalize" style={{ fontFamily: '"Playfair Display", serif' }}>
                    Perfect for your {chatResults.occasion}
                  </h3>
                  <p className="text-[#666] uppercase tracking-widest text-[9px] font-bold mb-8">Aya's Curated Recommendations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {chatResults.products.map(p => (
                    <div key={p.id} className="space-y-4">
                      <ProductCard product={p} />
                      <Button 
                        onClick={() => addItem(p, 1, p.sizes[0], p.colors[0])}
                        className="w-full bg-[#C9A84C] text-black h-12 rounded-none uppercase tracking-widest font-bold text-[9px]"
                      >
                        Add to Collection
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 flex gap-6 items-start">
                   <div className="p-3 bg-[#C9A84C]/10 rounded-full border border-[#C9A84C]/20">
                      <Info className="w-5 h-5 text-[#C9A84C]" />
                   </div>
                   <div>
                      <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C] mb-2">Stylist Pro Tip</h4>
                      <p className="text-sm text-[#A0A0A0] leading-relaxed italic">"{chatResults.tip}"</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[#2A2A2A] pt-16 text-center">
             <p className="text-[#333] uppercase tracking-widest text-[10px] font-bold mb-8">Other Styling Modes</p>
             <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => toast.info("Coming soon!")} variant="outline" className="h-24 border-[#2A2A2A] text-[#666] uppercase tracking-widest text-[10px] font-bold rounded-none hover:border-[#C9A84C] hover:text-[#C9A84C]">Style Analysis</Button>
                <Button onClick={() => toast.info("Coming soon!")} variant="outline" className="h-24 border-[#2A2A2A] text-[#666] uppercase tracking-widest text-[10px] font-bold rounded-none hover:border-[#C9A84C] hover:text-[#C9A84C]">Outfit Builder</Button>
             </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
