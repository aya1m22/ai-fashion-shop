import { useState, useRef } from "react";
import { Sparkles, Upload, Loader2, ArrowRight, Watch, Circle, Layout, Briefcase, PartyPopper, Coffee, Palette, DollarSign, Plus, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const { isAuthenticated } = useAuth();
  const [activeMode, setActiveMode] = useState<"analysis" | "outfit">("analysis");
  const [gender, setGender] = useState<"men" | "women">("women");
  
  // Analysis Mode State
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Outfit Mode State
  const [outfitStep, setOutfitStep] = useState(1);
  const [outfitData, setOutfitData] = useState({
    occasion: "",
    palette: "",
    budget: ""
  });

  const analyzeMutation = trpc.aiStylist.analyzePhoto.useMutation({
    onError: (err) => toast.error(err.message || "Analysis failed."),
  });

  const outfitMutation = trpc.aiStylist.outfitBuilder.useMutation({
    onError: (err) => toast.error(err.message || "Outfit generation failed."),
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
    if (!isAuthenticated) { window.location.href = "/login"; return; }
    analyzeMutation.mutate({ imageUrl, gender });
  };

  const handleGenerateOutfit = () => {
    outfitMutation.mutate({
      gender,
      ...outfitData
    });
  };

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => toast.success("Added to cart!"),
  });

  const handleAddAllToCart = () => {
    const items = outfitMutation.data?.items || [];
    items.forEach(item => {
      addToCartMutation.mutate({
        productId: item.id,
        quantity: 1,
        size: "M", // Default
        color: item.colors?.[0] || "Default"
      });
    });
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
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C]">Experience the Future</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              Your Personal AI Stylist
            </h1>
            <p className="text-[#A0A0A0] text-lg max-w-xl mx-auto">
              Choose your mode of transformation. Let our Claude-powered AI curate your perfect look.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-[#111] p-1 border border-[#2A2A2A] mb-12">
            <button
              onClick={() => setActiveMode("analysis")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-bold transition-all ${
                activeMode === "analysis" ? "bg-[#C9A84C] text-black" : "text-[#A0A0A0] hover:text-[#F5F0EB]"
              }`}
            >
              <Layout className="w-4 h-4" />
              Style Analysis
            </button>
            <button
              onClick={() => setActiveMode("outfit")}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs uppercase tracking-widest font-bold transition-all ${
                activeMode === "outfit" ? "bg-[#C9A84C] text-black" : "text-[#A0A0A0] hover:text-[#F5F0EB]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              💡 Outfit Builder
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
            /* Analysis Mode */
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
                      Our advanced AI will analyze your skin's undertones and features to determine your seasonal color palette and suggest items from our collection that will elevate your presence.
                    </p>
                    <Button 
                      onClick={handleAnalyze}
                      disabled={!imageUrl || analyzeMutation.isPending}
                      className="bg-[#C9A84C] text-black rounded-none h-14 uppercase tracking-widest font-bold text-xs"
                    >
                      {analyzeMutation.isPending ? <Loader2 className="animate-spin" /> : "Start Analysis"}
                    </Button>
                  </div>
                </div>
              </div>

              {analyzeMutation.data?.success && (
                <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-[#111] border border-[#2A2A2A] p-8">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-6">Your Profile</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
                          <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Skin Tone</span>
                          <span className="text-lg font-serif italic capitalize">{analyzeMutation.data.analysis.skinTone}</span>
                        </div>
                        <div className="bg-[#1A1A1A] p-4 border border-[#2A2A2A]">
                          <span className="text-[9px] uppercase tracking-widest text-[#666] block mb-1">Palette</span>
                          <span className="text-lg font-serif italic capitalize">{analyzeMutation.data.analysis.stylePreference || "Classic"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#111] border border-[#2A2A2A] p-8">
                      <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-6">Recommended Colors</h4>
                      <div className="flex flex-wrap gap-4">
                        {(analyzeMutation.data.analysis.colorRecommendations || analyzeMutation.data.analysis.clothingColors || []).map((color: string) => (
                          <div key={color} className="group flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full border border-white/10" style={{ backgroundColor: CLOTHING_COLOR_PALETTE[color] || "#333" }} />
                            <span className="text-[9px] uppercase tracking-widest text-[#666] group-hover:text-[#A0A0A0] transition-colors">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-serif mb-8 text-center" style={{ fontFamily: '"Playfair Display", serif' }}>Curated Selection</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                      {analyzeMutation.data.recommendations.map((p: any) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Outfit Builder Mode */
            <div className="bg-[#111] border border-[#2A2A2A] p-12 min-h-[500px] flex flex-col justify-between animate-in fade-in duration-500">
              {!outfitMutation.data ? (
                <div className="space-y-12">
                  <div className="flex justify-between items-center mb-8">
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

                  <div className="min-h-[200px] flex items-center justify-center">
                    {outfitStep === 1 && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {[
                          { id: "Work", icon: <Briefcase /> },
                          { id: "Party", icon: <PartyPopper /> },
                          { id: "Casual", icon: <Coffee /> },
                          { id: "Formal", icon: <Sparkles /> }
                        ].map((o) => (
                          <button
                            key={o.id}
                            onClick={() => { setOutfitData({...outfitData, occasion: o.id}); setOutfitStep(2); }}
                            className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 hover:border-[#C9A84C] transition-all flex flex-col items-center gap-3"
                          >
                            <span className="text-[#666]">{o.icon}</span>
                            <span className="text-[10px] uppercase tracking-widest font-bold">{o.id}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {outfitStep === 2 && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {[
                          { id: "Monochrome", icon: <div className="w-4 h-4 bg-white/20 rounded-full" /> },
                          { id: "Earth Tones", icon: <div className="w-4 h-4 bg-amber-900/50 rounded-full" /> },
                          { id: "Vibrant", icon: <div className="w-4 h-4 bg-red-500/50 rounded-full" /> },
                          { id: "Pastel", icon: <div className="w-4 h-4 bg-pink-200/50 rounded-full" /> }
                        ].map((o) => (
                          <button
                            key={o.id}
                            onClick={() => { setOutfitData({...outfitData, palette: o.id}); setOutfitStep(3); }}
                            className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 hover:border-[#C9A84C] transition-all flex flex-col items-center gap-3"
                          >
                            {o.icon}
                            <span className="text-[10px] uppercase tracking-widest font-bold">{o.id}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {outfitStep === 3 && (
                      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {[
                          { id: "Affordable", icon: "$", desc: "< $200" },
                          { id: "Mid-Range", icon: "$$", desc: "$200 - $500" },
                          { id: "Luxury", icon: "$$$", desc: "$500 - $1500" },
                          { id: "Couture", icon: "$$$$", desc: "Unlimited" }
                        ].map((o) => (
                          <button
                            key={o.id}
                            onClick={() => { setOutfitData({...outfitData, budget: o.id}); handleGenerateOutfit(); }}
                            className="bg-[#1A1A1A] border border-[#2A2A2A] p-6 hover:border-[#C9A84C] transition-all flex flex-col items-center gap-3"
                          >
                            <span className="text-[#C9A84C] font-bold">{o.icon}</span>
                            <div className="text-center">
                              <span className="text-[10px] uppercase tracking-widest font-bold block">{o.id}</span>
                              <span className="text-[8px] text-[#666]">{o.desc}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {outfitStep > 1 && (
                    <button onClick={() => setOutfitStep(outfitStep - 1)} className="text-[10px] uppercase tracking-widest text-[#666] hover:text-[#A0A0A0]">
                      Go Back
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-12 animate-in zoom-in-95 duration-500">
                  <div className="text-center">
                    <h4 className="text-[10px] uppercase tracking-widest text-[#C9A84C] font-bold mb-4">Your Curated Look</h4>
                    <p className="text-lg font-serif italic text-[#A0A0A0] max-w-lg mx-auto">
                      "{outfitMutation.data.explanation}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {outfitMutation.data.items.map((item: any) => (
                      <div key={item.id} className="bg-[#1A1A1A] border border-[#2A2A2A] p-4 group relative">
                        <img src={item.imageUrl} className="w-full aspect-[3/4] object-cover mb-4 opacity-80 group-hover:opacity-100 transition-opacity" alt={item.name} />
                        <h5 className="text-[10px] uppercase tracking-widest font-bold truncate">{item.name}</h5>
                        <p className="text-[10px] text-[#C9A84C] mt-1">${item.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={() => { setOutfitMutation(undefined as any); setOutfitStep(1); }}
                      variant="outline"
                      className="flex-1 border-[#333] text-[#A0A0A0] rounded-none h-14 uppercase tracking-widest font-bold text-xs"
                    >
                      Start Over
                    </Button>
                    <Button 
                      onClick={handleAddAllToCart}
                      disabled={addToCartMutation.isPending}
                      className="flex-[2] bg-[#C9A84C] text-black rounded-none h-14 uppercase tracking-widest font-bold text-xs shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                    >
                      {addToCartMutation.isPending ? <Loader2 className="animate-spin" /> : "Add All to Cart"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
