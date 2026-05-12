import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <div className="max-w-2xl w-full mx-4 text-center">
        {/* Decorative Element */}
        <div className="mb-12 relative flex justify-center">
          <div className="absolute inset-0 bg-[#C9A84C] opacity-5 rounded-full blur-3xl w-64 h-64 mx-auto -translate-y-1/2" />
          <h1 
            className="text-[12rem] md:text-[16rem] font-serif font-bold text-[#1A1A1A] leading-none select-none"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C9A84C] bg-[#0D0D0D] px-4 py-2 border border-[#C9A84C]/20">
              Page Not Found
            </span>
          </div>
        </div>

        <h2 
          className="text-4xl md:text-5xl font-serif mb-6 italic"
          style={{ fontFamily: '"Playfair Display", serif' }}
        >
          Lost in the <span className="text-[#C9A84C]">Aesthetic</span>
        </h2>

        <p className="text-[#A0A0A0] mb-12 max-w-md mx-auto text-lg leading-relaxed">
          The pieces you are looking for have moved to a new collection, or the gallery path has been altered.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-[#333] text-[#A0A0A0] hover:bg-[#1A1A1A] hover:text-[#F5F0EB] px-10 py-7 rounded-none uppercase tracking-widest text-[10px] font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous Page
          </Button>
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#C9A84C] hover:bg-[#B0923D] text-black px-10 py-7 rounded-none uppercase tracking-widest text-[10px] font-bold transition-all shadow-[0_0_30px_rgba(201,168,76,0.1)]"
          >
            <Home className="w-4 h-4 mr-2" />
            Return Home
          </Button>
        </div>

        <div className="mt-24 pt-8 border-t border-[#1A1A1A]">
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#444]">
            &copy; STYLEAI LUXURY FASHION. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </div>
  );
}
