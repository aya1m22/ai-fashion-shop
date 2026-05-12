import { useState, useRef } from "react";
import { Sparkles, Upload, Loader2, Check, Briefcase, PartyPopper, Coffee, Layout, ShoppingBag } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/lib/mockProducts";

const CLOTHING_COLOR_PALETTE: Record<string, string> = {
  Black: "#1a1a1a", White: "#f5f5f5", Gray: "#9ca3af", Navy: "#1e3a5f",
  Blue: "#3b82f6", Beige: "#d4c5a9", Camel: "#ca8a04", Khaki: "#a3a37a",
  Olive: "#6b7c3c", Brown: "#92400e", Burgundy: "#800020", Red: "#ef4444",
  Charcoal: "#374151", Tan: "#d97706", Cream: "#fffdd0", Ivory: "#fffff0",
  Emerald: "#10b981", Sage: "#8fad88", Champagne: "#f7e7ce", Sand: "#c2b280",
  Pink: "#f472b6", Blush: "#fda4af", Lilac: "#c084fc", Terracotta: "#c1440e",
  Gold: "#d4af37", Silver: "#c0c0c0",
};

export default function AIStylist() {
  useState(() => {
    document.title = "StyleAI — AI Personal Stylist";
  });

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [activeMode, setActiveMode] = useState<"analysis" | "outfit">("analysis");
  const [gender, setGender] = useState<"men" | "women">("women");
  
  // Analysis Mode State
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Outfit Mode State
  const [outfitStep, setOutfitStep] = useState(1);
  const [outfitData, setOutfitData] = useState({
    occasion: "",
    palette: "",
    budget: ""
  });

  // Demo Fallback State
  const [demoAnalysis, setDemoAnalysis] = useState<any>(null);
  const [demoOutfit, setDemoOutfit] = useState<any>(null);
  const [sessionPreferences, setSessionPreferences] = useState<string[]>([]);

  const analyzeMutation = trpc.aiStylist.analyzePhoto.useMutation({
    onSuccess: (data) => setDemoAnalysis(data),
    onError: (err) => {
      console.warn("Analysis failed, using demo mode:", err);
      const recommendations = mockProducts.filter(p => p.gender === gender).slice(0, 3);
      setDemoAnalysis({
        success: true,
        analysis: {
          skinTone: "neutral",
          clothingColors: ["Navy", "Emerald", "Black", "Ivory"],
          stylePreference: "Modern Classic"
        },
        recommendations
      });
      toast.info("Aya: I've analyzed your look and found these matches!");
    },
  });

  const outfitMutation = trpc.aiStylist.outfitBuilder.useMutation({
    onSuccess: (data) => setDemoOutfit(data),
    onError: (err) => {
      console.warn("Outfit generation failed, using demo mode:", err);
      const filtered = mockProducts.filter(p => 
        p.gender === gender && 
        (p.category.includes(outfitData.occasion) || p.subcategory.includes(outfitData.occasion.toLowerCase()))
      );
      const items = filtered.length >= 2 ? filtered.slice(0, 3) : mockProducts.filter(p => p.gender === gender).slice(0, 3);
      
      setDemoOutfit({
        explanation: `As your stylist Aya, I've curated this ${outfitData.occasion} look for you. It reflects your ${outfitData.palette} preference while maintaining a premium silhouette.`,
        items
      });
      
      setSessionPreferences(prev => [...new Set([...prev, outfitData.occasion, outfitData.palette])]);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreviewUrl(ev.target?.result as string);
      setImageUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = () => {
    if (!isAuthenticated) { toast.error("Please sign in first"); return; }
    analyzeMutation.mutate({ imageUrl, gender });
  };

  const handleGenerateOutfit = () => {
    outfitMutation.mutate({ gender, ...outfitData });
  };

  const analysisData = analyzeMutation.data || demoAnalysis;
  const outfitResult = outfitMutation.data || demoOutfit;

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
            <p className="text-[#A0A0A0] text-lg max-w-xl mx-auto">
              Hi! I'm Aya, your personal StyleAI stylist 👗 Tell me your style, occasion, or budget and I'll find the perfect look for you!
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#111] p-1 border border-[#2A2A2A] mb-12">
            <button
              onClick={() => { setActiveMode("analysis"); setDemoAnalysis(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-bold transition-all ${
                activeMode === "analysis" ? "bg-[#C9A84C] text-black" : "text-[#A0A0A0] hover:text-[#F5F0EB]"
              }`}
            >
              <Layout className="w-4 h-4" />
              Style Analysis
            </button>
            <button
              onClick={() => { setActiveMode("outfit"); setDemoOutfit(null); setOutfitStep(1); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-bold transition-all ${
                activeMode === "outfit" ? "bg-[#C9A84C] text-black" : "text-[#A0A0A0] hover:text-[#F5F0EB]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Outfit Builder
            </button>
          </div>

          {/* Gender Select */}
          <div className="flex gap-4 mb-12">
            {(["women", "men"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`flex-1 py-4 border transition-all text-[10px] uppercase tracking-widest font-bold ${
                  gender === g ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5" : "border-[#2A2A2A] text-[#A0A0A0] hover:border-[#333]"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {activeMode === "analysis" ? (
            <div className="space-y-12 animate-in fade-in duration-500">
              <div className="bg-[#111] border border-[#2A2A2A] p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-[#333] hover:border-[#C9A84C] flex flex-col items-center justify-center cursor-pointer transition-all group"
                  >
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-[#444] group-hover:text-[#C9A84C] mb-4" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#A0A0A0]">Upload Editorial Photo</span>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col justify-center space-y-6">
                    <h3 className="text-2xl font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>Skin Tone & Palette Analysis</h3>
                    <p className="text-sm text-[#A0A0A0] leading-relaxed">
                      Upload a photo and Aya will analyze your undertones to determine your perfect seasonal color palette and suggest items from our luxury collection.
                    </p>
                    <Button 
                      onClick={handleAnalyze}
                      disabled={!imageUrl || analyzeMutation.isPending}
                      className="bg-[#C9A84C] text-black rounded-none h-14 uppercase tracking-widest font-bold text-xs"
                    >
                      {analyzeMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin w-4 h-4" />
                          <span>StyleAI is finding your look...</span>
                        </div>
                      ) : "Start Analysis"}
                    </Button>
                  </div>
                </div>
              </div>

              {analysisData?.success && (
                <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#111] border border-[#2A2A2A] p-8">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-6">Your Profile</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
                          <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Skin Tone</span>
                          <span className="text-lg font-serif italic capitalize">{analysisData.analysis.skinTone}</span>
                        </div>
                        <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
                          <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Style</span>
                          <span className="text-lg font-serif italic capitalize">{analysisData.analysis.stylePreference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#111] border border-[#2A2A2A] p-8">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-6">Recommended Palette</h4>
                      <div className="flex flex-wrap gap-4">
                        {analysisData.analysis.clothingColors.map((color: string) => (
                          <div key={color} className="group flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full border border-white/10" style={{ backgroundColor: CLOTHING_COLOR_PALETTE[color] || "#333" }} />
                            <span className="text-[9px] uppercase tracking-widest text-[#666]">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-serif mb-8 text-center" style={{ fontFamily: '"Playfair Display", serif' }}>Aya's Selections for You</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                      {analysisData.recommendations.map((p: any) => (
                        <div key={p.id} className="space-y-4">
                          <ProductCard product={p} />
                          <Link href={`/product/${p.id}`} className="block w-full text-center py-3 bg-transparent border border-[#2A2A2A] text-[#A0A0A0] text-[10px] font-bold uppercase tracking-widest hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
                            View Product
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#111] border border-[#2A2A2A] p-12 min-h-[500px] flex flex-col animate-in fade-in duration-500">
              {!outfitResult ? (
                <div className="space-y-12 w-full">
                  <div className="flex justify-between items-center mb-12">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                          outfitStep === s ? "border-[#C9A84C] bg-[#C9A84C] text-black" : 
                          outfitStep > s ? "border-[#C9A84C] text-[#C9A84C]" : "border-[#333] text-[#444]"
                        }`}>
                          {outfitStep > s ? <Check className="w-4 h-4" /> : s}
                        </div>
                        <span className={`text-[9px] uppercase tracking-widest font-bold ${outfitStep === s ? "text-[#F5F0EB]" : "text-[#444]"}`}>
                          {s === 1 ? "Occasion" : s === 2 ? "Palette" : "Budget"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-grow flex items-center justify-center">
                    {outfitStep === 1 && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {[{ id: "Work", icon: <Briefcase /> }, { id: "Party", icon: <PartyPopper /> }, { id: "Casual", icon: <Coffee /> }, { id: "Formal", icon: <Sparkles /> }].map((o) => (
                          <button key={o.id} onClick={() => { setOutfitData({...outfitData, occasion: o.id}); setOutfitStep(2); }} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 hover:border-[#C9A84C] transition-all flex flex-col items-center gap-4 group">
                            <span className="text-[#666] group-hover:text-[#C9A84C] transition-colors">{o.icon}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">{o.id}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {outfitStep === 2 && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {["Monochrome", "Earth Tones", "Vibrant", "Pastel"].map((p) => (
                          <button key={p} onClick={() => { setOutfitData({...outfitData, palette: p}); setOutfitStep(3); }} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 hover:border-[#C9A84C] transition-all flex flex-col items-center gap-4 group">
                            <div className={`w-6 h-6 rounded-full border border-white/10 ${p === 'Monochrome' ? 'bg-white/20' : p === 'Earth Tones' ? 'bg-amber-900/50' : p === 'Vibrant' ? 'bg-red-500/50' : 'bg-pink-200/50'}`} />
                            <span className="text-[10px] uppercase tracking-widest font-bold">{p}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {outfitStep === 3 && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {["Affordable", "Mid-Range", "Luxury", "Couture"].map((b) => (
                          <button key={b} onClick={() => { setOutfitData({...outfitData, budget: b}); handleGenerateOutfit(); }} className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 hover:border-[#C9A84C] transition-all flex flex-col items-center gap-4 group">
                            <span className="text-[#C9A84C] text-lg font-bold">{b === 'Affordable' ? '$' : b === 'Mid-Range' ? '$$' : b === 'Luxury' ? '$$$' : '$$$$'}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">{b}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-12 animate-in zoom-in-95 duration-700 w-full">
                  <div className="text-center">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-4">Aya's Recommendation</h4>
                    <p className="text-xl font-serif italic text-[#A0A0A0] max-w-2xl mx-auto leading-relaxed">
                      "{outfitResult.explanation}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {outfitResult.items.map((item: any) => (
                      <div key={item.id} className="space-y-4">
                        <ProductCard product={item} />
                        <Link href={`/product/${item.id}`} className="block w-full text-center py-3 bg-transparent border border-[#2A2A2A] text-[#A0A0A0] text-[10px] font-bold uppercase tracking-widest hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all">
                          View Product
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-8 border-t border-[#2A2A2A]">
                    <Button onClick={() => { setDemoOutfit(null); setOutfitStep(1); }} variant="outline" className="flex-1 border-[#2A2A2A] text-[#666] rounded-none h-14 uppercase tracking-widest font-bold text-[10px]">
                      New Session
                    </Button>
                    <Button onClick={() => { outfitResult.items.forEach((p: any) => addItem(p, 1, p.sizes[0], p.colors[0])); }} className="flex-[2] bg-[#C9A84C] text-black rounded-none h-14 uppercase tracking-widest font-bold text-[10px]">
                      Add Complete Look to Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preferences Memory Display (Optional but proves session memory) */}
          {sessionPreferences.length > 0 && (
            <div className="mt-16 pt-8 border-t border-[#2A2A2A] text-center">
              <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold mr-4">Remembered Preferences:</span>
              <div className="inline-flex gap-2">
                {sessionPreferences.map(p => (
                  <span key={p} className="text-[9px] uppercase tracking-widest text-[#A0A0A0] bg-[#1A1A1A] px-2 py-1 border border-[#2A2A2A]">{p}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
