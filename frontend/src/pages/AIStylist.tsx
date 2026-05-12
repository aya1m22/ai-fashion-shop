import { useState, useRef, useCallback, useMemo } from "react";
import {
  Sparkles,
  Upload,
  Loader2,
  Info,
  ImageIcon,
  X,
  Camera,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { catalogToProduct } from "@/lib/catalogAdapter";
import { mockProducts, Product } from "@/lib/mockProducts";
import { askGemini, parseGeminiJson } from "@/lib/gemini";
import { Link } from "wouter";

const OCCASION_KEYWORDS = [
  "interview", "wedding", "party", "beach", "date",
  "gym", "work", "funeral", "graduation", "travel",
  "birthday", "picnic", "dinner",
];

const OCCASION_TIPS: Record<string, string> = {
  interview: "Stick to neutrals, avoid distracting logos, and ensure your fit is tailored. Confidence starts with a polished silhouette.",
  wedding: "Check the dress code carefully. When in doubt, a subtle pattern or a rich solid tone always exudes class.",
  work: "Balance comfort with professionalism. Quality basics paired with one statement piece create the perfect office look.",
  party: "This is your time to shine. Don't be afraid of bold textures, metallics, or unique cuts that spark conversation.",
  date: "Aim for 'effortlessly put together'. A mix of soft fabrics and a structured outer layer works every time.",
  gym: "Focus on performance fabrics that move with you, but don't sacrifice style. Color-coordinated sets are trending.",
};

// CSS color approximations for the swatch display
const COLOR_SWATCH: Record<string, string> = {
  black: "#1a1a1a", white: "#f5f0eb", navy: "#1b2a4a", beige: "#d4b896",
  camel: "#c19a6b", "warm beige": "#d4b896", cream: "#fffdd0",
  terracotta: "#c65d3a", rust: "#b7410e", olive: "#6b7c3f",
  "olive green": "#6b7c3f", burgundy: "#800020", red: "#cc2200",
  pink: "#e075a0", blush: "#e8b4b8", lavender: "#9370db",
  purple: "#6a0dad", "royal blue": "#2b4fa8", blue: "#2060c0",
  teal: "#008080", green: "#228b22", "forest green": "#228b22",
  grey: "#808080", gray: "#808080", charcoal: "#36454f",
  brown: "#7b4f2e", gold: "#c9a84c", silver: "#a8a8a8",
  coral: "#ff6b6b", peach: "#ffd6b3", mustard: "#c9a63c",
  taupe: "#9b8574", sand: "#c2b280", ivory: "#fffff0",
};

function ColorSwatch({ color }: { color: string }) {
  const bg = COLOR_SWATCH[color.toLowerCase()] ?? "#555";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-full border-2 border-[#2A2A2A]"
        style={{ backgroundColor: bg }}
        title={color}
      />
      <span className="text-[9px] uppercase tracking-widest text-[#666] text-center leading-tight max-w-[48px]">
        {color}
      </span>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AIStylist() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  // ── Photo Analysis state ────────────────────────────────────────────────────
  const [gender, setGender] = useState<"men" | "women">("women");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzePhoto = trpc.aiStylist.analyzePhoto.useMutation();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setPreviewUrl(URL.createObjectURL(file));
    setImageDataUrl(dataUrl);
    analyzePhoto.reset();
  }, [analyzePhoto]);

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleAnalyze = useCallback(() => {
    if (!imageDataUrl) {
      toast.error("Please upload a photo first.");
      return;
    }
    analyzePhoto.mutate({ imageUrl: imageDataUrl, gender });
  }, [imageDataUrl, gender, analyzePhoto]);

  const clearPhoto = useCallback(() => {
    setPreviewUrl(null);
    setImageDataUrl(null);
    analyzePhoto.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [analyzePhoto]);

  const recommendations = useMemo(
    () => (analyzePhoto.data?.recommendations ?? []).map((p: any) => catalogToProduct(p)),
    [analyzePhoto.data],
  );

  const analysis = analyzePhoto.data?.analysis;
  // tRPC infers a union return type; cast to access optional fields safely
  const genderMismatch = (analyzePhoto.data as any)?.genderMismatch as boolean | undefined;
  const detectedGender = (analyzePhoto.data as any)?.detectedGender as string | undefined;

  // ── Occasion Advisor state ──────────────────────────────────────────────────
  const [chatInput, setChatInput] = useState("");
  const [chatResults, setChatResults] = useState<{
    products: Product[];
    occasion: string;
    tip: string;
  } | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const { data: allProducts } = trpc.products.list.useQuery({ limit: 200 });
  const allAdapted = useMemo(
    () => (allProducts ?? []).map(catalogToProduct),
    [allProducts],
  );
  const catalogForChat = allAdapted.length > 0 ? allAdapted : mockProducts;

  const handleChatSearch = async () => {
    const input = chatInput.toLowerCase();
    const occasion = OCCASION_KEYWORDS.find((k) => input.includes(k));

    if (!occasion) {
      toast.info("I'm Aya, your stylist. Try mentioning an occasion like 'wedding', 'interview', or 'date'!");
      return;
    }

    setIsChatLoading(true);
    try {
      const prompt = `User needs an outfit for ${occasion}.
From this catalog: ${JSON.stringify(catalogForChat.slice(0, 30))},
return the IDs of the best 3 products for this occasion.
Return ONLY a JSON array of IDs like [1001, 1002, 1003].`;

      const response = await askGemini(prompt);

      if (typeof response === "string" && response.includes("API key missing")) {
        throw new Error("KEY_MISSING");
      }

      const ids = parseGeminiJson(response);
      const products = catalogForChat.filter((p) => ids.includes(p.id));

      if (products.length === 0) throw new Error("NO_MATCHES");

      setChatResults({
        products,
        occasion,
        tip: OCCASION_TIPS[occasion] || "Dress to express your unique essence. Confidence is your best accessory.",
      });
      setChatInput("");
    } catch {
      const fallbackProducts = catalogForChat
        .filter(
          (p) =>
            p.name.toLowerCase().includes(occasion) ||
            p.description.toLowerCase().includes(occasion) ||
            p.subcategory.toLowerCase().includes(occasion),
        )
        .slice(0, 3);

      const finalProducts =
        fallbackProducts.length > 0
          ? fallbackProducts
          : catalogForChat.sort(() => 0.5 - Math.random()).slice(0, 3);

      setChatResults({
        products: finalProducts,
        occasion,
        tip: OCCASION_TIPS[occasion] || "A timeless choice for any occasion. Elegance is the only beauty that never fades.",
      });
      setChatInput("");
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
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C]">
                StyleAI Elite
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              Your Personal AI Stylist
            </h1>
            <p className="text-[#A0A0A0] text-lg max-w-xl mx-auto italic">
              "Hi! I'm Aya, your personal StyleAI stylist 👗 Upload your photo for a colour & skin-tone analysis, or tell me your occasion and I'll find the perfect look for you!"
            </p>
          </div>

          {/* ── SECTION 1: Photo Analysis ───────────────────────────────────── */}
          <section className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <Camera className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="text-2xl font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>
                Photo Style Analysis
              </h2>
            </div>

            {!isAuthenticated && (
              <div className="bg-[#111] border border-[#2A2A2A] p-8 text-center mb-6">
                <AlertCircle className="w-8 h-8 text-[#C9A84C] mx-auto mb-4" />
                <p className="text-[#A0A0A0] mb-4">
                  Sign in to unlock AI photo analysis and get personalised product recommendations.
                </p>
                <Link href="/login">
                  <Button className="bg-[#C9A84C] text-black rounded-none uppercase tracking-widest font-bold text-xs h-11 px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <>
                {/* Gender Selector */}
                <div className="flex gap-4 mb-6">
                  {(["women", "men"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 text-[10px] uppercase tracking-[0.3em] font-bold border transition-all ${
                        gender === g
                          ? "border-[#C9A84C] text-[#C9A84C] bg-[#C9A84C]/5"
                          : "border-[#2A2A2A] text-[#666] hover:border-[#444]"
                      }`}
                    >
                      {g === "women" ? "Women's Analysis" : "Men's Analysis"}
                    </button>
                  ))}
                </div>

                {/* Upload Zone */}
                {!previewUrl ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-none p-16 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#C9A84C] bg-[#C9A84C]/5"
                        : "border-[#2A2A2A] hover:border-[#444] bg-[#111]"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                    <Upload className="w-10 h-10 text-[#333] mx-auto mb-4" />
                    <p className="text-[#666] text-sm mb-2">
                      Drag & drop your photo here, or{" "}
                      <span className="text-[#C9A84C] underline">browse</span>
                    </p>
                    <p className="text-[#444] text-xs uppercase tracking-widest">
                      JPG / PNG / WebP · max 10 MB
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Uploaded photo"
                      className="w-full max-h-[480px] object-cover bg-[#111]"
                    />
                    <button
                      onClick={clearPhoto}
                      className="absolute top-3 right-3 p-2 bg-black/60 text-white hover:bg-black transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Analyse Button */}
                {previewUrl && !analyzePhoto.data && (
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzePhoto.isPending}
                    className="w-full mt-4 bg-[#C9A84C] text-black rounded-none h-14 uppercase tracking-widest font-bold text-xs"
                  >
                    {analyzePhoto.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analysing your photo…
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Analyse My Style
                      </span>
                    )}
                  </Button>
                )}

                {/* Error State */}
                {analyzePhoto.isError && (
                  <div className="mt-6 bg-red-900/20 border border-red-700/40 p-6 flex gap-4 items-start">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-300 text-sm font-bold mb-1">Analysis failed</p>
                      <p className="text-red-400/80 text-sm">
                        {analyzePhoto.error?.message ||
                          "Could not analyse the photo. Please try with a clear, well-lit image."}
                      </p>
                      <Button
                        onClick={() => analyzePhoto.reset()}
                        variant="ghost"
                        className="mt-3 text-red-400 hover:text-red-300 p-0 h-auto text-xs uppercase tracking-widest"
                      >
                        Try again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Invalid photo result */}
                {analyzePhoto.data && !analyzePhoto.data.success && (
                  <div className="mt-6 bg-[#1A1A1A] border border-[#2A2A2A] p-6 flex gap-4 items-start">
                    <ImageIcon className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#F5F0EB] text-sm font-bold mb-1">Photo not suitable</p>
                      <p className="text-[#A0A0A0] text-sm">
                        {(analyzePhoto.data as any)?.error ||
                          "Please upload a clear photo with visible skin tone for accurate analysis."}
                      </p>
                      <Button
                        onClick={clearPhoto}
                        variant="ghost"
                        className="mt-3 text-[#C9A84C] hover:text-[#B0923D] p-0 h-auto text-xs uppercase tracking-widest"
                      >
                        Upload different photo
                      </Button>
                    </div>
                  </div>
                )}

                {/* Success Results */}
                {analyzePhoto.data?.success && (
                  <div className="mt-12 space-y-10 animate-in slide-in-from-top-4 duration-500">

                    {/* Gender mismatch warning */}
                    {genderMismatch && detectedGender && (
                      <div className="bg-amber-900/20 border border-amber-600/40 p-5 flex gap-4 items-start">
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-amber-300 text-sm font-bold mb-1">Gender mismatch detected</p>
                          <p className="text-amber-400/80 text-sm">
                            The photo appears to show a <strong className="text-amber-300">{detectedGender === "men" ? "man" : "woman"}</strong>,
                            but you selected <strong className="text-amber-300">{gender === "men" ? "Men's" : "Women's"}</strong> analysis.
                            Showing {gender === "men" ? "men's" : "women's"} products as requested — switch the selector above if you'd like the other category.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Skin Analysis Card */}
                    {analysis && (
                      <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 space-y-8">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C]">
                          Skin & Colour Analysis
                        </h3>

                        {/* Key attributes grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            ["Skin Tone", analysis.skinTone],
                            ["Undertone", analysis.undertone],
                            ["Season", analysis.seasonalPalette],
                            ["Best Metal", analysis.accessoryMetal === "either" ? "Gold or Silver" : analysis.accessoryMetal === "gold" ? "Gold ✦" : "Silver ✦"],
                          ].filter(([, v]) => v).map(([label, value]) => (
                            <div key={label}>
                              <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#C9A84C] mb-1">{label}</p>
                              <p className="text-sm text-[#F5F0EB] capitalize">{value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Colour palette swatches */}
                        {analysis.bestColors?.length > 0 && (
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#C9A84C] mb-4">
                              Your Colour Palette
                            </p>
                            <div className="flex flex-wrap gap-4">
                              {analysis.bestColors.map((color: string) => (
                                <ColorSwatch key={color} color={color} />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 ? (
                      <>
                        <div className="text-center">
                          <h3 className="text-2xl font-serif italic mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                            Curated for Your Palette
                          </h3>
                          <p className="text-[#666] uppercase tracking-widest text-[9px] font-bold">
                            Products matched to your colour profile
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {recommendations.map((p) => (
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
                      </>
                    ) : (
                      <div className="py-16 text-center">
                        <p className="text-[#666] italic">
                          No products matched your colour profile exactly. Try browsing our full catalog.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

          {/* Divider */}
          <div className="border-t border-[#2A2A2A] mb-20" />

          {/* ── SECTION 2: Occasion Advisor ─────────────────────────────────── */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-[#C9A84C]" />
              <h2 className="text-2xl font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>
                Occasion Advisor
              </h2>
            </div>

            <div className="bg-[#111] border border-[#2A2A2A] p-2 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleChatSearch()}
                placeholder="Ask Aya: 'What should I wear to a summer wedding?' or 'Outfit for an interview'…"
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
                  <p className="text-[#666] uppercase tracking-widest text-[9px] font-bold mb-8">
                    Aya's Curated Recommendations
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {chatResults.products.map((p) => (
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
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C] mb-2">
                      Stylist Pro Tip
                    </h4>
                    <p className="text-sm text-[#A0A0A0] leading-relaxed italic">
                      "{chatResults.tip}"
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
