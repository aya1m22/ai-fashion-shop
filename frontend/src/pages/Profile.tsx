import { Link } from "wouter";
import { Heart, User, ShoppingBag, LogOut, Loader2, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
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
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container py-20 text-center">
          <User className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">My Profile</h2>
          <p className="text-stone-500 mb-6">Sign in to view your profile and favorites</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white font-semibold rounded-full hover:bg-stone-700 transition">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const favorites = (favList as any[]).map((f: any) => f.product).filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-full hover:bg-stone-100 transition">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-stone-900">My Profile</h1>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-stone-100 p-6 sticky top-24">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center mb-3">
                  <span className="text-white text-xl font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <h2 className="font-semibold text-stone-900 text-center">{user?.name || "User"}</h2>
                <p className="text-stone-500 text-xs text-center mt-1">{user?.email || ""}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-stone-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-stone-900">{favorites.length}</p>
                  <p className="text-xs text-stone-500">Favorites</p>
                </div>
                <div className="bg-stone-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-stone-900">{(orders as any[]).length}</p>
                  <p className="text-xs text-stone-500">Orders</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-1">
                <Link href="/cart" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition">
                  <ShoppingBag className="w-4 h-4 text-stone-500" />
                  Shopping Cart
                </Link>
                <Link href="/women" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-700 hover:bg-stone-50 transition">
                  <Heart className="w-4 h-4 text-stone-500" />
                  Continue Shopping
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
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
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                <h2 className="font-display text-2xl font-bold text-stone-900">My Favorites</h2>
                <span className="text-stone-500 text-sm">({favorites.length} items)</span>
              </div>

              {favLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center">
                  <Heart className="w-12 h-12 text-stone-200 mx-auto mb-4" />
                  <p className="text-stone-400 text-lg mb-2">No favorites yet</p>
                  <p className="text-stone-400 text-sm mb-6">Tap the heart icon on any product to save it here</p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/women" className="px-5 py-2.5 bg-stone-900 text-white font-medium rounded-full text-sm hover:bg-stone-700 transition">
                      Browse Women
                    </Link>
                    <Link href="/men" className="px-5 py-2.5 border border-stone-200 text-stone-700 font-medium rounded-full text-sm hover:border-stone-400 transition">
                      Browse Men
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {favorites.map((product: any, idx: number) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorited={true}
                      animationDelay={idx * 60}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Recent Orders */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <ShoppingBag className="w-5 h-5 text-stone-600" />
                <h2 className="font-display text-2xl font-bold text-stone-900">Order History</h2>
              </div>

              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                </div>
              ) : (orders as any[]).length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
                  <ShoppingBag className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(orders as any[]).map((order: any) => (
                    <div key={order.id} className="bg-white rounded-xl border border-stone-100 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-900 text-sm">Order #{order.id}</p>
                        <p className="text-stone-500 text-xs mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-stone-900">${parseFloat(String(order.totalPrice)).toFixed(2)}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                          order.status === "confirmed" ? "bg-amber-100 text-amber-700" :
                          "bg-stone-100 text-stone-600"
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
