import { Link, useLocation } from "wouter";
import { ShoppingBag, Heart, User, Sparkles, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/women", label: "Women" },
    { href: "/men", label: "Men" },
    { href: "/ai-stylist", label: "AI Stylist", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#C9A84C] text-black py-1.5 text-center text-[10px] uppercase tracking-[0.3em] font-bold">
        Free shipping on orders over $75 🚚
      </div>
      <nav className="sticky top-0 z-50 bg-[#0D0D0D] border-b border-[#2A2A2A] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-none flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-black" />
            </div>
            <span className="text-xl font-serif text-[#F5F0EB] tracking-tighter" style={{ fontFamily: '"Playfair Display", serif' }}>STYLEAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-semibold transition-all ${
                  isActive(link.href)
                    ? "text-[#C9A84C]"
                    : "text-[#A0A0A0] hover:text-[#F5F0EB]"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin" className="px-3 py-1 border border-[#C9A84C] text-[#C9A84C] text-[10px] uppercase tracking-widest font-bold hover:bg-[#C9A84C] hover:text-black transition-all">
                Demo Admin
              </Link>
            )}
            
            <Link href="/cart" className="relative p-2 text-[#A0A0A0] hover:text-[#F5F0EB] transition">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#C9A84C] text-black text-[9px] font-bold rounded-none flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="p-2 text-[#A0A0A0] hover:text-[#F5F0EB] transition">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 border border-[#2A2A2A] text-[10px] uppercase tracking-widest font-bold text-[#F5F0EB] hover:border-[#C9A84C] transition">
                  <User className="w-3.5 h-3.5" />
                  {user?.name?.split(" ")[0] || "Profile"}
                </Link>
                <button 
                  onClick={logout}
                  className="p-2 text-[#A0A0A0] hover:text-red-400 transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link href="/login" className="px-5 py-2 bg-[#C9A84C] text-black text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#B0923D] transition-all">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-[#A0A0A0] hover:text-[#F5F0EB]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#2A2A2A] bg-[#0D0D0D] px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest font-semibold transition ${
                isActive(link.href) ? "text-[#C9A84C] bg-[#1A1A1A]" : "text-[#A0A0A0]"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#2A2A2A] space-y-2">
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-[#A0A0A0]">
              <ShoppingBag className="w-4 h-4" />
              Cart ({cartCount})
            </Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-[#C9A84C]">
                Demo Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-[#A0A0A0]">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-widest text-red-400">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full text-center py-3 bg-[#C9A84C] text-black text-xs uppercase tracking-widest font-bold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
    </>
  );
}
