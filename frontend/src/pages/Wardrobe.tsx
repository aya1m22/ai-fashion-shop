import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Trash2, Plus, Share2, Sparkles, Loader2, Heart, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { useCart } from "@/contexts/CartContext";
import { askGemini } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/lib/mockProducts";

export default function Wardrobe() {
  const { savedItems, looks, createLook, deleteLook, removeItem } = useWardrobe();
  const { addItem } = useCart();
  
  const [selectedForLook, setSelectedForLook] = useState<number[]>([]);
  const [isCreatingLook, setIsCreatingLook] = useState(false);
  const [lookName, setLookName] = useState("");
  const [aiFeedback, setAiFeedback] = useState<Record<string, string>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});

  const toggleSelection = (id: number) => {
    setSelectedForLook(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleCreateLook = () => {
    if (!lookName || selectedForLook.length === 0) return;
    createLook(lookName, selectedForLook);
    setLookName("");
    setSelectedForLook([]);
    setIsCreatingLook(false);
  };

  const getAIFeedback = async (lookId: string, itemIds: number[]) => {
    setLoadingFeedback(prev => ({ ...prev, [lookId]: true }));
    try {
      const items = mockProducts.filter(p => itemIds.includes(p.id));
      const names = items.map(i => i.name).join(", ");
      const prompt = `Give me exactly one short, professional styling advice sentence for this combination of items: ${names}. Maximum 15 words. Sound like a high-end fashion editor.`;
      
      const feedback = await askGemini(prompt);
      setAiFeedback(prev => ({ ...prev, [lookId]: feedback }));
    } catch (e) {
      setAiFeedback(prev => ({ ...prev, [lookId]: "Fabulous combination! These pieces create a truly elevated silhouette. 💫" }));
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [lookId]: false }));
    }
  };

  const shareLook = (lookName: string, itemIds: number[]) => {
    const items = mockProducts.filter(p => itemIds.includes(p.id)).map(i => i.name).join(", ");
    const text = `My StyleAI Look — ${lookName}: ${items}. Shop at StyleAI 🛍️`;
    navigator.clipboard.writeText(text);
    alert("Look description copied to clipboard! ✨");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
            <div>
              <h1 className="text-5xl font-serif font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>My Wardrobe</h1>
              <p className="text-[#666] uppercase tracking-[0.3em] text-[10px] font-bold">Your Curated Collection & Creations</p>
            </div>
            {savedItems.length > 0 && (
              <Button 
                onClick={() => setIsCreatingLook(!isCreatingLook)}
                className={`${isCreatingLook ? 'bg-[#2A2A2A]' : 'bg-[#C9A84C]'} text-black hover:opacity-90 h-12 px-8 rounded-none uppercase tracking-widest text-[10px] font-bold`}
              >
                {isCreatingLook ? "Cancel" : "Create a Look"}
              </Button>
            )}
          </div>

          {savedItems.length === 0 ? (
            <div className="py-32 text-center border border-[#2A2A2A] bg-[#111]">
              <Heart className="w-16 h-16 text-[#2A2A2A] mx-auto mb-6" />
              <p className="text-[#A0A0A0] text-xl mb-8">Your wardrobe is waiting for its first piece.</p>
              <Link href="/women">
                <Button className="bg-[#C9A84C] text-black h-14 px-12 rounded-none uppercase tracking-widest font-bold">Explore Collection</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-16">
              {/* Left Column: Saved Items */}
              <div className="lg:col-span-2">
                {isCreatingLook && (
                  <div className="bg-[#111] border border-[#C9A84C] p-8 mb-12 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-xl font-serif mb-6 italic">Name your creation</h3>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        value={lookName}
                        onChange={(e) => setLookName(e.target.value)}
                        placeholder="e.g. Parisian Sunday, Gallery Opening..."
                        className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all"
                      />
                      <Button 
                        disabled={!lookName || selectedForLook.length === 0}
                        onClick={handleCreateLook}
                        className="bg-[#C9A84C] text-black h-12 px-8 rounded-none uppercase tracking-widest text-[10px] font-bold disabled:opacity-50"
                      >
                        Save Look
                      </Button>
                    </div>
                    {selectedForLook.length === 0 && (
                      <p className="text-[#C9A84C] text-[9px] uppercase tracking-widest mt-4 font-bold">Select items from your wardrobe below</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {savedItems.map(item => (
                    <div key={item.id} className={`group relative bg-[#111] border transition-all ${selectedForLook.includes(item.id) ? 'border-[#C9A84C]' : 'border-[#2A2A2A]'}`}>
                      {isCreatingLook && (
                        <button 
                          onClick={() => toggleSelection(item.id)}
                          className="absolute top-2 left-2 z-10 w-6 h-6 border border-[#C9A84C] flex items-center justify-center bg-[#0D0D0D]"
                        >
                          {selectedForLook.includes(item.id) && <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" />}
                        </button>
                      )}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="absolute top-2 right-2 z-10 p-2 text-[#444] hover:text-red-500 bg-[#0D0D0D]/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link href={`/product/${item.id}`}>
                        <div className="aspect-[3/4] overflow-hidden cursor-pointer">
                          <img src={item.imageUrl} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                        </div>
                      </Link>
                      <div className="p-4">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold truncate">{item.name}</h4>
                        <p className="text-[10px] text-[#C9A84C] mt-1">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Looks */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB] mb-8 border-b border-[#2A2A2A] pb-4">My Saved Looks</h3>
                  <div className="space-y-8">
                    {looks.length === 0 ? (
                      <p className="text-[#444] text-xs italic">Create a look to see it here.</p>
                    ) : (
                      looks.map(look => {
                        const items = mockProducts.filter(p => look.itemIds.includes(p.id));
                        return (
                          <div key={look.id} className="bg-[#111] border border-[#2A2A2A] p-6 space-y-6">
                            <div className="flex justify-between items-center">
                              <h4 className="text-lg font-serif italic text-[#F5F0EB]">{look.name}</h4>
                              <button onClick={() => deleteLook(look.id)} className="text-[#444] hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex -space-x-4 overflow-hidden h-24">
                              {items.map(i => (
                                <img key={i.id} src={i.imageUrl} className="w-20 h-full object-cover border-2 border-[#111]" alt={i.name} />
                              ))}
                            </div>
                            
                            {aiFeedback[look.id] ? (
                              <p className="text-[11px] text-[#A0A0A0] leading-relaxed italic border-l border-[#C9A84C] pl-4">
                                "{aiFeedback[look.id]}"
                              </p>
                            ) : (
                              <button 
                                onClick={() => getAIFeedback(look.id, look.itemIds)}
                                disabled={loadingFeedback[look.id]}
                                className="flex items-center gap-2 text-[9px] uppercase tracking-widest font-bold text-[#C9A84C] hover:text-[#F5F0EB] transition-colors"
                              >
                                {loadingFeedback[look.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                Get AI Feedback
                              </button>
                            )}

                            <div className="flex gap-2">
                              <Button 
                                onClick={() => shareLook(look.name, look.itemIds)}
                                className="flex-1 bg-transparent border border-[#2A2A2A] text-[#666] hover:text-[#C9A84C] hover:border-[#C9A84C] h-10 rounded-none uppercase tracking-widest text-[9px] font-bold"
                              >
                                <Share2 className="w-3 h-3 mr-2" /> Share
                              </Button>
                              <Button 
                                onClick={() => items.forEach(i => addItem(i, 1, i.sizes[0], i.colors[0]))}
                                className="flex-1 bg-[#2A2A2A] text-[#F5F0EB] hover:bg-[#333] h-10 rounded-none uppercase tracking-widest text-[9px] font-bold"
                              >
                                Buy Look
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
