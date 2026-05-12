import { Link } from "wouter";
import { Heart, User, ShoppingBag, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { catalogToProduct } from "@/lib/catalogAdapter";
import { toast } from "sonner";

export default function Profile() {
  const { isAuthenticated, user, logout } = useAuth();
  const utils = trpc.useUtils();

  const { data: favList = [], isLoading: favLoading } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const handleLogout = async () => {
    await logout();
    toast("Signed out successfully");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navbar />
        <div className="container py-20 text-center">
          <User className="w-16 h-16 text-[#333] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-[#F5F0EB] mb-2">My Profile</h2>
          <p className="text-[#A0A0A0] mb-6">Sign in to view your profile and favorites</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-black font-semibold rounded-none hover:bg-[#B0923D] transition uppercase tracking-widest text-xs">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const favorites = (favList as any[])
    .map((f: any) => f.product)
    .filter(Boolean)
    .map((p: any) => catalogToProduct(p));

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-none hover:bg-[#1A1A1A] transition border border-transparent hover:border-[#333]">
            <ArrowLeft className="w-5 h-5 text-[#A0A0A0]" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#F5F0EB]">My Profile</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1A1A1A] rounded-none border border-[#2A2A2A] p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#333] flex items-center justify-center mb-3">
                  <span className="text-[#C9A84C] text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <h2 className="font-semibold text-[#F5F0EB] text-center">{user?.name || "User"}</h2>
                <p className="text-[#A0A0A0] text-xs text-center mt-1">{user?.email || ""}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-[#0D0D0D] rounded-none border border-[#333] p-3 text-center">
                  <p className="text-xl font-bold text-[#F5F0EB]">{favorites.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#A0A0A0] mt-1">Favorites</p>
                </div>
                <div className="bg-[#0D0D0D] rounded-none border border-[#333] p-3 text-center">
                  <p className="text-xl font-bold text-[#F5F0EB]">{(orders as any[]).length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#A0A0A0] mt-1">Orders</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-1">
                <Link href="/cart" className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm text-[#A0A0A0] hover:bg-[#333] hover:text-[#F5F0EB] transition">
                  <ShoppingBag className="w-4 h-4 text-[#A0A0A0]" />
                  Shopping Cart
                </Link>
                <Link href="/women" className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm text-[#A0A0A0] hover:bg-[#333] hover:text-[#F5F0EB] transition">
                  <Heart className="w-4 h-4 text-[#A0A0A0]" />
                  Continue Shopping
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-sm text-red-500 hover:bg-red-900/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* My Favorites */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <Heart className="w-5 h-5 text-[#C9A84C] fill-[#C9A84C]" />
                <h2 className="font-display text-2xl font-bold text-[#F5F0EB]">My Favorites</h2>
                <span className="text-[#A0A0A0] text-sm">({favorites.length} items)</span>
              </div>

              {favLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A0A0A0]" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-[#1A1A1A] rounded-none border border-[#2A2A2A] p-12 text-center">
                  <Heart className="w-12 h-12 text-[#333] mx-auto mb-4" />
                  <p className="text-[#A0A0A0] text-lg mb-2">No favorites yet</p>
                  <p className="text-[#A0A0A0] text-sm mb-6">Tap the heart icon on any product to save it here</p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/women" className="px-5 py-2.5 bg-[#C9A84C] text-black font-bold rounded-none text-[10px] tracking-widest uppercase hover:bg-[#B0923D] transition">
                      Browse Women
                    </Link>
                    <Link href="/men" className="px-5 py-2.5 border border-[#333] text-[#F5F0EB] font-bold rounded-none text-[10px] tracking-widest uppercase hover:border-[#C9A84C] transition">
                      Browse Men
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorited={true}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Orders */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <ShoppingBag className="w-5 h-5 text-[#A0A0A0]" />
                <h2 className="font-display text-2xl font-bold text-[#F5F0EB]">Order History</h2>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#A0A0A0]" />
                </div>
              ) : (orders as any[]).length === 0 ? (
                <div className="bg-[#1A1A1A] rounded-none border border-[#2A2A2A] p-8 text-center">
                  <ShoppingBag className="w-10 h-10 text-[#333] mx-auto mb-3" />
                  <p className="text-[#A0A0A0]">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(orders as any[]).map((order: any) => (
                    <div key={order.id} className="bg-[#1A1A1A] rounded-none border border-[#2A2A2A] p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#F5F0EB] text-sm">Order #{order.id}</p>
                        <p className="text-[#A0A0A0] text-xs mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[#C9A84C]">${parseFloat(String(order.totalPrice)).toFixed(2)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider ${
                          order.status === "delivered" ? "bg-green-900/20 text-green-400 border border-green-500/50" :
                          order.status === "shipped" ? "bg-blue-900/20 text-blue-400 border border-blue-500/50" :
                          order.status === "confirmed" ? "bg-amber-900/20 text-amber-400 border border-amber-500/50" :
                          "bg-[#333] text-[#F5F0EB] border border-[#444]"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
