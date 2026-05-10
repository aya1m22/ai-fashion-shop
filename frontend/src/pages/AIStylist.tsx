import { useState, useRef } from "react";
import { Sparkles, Upload, Loader2, ArrowRight, Watch, Circle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

const CLOTHING_COLOR_PALETTE: Record<string, string> = {
  Black: "#1a1a1a", White: "#f5f5f5", Gray: "#9ca3af", Navy: "#1e3a5f",
  Blue: "#3b82f6", Beige: "#d4c5a9", Camel: "#ca8a04", Khaki: "#a3a37a",
  Olive: "#6b7c3c", Brown: "#92400e", Burgundy: "#800020", Red: "#ef4444",
  Charcoal: "#374151", Tan: "#d97706", Cream: "#fffdd0", Ivory: "#fffff0",
  Emerald: "#10b981", Sage: "#8fad88", Champagne: "#f7e7ce", Sand: "#c2b280",
  Pink: "#f472b6", Blush: "#fda4af", Lilac: "#c084fc", Terracotta: "#c1440e",
  Gold: "#d4af37", Silver: "#c0c0c0",
};

const METAL_COLORS = [
  { name: "Gold", hex: "#d4af37", desc: "Warm, classic, suits warm & deep skin tones" },
  { name: "Silver", hex: "#c0c0c0", desc: "Cool, modern, suits cool & neutral skin tones" },
  { name: "Black", hex: "#1a1a1a", desc: "Bold, versatile, suits all skin tones" },
  { name: "White", hex: "#f5f5f5", desc: "Clean, striking, suits all skin tones" },
];

export default function AIStylist() {
  const { isAuthenticated } = useAuth();
  const [gender, setGender] = useState<"men" | "women">("men");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.aiStylist.analyzePhoto.useMutation({
    onError: (err) => toast.error(err.message || "Analysis failed. Please try again."),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }

    setUploading(true);
    try {
      // Convert to base64 data URL for LLM vision
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setPreviewUrl(dataUrl);
        setImageUrl(dataUrl);
        setUploading(false);
      };
      reader.onerror = () => { toast.error("Failed to read image"); setUploading(false); };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to process image");
      setUploading(false);
    }
  };

  const handleAnalyze = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (!imageUrl) { toast.error("Please upload a photo first"); return; }
    analyzeMutation.mutate({ imageUrl, gender });
  };

  const result = analyzeMutation.data;
  const analysis = result?.analysis;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      {/* Header */}
      <div className="bg-stone-900 text-white">
        <div className="container py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">AI-Powered</p>
              <h1 className="font-display text-3xl font-bold">Style Advisor</h1>
            </div>
          </div>
          <p className="text-stone-300 max-w-xl">
            Upload a photo and our AI analyzes your skin tone to recommend the perfect colors for your wardrobe.
            {gender === "men" && " For men, we also recommend watch and ring metal colors."}
          </p>
        </div>
      </div>

      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          {/* Gender Toggle */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
            <p className="text-sm font-semibold text-stone-900 mb-4">I'm shopping for</p>
            <div className="flex gap-3">
              {(["women", "men"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => { setGender(g); analyzeMutation.reset(); }}
                  className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    gender === g
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {g === "women" ? "👗 Women" : "👔 Men"}
                </button>
              ))}
            </div>
            {gender === "men" && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm font-medium mb-1">Men's Color Analysis</p>
                <p className="text-amber-700 text-xs">
                  Upload a photo showing your skin tone. Our AI will recommend clothing colors, watch metal colors, and ring colors that complement your complexion.
                </p>
              </div>
            )}
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-2xl border border-stone-100 p-6 mb-6">
            <p className="text-sm font-semibold text-stone-900 mb-4">Upload Your Photo</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Upload area */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-stone-400 hover:bg-stone-50 transition group"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-stone-400 group-hover:text-stone-600 transition" />
                  )}
                  <div className="text-center">
                    <p className="text-sm font-medium text-stone-700">
                      {uploading ? "Processing..." : "Click to upload photo"}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">JPG, PNG, WEBP · Max 10MB</p>
                    <p className="text-xs text-stone-400">Best results with a clear photo of your face/skin</p>
                  </div>
                </button>
              </div>

              {/* Preview */}
              <div>
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden aspect-square bg-stone-100">
                    <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setPreviewUrl(""); setImageUrl(""); analyzeMutation.reset(); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-stone-900/70 text-white rounded-full flex items-center justify-center hover:bg-stone-900 transition text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl bg-stone-50 border border-stone-100 aspect-square flex items-center justify-center">
                    <p className="text-stone-400 text-sm text-center px-4">Your photo preview will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <div className="mt-6">
              {!isAuthenticated ? (
                <a href={getLoginUrl()} className="flex items-center justify-center gap-2 w-full py-3.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition">
                  Sign In to Analyze
                </a>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={!imageUrl || analyzeMutation.isPending}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {analyzeMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your skin tone...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Analyze & Get Recommendations</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          {result && !result.success && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
              <p className="text-red-700 font-medium mb-1">Analysis Failed</p>
              <p className="text-red-600 text-sm">{result.error}</p>
            </div>
          )}

          {/* Results */}
          {result?.success && analysis && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Skin Tone Card */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-stone-900">Analysis Results</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-stone-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Skin Tone</p>
                    <p className="text-lg font-bold text-stone-900 capitalize">{analysis.skinTone}</p>
                  </div>
                  {analysis.bodyShape && (
                    <div className="bg-stone-50 rounded-xl p-4">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">Body Shape</p>
                      <p className="text-lg font-bold text-stone-900 capitalize">{analysis.bodyShape}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Clothing Colors */}
              <div className="bg-white rounded-2xl border border-stone-100 p-6">
                <h2 className="font-semibold text-stone-900 mb-4">
                  {gender === "men" ? "Recommended Clothing Colors" : "Recommended Colors"}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {(analysis.clothingColors || analysis.colorRecommendations || []).map((color: string) => {
                    const hex = CLOTHING_COLOR_PALETTE[color] || "#d1d5db";
                    return (
                      <div key={color} className="flex flex-col items-center gap-1.5">
                        <div
                          className="w-10 h-10 rounded-full border-2 border-stone-200 shadow-sm"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-medium text-stone-700">{color}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Men's Watch & Ring Colors */}
              {gender === "men" && analysis.watchColors && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Watch Colors */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Watch className="w-4 h-4 text-stone-600" />
                      <h2 className="font-semibold text-stone-900">Watch Metal Colors</h2>
                    </div>
                    <div className="space-y-3">
                      {(analysis.watchColors || []).map((color: string) => {
                        const meta = METAL_COLORS.find((m) => m.name.toLowerCase() === color.toLowerCase());
                        return (
                          <div key={color} className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border border-stone-200 shadow-sm shrink-0"
                              style={{ backgroundColor: meta?.hex || "#d1d5db" }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{color}</p>
                              {meta && <p className="text-xs text-stone-500">{meta.desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ring Colors */}
                  <div className="bg-white rounded-2xl border border-stone-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Circle className="w-4 h-4 text-stone-600" />
                      <h2 className="font-semibold text-stone-900">Ring Metal Colors</h2>
                    </div>
                    <div className="space-y-3">
                      {(analysis.ringColors || []).map((color: string) => {
                        const meta = METAL_COLORS.find((m) => m.name.toLowerCase() === color.toLowerCase());
                        return (
                          <div key={color} className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full border border-stone-200 shadow-sm shrink-0"
                              style={{ backgroundColor: meta?.hex || "#d1d5db" }}
                            />
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{color}</p>
                              {meta && <p className="text-xs text-stone-500">{meta.desc}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Product Recommendations */}
              {(result.recommendations || []).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-bold text-stone-900">
                      Recommended for You
                    </h2>
                    <span className="text-xs text-stone-500">Based on your skin tone</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(result.recommendations as any[]).map((product: any, idx: number) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        animationDelay={idx * 60}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* How It Works */}
          {!result && (
            <div className="bg-white rounded-2xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-900 mb-4">How It Works</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { step: "1", title: "Upload Photo", desc: "Take or upload a clear photo showing your skin tone" },
                  { step: "2", title: "AI Analysis", desc: "Our AI detects your skin tone and determines the best color palette" },
                  { step: "3", title: "Get Recommendations", desc: gender === "men" ? "Receive clothing, watch & ring color recommendations" : "Receive personalized clothing color recommendations" },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-stone-900 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm mb-1">{item.title}</p>
                      <p className="text-stone-500 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
