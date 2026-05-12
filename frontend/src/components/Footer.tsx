import { Link } from "wouter";
import { Instagram, Music2, Pin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111] border-t border-[#2A2A2A] pt-16 pb-8 text-[#A0A0A0]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#C9A84C] flex items-center justify-center">
                <span className="text-black font-bold">S</span>
              </div>
              <span className="text-xl font-serif text-[#F5F0EB] tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>STYLEAI</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Redefining luxury fashion through artificial intelligence. Personally curated, universally elegant.
            </p>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB]">Company</h4>
            <ul className="space-y-3 text-xs uppercase tracking-widest">
              <li><Link href="/about" className="hover:text-[#C9A84C] transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#C9A84C] transition">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-[#C9A84C] transition">Careers</Link></li>
            </ul>
          </div>

          {/* Column 3: Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB]">Support</h4>
            <ul className="space-y-3 text-xs uppercase tracking-widest">
              <li><Link href="/size-guide" className="hover:text-[#C9A84C] transition">Size Guide</Link></li>
              <li><Link href="/returns" className="hover:text-[#C9A84C] transition">Return Policy</Link></li>
              <li><Link href="/privacy" className="hover:text-[#C9A84C] transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Social */}
          <div className="space-y-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB]">Follow Us</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 border border-[#2A2A2A] flex items-center justify-center hover:border-[#C9A84C] hover:text-[#C9A84C] transition group">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-[#2A2A2A] flex items-center justify-center hover:border-[#C9A84C] hover:text-[#C9A84C] transition">
                <Music2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 border border-[#2A2A2A] flex items-center justify-center hover:border-[#C9A84C] hover:text-[#C9A84C] transition">
                <Pin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1A1A1A] text-center">
          <p className="text-[9px] uppercase tracking-[0.4em] font-bold">
            © {currentYear} StyleAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
