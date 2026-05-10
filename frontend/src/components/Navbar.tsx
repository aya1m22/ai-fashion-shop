import { Link, useLocation } from "wouter";
import { ShoppingBag, Heart, User, Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: cartItems = [] } = trpc.cart.getItems.useQuery(undefined, { enabled: isAuthenticated });
  const cartCount = (cartItems as any[]).reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  const navLinks = [
    { href: "/women", label: "Women" },
    { href: "/men", label: "Men" },
    { href: "/ai-stylist", label: "AI Stylist", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ];

  const isActive = (href: string) => location === href || location.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-stone-900 rounded-sm flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-display font-semibold text-stone-900 tracking-tight">StyleAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/cart" className="relative p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-stone-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/profile" className="p-2 rounded-full text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-stone-200 text-sm font-medium text-stone-700 hover:border-stone-400 transition">
                  <User className="w-4 h-4" />
                  {user?.name?.split(" ")[0] || "Profile"}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/api/auth/mock-admin" className="px-3 py-1.5 border border-stone-200 text-stone-600 text-[12px] font-medium rounded-full hover:bg-stone-50 transition">
                  Demo Admin
                </a>
                <a href={getLoginUrl()} className="px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-stone-700 transition">
                  Sign In
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-full text-stone-600 hover:bg-stone-100 transition"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive(link.href) ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 flex items-center gap-3">
            <Link href="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 transition">
              <ShoppingBag className="w-4 h-4" />
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            {isAuthenticated ? (
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-100 transition">
                <User className="w-4 h-4" />
                Profile
              </Link>
            ) : (
              <a href={getLoginUrl()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-stone-900 text-white">
                Sign In
              </a>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
