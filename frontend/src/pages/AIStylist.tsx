import { useState, useRef, useCallback, useMemo, useEffect } from "react";
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
  Send,
  MessageCircle,
  RotateCcw,
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

type ColorEntry = { name: string; hex: string } | string;

function ColorSwatch({ color }: { color: ColorEntry }) {
  const name = typeof color === "string" ? color : color.name;
  const hex = typeof color === "string" ? "#555" : (color.hex || "#555");
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-10 h-10 rounded-full border-2 border-[#2A2A2A]"
        style={{ backgroundColor: hex }}
        title={`${name} ${hex}`}
      />
      <span className="text-[9px] uppercase tracking-widest text-[#666] text-center leading-tight max-w-[48px]">
        {name}
      </span>
    </div>
  );
}

function resizeImageToDataUrl(file: File, maxPx = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
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
    const dataUrl = await resizeImageToDataUrl(file, 800);
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

  // ── Occasion Advisor chat state ─────────────────────────────────────────────
  type ChatGender = "women" | "men";
  type ChatMsg =
    | { role: "assistant"; text: string; products?: Product[] }
    | { role: "user"; text: string };

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      text: "Hi! I'm Aya, your personal stylist 👗 Are you shopping for women's or men's fashion today?",
    },
  ]);
  const [chatGender, setChatGender] = useState<ChatGender | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: allProducts } = trpc.products.list.useQuery({ limit: 200 });
  const allAdapted = useMemo(
    () => (allProducts ?? []).map(catalogToProduct),
    [allProducts],
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const appendMsg = (msg: ChatMsg) =>
    setChatMessages(prev => [...prev, msg]);

  const handleGenderSelect = (g: ChatGender) => {
    setChatGender(g);
    appendMsg({ role: "user", text: g === "women" ? "Women's fashion" : "Men's fashion" });
    setTimeout(() => {
      appendMsg({
        role: "assistant",
        text: `Great! What's the occasion? Tell me where you're going — a wedding, date night, job interview, beach trip, party... or anything else!`,
      });
    }, 300);
  };

  const handleChatSend = async () => {
    const text = chatInput.trim();
    if (!text || isChatLoading) return;
    setChatInput("");
    appendMsg({ role: "user", text });
    setIsChatLoading(true);

    const catalog = allAdapted.length > 0
      ? allAdapted.filter(p => !chatGender || p.gender === chatGender)
      : mockProducts.filter(p => !chatGender || p.gender === chatGender);

    const sample = catalog.slice(0, 50);

    try {
      const historyCtx = chatMessages
        .slice(-6)
        .map(m => `${m.role === "assistant" ? "Aya" : "User"}: ${m.text}`)
        .join("\n");

      const prompt = `You are Aya, a luxury personal fashion stylist. You are helping a customer find an outfit.
Gender preference: ${chatGender ?? "any"}.
Conversation so far:
${historyCtx}
User just said: "${text}"

Available catalog (use ONLY these IDs):
${JSON.stringify(sample.map(p => ({ id: p.id, name: p.name, subcategory: p.subcategory, price: p.price, color: p.color })))}

Reply with a warm, expert 1-2 sentence styling tip, then recommend 3 products from the catalog.
Return ONLY valid JSON with:
{
  "reply": "your conversational message",
  "productIds": [id1, id2, id3],
  "tip": "one expert pro-tip for this occasion"
}`;

      const raw = await askGemini(prompt);

      if (typeof raw === "string" && (raw.includes("API key missing") || raw.includes("taking a short break"))) {
        throw new Error("AI_UNAVAILABLE");
      }

      const parsed = parseGeminiJson(raw);
      const products = catalog.filter(p => (parsed.productIds as number[]).includes(p.id));
      const finalProducts = products.length > 0 ? products : catalog.slice(0, 3);

      appendMsg({
        role: "assistant",
        text: parsed.reply || "Here are my top picks for you!",
        products: finalProducts,
      });
    } catch {
      const occasion = OCCASION_KEYWORDS.find(k => text.toLowerCase().includes(k));
      const fallback = occasion
        ? catalog.filter(p =>
            p.name.toLowerCase().includes(occasion) ||
            p.description.toLowerCase().includes(occasion)
          ).slice(0, 3)
        : catalog.slice(0, 3);
      const finalFallback = fallback.length > 0 ? fallback : catalog.slice(0, 3);
      appendMsg({
        role: "assistant",
        text: `Here's what I'd recommend for that occasion — these are some of my favourite picks from our collection!`,
        products: finalFallback,
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const resetChat = () => {
    setChatMessages([{
      role: "assistant",
      text: "Hi! I'm Aya, your personal stylist 👗 Are you shopping for women's or men's fashion today?",
    }]);
    setChatGender(null);
    setChatInput("");
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
                              {analysis.bestColors.map((color: any) => (
                                <ColorSwatch key={typeof color === "string" ? color : color.name} color={color} />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Style tip */}
                        {(analysis as any).tip && (
                          <div className="border-t border-[#2A2A2A] pt-6 flex gap-3 items-start">
                            <Info className="w-4 h-4 text-[#C9A84C] shrink-0 mt-0.5" />
                            <p className="text-sm text-[#A0A0A0] italic">"{(analysis as any).tip}"</p>
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

          {/* ── SECTION 2: Occasion Advisor Chat ────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-[#C9A84C]" />
                <h2 className="text-2xl font-serif" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Chat with Aya
                </h2>
              </div>
              <button
                onClick={resetChat}
                className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#444] hover:text-[#C9A84C] font-bold transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> New chat
              </button>
            </div>

            {/* Chat messages */}
            <div className="bg-[#0D0D0D] border border-[#2A2A2A] flex flex-col" style={{ minHeight: "420px", maxHeight: "600px", overflowY: "auto" }}>
              <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] ${msg.role === "user" ? "order-2" : ""}`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-[#C9A84C] flex items-center justify-center text-black text-[9px] font-bold">A</div>
                          <span className="text-[9px] uppercase tracking-widest text-[#C9A84C] font-bold">Aya</span>
                        </div>
                      )}
                      <div className={`px-5 py-3 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#C9A84C] text-black font-medium"
                          : "bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F0EB]"
                      }`}>
                        {msg.text}
                      </div>

                      {/* Gender quick-reply */}
                      {i === 0 && !chatGender && (
                        <div className="flex gap-3 mt-3">
                          {(["women", "men"] as const).map(g => (
                            <button
                              key={g}
                              onClick={() => handleGenderSelect(g)}
                              className="flex-1 py-2.5 border border-[#2A2A2A] text-[#A0A0A0] uppercase tracking-[0.2em] text-[9px] font-bold hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
                            >
                              {g === "women" ? "Women's" : "Men's"}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Product recommendations inline */}
                      {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {msg.products.map(p => (
                            <div key={p.id} className="space-y-2">
                              <ProductCard product={p} />
                              <Button
                                onClick={() => addItem(p, 1, p.sizes[0], p.colors[0])}
                                className="w-full bg-[#C9A84C] text-black h-10 rounded-none uppercase tracking-widest font-bold text-[9px]"
                              >
                                Add to Cart
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-5 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#C9A84C]" />
                      <span className="text-[#666] text-sm italic">Aya is thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input bar */}
              {chatGender && (
                <div className="border-t border-[#2A2A2A] p-3 flex gap-2 bg-[#111]">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleChatSend()}
                    placeholder="Tell Aya your occasion or ask a follow-up…"
                    className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:outline-none placeholder:text-[#333] text-[#F5F0EB]"
                    disabled={isChatLoading}
                  />
                  <Button
                    onClick={handleChatSend}
                    disabled={isChatLoading || !chatInput.trim()}
                    className="bg-[#C9A84C] text-black rounded-none h-12 w-12 p-0 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
