import { Link } from "wouter";
import { Loader2, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Cart() {
  const { isAuthenticated, user } = useAuth();
  const utils = trpc.useUtils();
  const sendInvoice = trpc.email.sendInvoice.useMutation();
  const createOrder = trpc.orders.create.useMutation();

  const { data: cartItems = [], isLoading } = trpc.cart.getItems.useQuery(undefined, { enabled: isAuthenticated });

  const removeItem = trpc.cart.removeItem.useMutation({
    onSuccess: () => { utils.cart.getItems.invalidate(); toast("Item removed from cart"); },
    onError: () => toast.error("Failed to remove item"),
  });

  const updateItem = trpc.cart.updateItem.useMutation({
    onSuccess: () => utils.cart.getItems.invalidate(),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0D0D0D]">
        <Navbar />
        <div className="container py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-[#333] mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-[#F5F0EB] mb-2">Your Cart</h2>
          <p className="text-[#A0A0A0] mb-6">Sign in to view your cart</p>
          <a href={getLoginUrl()} className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-black font-semibold rounded-none hover:bg-[#B0923D] transition uppercase tracking-widest text-xs">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const total = (cartItems as any[]).reduce((sum: number, item: any) => {
    const price = parseFloat(String(item.product?.price || 0));
    return sum + price * (item.quantity || 1);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="p-2 rounded-none hover:bg-[#1A1A1A] transition border border-transparent hover:border-[#333]">
            <ArrowLeft className="w-5 h-5 text-[#A0A0A0]" />
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#F5F0EB]">Shopping Cart</h1>
          {(cartItems as any[]).length > 0 && (
            <span className="text-[#A0A0A0] text-sm">({(cartItems as any[]).length} items)</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-[#A0A0A0]" />
          </div>
        ) : (cartItems as any[]).length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="w-16 h-16 text-[#333] mx-auto mb-4" />
            <p className="text-[#A0A0A0] text-lg mb-2">Your cart is empty</p>
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-black font-semibold rounded-none hover:bg-[#B0923D] transition mt-4 uppercase tracking-widest text-xs">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {(cartItems as any[]).map((item: any) => (
                <div key={item.id} className="bg-[#1A1A1A] rounded-none border border-[#2A2A2A] p-4 flex gap-4">
                  <Link href={`/product/${item.productId}`} className="shrink-0">
                    <div className="w-20 h-24 rounded-none overflow-hidden bg-[#0D0D0D]">
                      <img
                        src={item.product?.imageUrl || ""}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80"; }}
                      />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.productId}`}>
                      <h3 className="font-medium text-[#F5F0EB] text-sm mb-1 hover:text-[#C9A84C] transition">{item.product?.name}</h3>
                    </Link>
                    <p className="text-[#A0A0A0] text-xs mb-2">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.size && <span> · Size: {item.size}</span>}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateItem.mutate({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) })} className="w-7 h-7 rounded-none border border-[#333] flex items-center justify-center text-[#A0A0A0] hover:border-[#F5F0EB] hover:text-[#F5F0EB] transition text-sm">−</button>
                        <span className="w-6 text-center text-sm font-semibold text-[#F5F0EB]">{item.quantity}</span>
                        <button onClick={() => updateItem.mutate({ cartItemId: item.id, quantity: item.quantity + 1 })} className="w-7 h-7 rounded-none border border-[#333] flex items-center justify-center text-[#A0A0A0] hover:border-[#F5F0EB] hover:text-[#F5F0EB] transition text-sm">+</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#C9A84C]">${(parseFloat(String(item.product?.price || 0)) * item.quantity).toFixed(2)}</span>
                        <button onClick={() => removeItem.mutate({ cartItemId: item.id })} className="p-1.5 rounded-none text-[#A0A0A0] hover:text-red-500 hover:bg-red-900/20 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#1A1A1A] rounded-none border border-[#2A2A2A] p-6 sticky top-24">
                <h2 className="font-semibold text-[#F5F0EB] mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-[#A0A0A0]">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#A0A0A0]">
                    <span>Shipping</span>
                    <span className="text-green-500">Free</span>
                  </div>
                </div>
                <div className="border-t border-[#333] pt-4 mb-6">
                  <div className="flex justify-between font-bold text-[#F5F0EB]">
                    <span>Total</span>
                    <span className="text-[#C9A84C]">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    if (user?.email) {
                      toast("Processing order...");
                      try {
                        await createOrder.mutateAsync({ totalPrice: total.toFixed(2) });
                        const res = await sendInvoice.mutateAsync({ email: user.email, items: cartItems, total: total.toFixed(2) });
                        if (res.previewUrl) {
                          console.log("Invoice email preview:", res.previewUrl);
                          toast.success("Order placed! Invoice sent to your email.");
                        }
                        utils.cart.getItems.invalidate();
                      } catch (err: any) {
                        toast.error(err.message || "Checkout failed");
                      }
                    }
                  }}
                  className="w-full py-3.5 bg-[#C9A84C] text-black font-semibold rounded-none hover:bg-[#B0923D] transition uppercase tracking-widest text-xs">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
