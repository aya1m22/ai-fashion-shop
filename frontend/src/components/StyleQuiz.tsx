import React, { useState, useEffect } from "react";
import { X, ChevronRight, Loader2, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { askGemini, parseGeminiJson } from "@/lib/gemini";
import { mockProducts, Product } from "@/lib/mockProducts";
import ProductCard from "@/components/ProductCard";

interface StyleQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    question: "What's your style vibe?",
    key: "vibe",
    options: ["Casual", "Chic", "Streetwear", "Elegant", "Sporty"]
  },
  {
    question: "What's your budget per item?",
    key: "budget",
    options: ["Under $50", "$50–$100", "$100–$200", "No limit"]
  },
  {
    question: "What do you shop for most?",
    key: "category",
    options: ["Tops", "Dresses", "Jackets", "Pants", "All of it"]
  },
  {
    question: "What's your favorite color family?",
    key: "colors",
    options: ["Neutrals (black, white, beige)", "Bold colors", "Pastels", "Monochrome"]
  },
  {
    question: "What occasions do you dress for?",
    key: "occasion",
    options: ["Daily casual", "Work", "Going out", "Special events"]
  }
];

export default function StyleQuiz({ isOpen, onClose }: StyleQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAnswer = (option: string) => {
    const newAnswers = { ...answers, [steps[currentStep].key]: option };
    setAnswers(newAnswers);
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      getRecommendations(newAnswers);
    }
  };

  const getRecommendations = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    try {
      localStorage.setItem("styleQuizAnswers", JSON.stringify(finalAnswers));
      
      const prompt = `The user's style is ${finalAnswers.vibe}, budget is ${finalAnswers.budget}, 
      they shop for ${finalAnswers.category}, like ${finalAnswers.colors}, and dress for ${finalAnswers.occasion}.
      From this catalog: ${JSON.stringify(mockProducts)}, return ONLY the IDs of the 
      best 6 matching products. Return a JSON array of IDs only.`;
      
      const response = await askGemini(prompt);
      
      // Handle the case where askGemini returns the "API key missing" string
      if (typeof response === "string" && response.includes("API key missing")) {
        setError(response);
        setIsLoading(false);
        return;
      }

      const ids = parseGeminiJson(response);
      
      const matchedProducts = mockProducts.filter(p => ids.includes(p.id));
      setResults(matchedProducts);
      setCurrentStep(steps.length);
    } catch (e: any) {
      setError("Oops! StyleAI is having a moment — please try again 💫");
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setResults(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0D0D0D] flex flex-col animate-in fade-in slide-in-from-bottom duration-500">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#1A1A1A]">
        <div 
          className="h-full bg-[#C9A84C] transition-all duration-500" 
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>

      <div className="container mx-auto max-w-4xl flex-1 flex flex-col pt-24 px-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-6 p-2 text-[#666] hover:text-[#C9A84C] transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {currentStep < steps.length ? (
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            <span className="text-[#C9A84C] text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              Step {currentStep + 1} of {steps.length}
            </span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold mb-12 text-[#F5F0EB]" style={{ fontFamily: '"Playfair Display", serif' }}>
              {steps[currentStep].question}
            </h2>
            <div className="grid gap-4">
              {steps[currentStep].options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  className="group flex items-center justify-between p-6 border border-[#2A2A2A] hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all text-left"
                >
                  <span className="text-xl md:text-2xl font-light text-[#A0A0A0] group-hover:text-[#F5F0EB]">
                    {option}
                  </span>
                  <ChevronRight className="w-6 h-6 text-[#2A2A2A] group-hover:text-[#C9A84C]" />
                </button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative mb-8">
              <Sparkles className="w-16 h-16 text-[#C9A84C] animate-pulse" />
              <Loader2 className="w-24 h-24 text-[#C9A84C]/20 animate-spin absolute inset-0 -m-4" />
            </div>
            <h3 className="text-3xl font-serif italic mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Curating your capsule...
            </h3>
            <p className="text-[#666] uppercase tracking-widest text-xs">StyleAI is analyzing your vibe</p>
          </div>
        ) : results ? (
          <div className="flex-1 flex flex-col pb-12">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl font-serif font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Your StyleAI Picks ✨
                </h2>
                <p className="text-[#666] uppercase tracking-widest text-xs">Based on your unique aesthetic profile</p>
              </div>
              <Button 
                onClick={resetQuiz}
                variant="outline"
                className="border-[#2A2A2A] text-[#A0A0A0] hover:text-[#C9A84C] h-12 uppercase tracking-widest text-[10px] font-bold"
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <p className="text-[#C9A84C] text-xl mb-8">{error}</p>
            <Button onClick={resetQuiz} className="bg-[#C9A84C] text-black h-14 px-12 rounded-none uppercase tracking-widest font-bold">
              Try Again
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
