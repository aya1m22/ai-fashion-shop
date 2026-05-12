import { Link } from "wouter";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, Loader2, Lock, MapPin, User, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "";
const APP_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Cart() {
  const { cartItems, removeItem, updateQuantity, subtotal } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout">("cart");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  useState(() => {
    document.title = "StyleAI — Your Cart";
  });

  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handleStripeCheckout = async () => {
    if (!name.trim()) { toast.error("Please enter your full name."); return; }
    if (!email.trim() || !email.includes("@")) { toast.error("Please enter a valid email address."); return; }
    if (!address.trim()) { toast.error("Please enter your shipping address."); return; }

    setIsRedirecting(true);
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}${APP_BASE}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${origin}${APP_BASE}/cart`;

      const res = await fetch(`${API_BASE}/api/stripe/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            name: `${item.product.name} (${item.size} / ${item.color})`,
            price: item.product.price,
            quantity: item.quantity,
            imageUrl: item.product.imageUrl,
          })),
          customer: { name, email, address },
          successUrl,
          cancelUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Failed to create checkout session");
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || "Could not start checkout. Is the backend running?");
      setIsRedirecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12 border-b border-[#2A2A2A] pb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                {checkoutStep === "cart" ? "Your Collection" : "Secure Checkout"}
              </h1>
              <p className="text-[#666] text-sm uppercase tracking-widest">
                {cartItems.length} {cartItems.length === 1 ? "item" : "items"} selected
              </p>
            </div>
            {checkoutStep === "checkout" && (
              <button
                onClick={() => setCheckoutStep("cart")}
                className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#F5F0EB] transition uppercase tracking-widest text-[10px] font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Cart
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24 bg-[#111] border border-[#2A2A2A]">
              <ShoppingBag className="w-16 h-16 text-[#333] mx-auto mb-6" />
              <h3 className="text-2xl font-serif mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                Your gallery is empty
              </h3>
              <Link href="/">
                <Button className="bg-transparent border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-black rounded-none px-8 py-6 uppercase tracking-widest text-[10px] font-bold transition-all">
                  Browse the Collection
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Left Column */}
              <div className="lg:col-span-2">
                {checkoutStep === "cart" ? (
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#111] border border-[#2A2A2A] p-6 flex gap-6 group hover:border-[#333] transition-colors"
                      >
                        <div className="w-24 h-32 bg-[#1A1A1A] overflow-hidden shrink-0 border border-[#2A2A2A]">
                          <img src={item.product.imageUrl} className="w-full h-full object-cover" alt={item.product.name} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <h3 className="text-[15px] font-bold uppercase tracking-tight">{item.product.name}</h3>
                            <button onClick={() => removeItem(item.id)} className="text-[#444] hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#A0A0A0] uppercase tracking-widest mb-6">
                            Size: <span className="text-[#F5F0EB]">{item.size}</span> ·{" "}
                            Color: <span className="text-[#F5F0EB]">{item.color}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 border border-[#2A2A2A] bg-[#0D0D0D]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-[#1A1A1A] text-[#A0A0A0]"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-[#1A1A1A] text-[#A0A0A0]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[#C9A84C] font-bold">
                              ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Checkout form */
                  <div className="bg-[#111] border border-[#2A2A2A] p-10 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C] mb-6 flex items-center gap-2">
                        <User className="w-3.5 h-3.5" /> Delivery Details
                      </p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Full Name</label>
                          <input
                            type="text"
                            placeholder="Aya Mansour"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-[#666] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> Email — invoice will be sent here
                          </label>
                          <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 mt-6">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#666] flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Shipping Address
                        </label>
                        <input
                          type="text"
                          placeholder="123 Fashion Ave, Cairo, Egypt"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Stripe badge */}
                    <div className="border border-[#2A2A2A] bg-[#0D0D0D] p-5 flex items-center gap-4">
                      <CreditCard className="w-6 h-6 text-[#C9A84C] shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[#F5F0EB]">Secure Payment via Stripe</p>
                        <p className="text-xs text-[#666] mt-1">
                          You'll be redirected to Stripe's encrypted checkout page. We never see your card details.
                        </p>
                      </div>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg"
                        alt="Stripe"
                        className="h-6 ml-auto opacity-60 filter invert"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#111] border border-[#2A2A2A] p-8 sticky top-28">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB] mb-8 border-b border-[#2A2A2A] pb-4">
                    Order Summary
                  </h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#666]">Subtotal</span>
                      <span className="font-bold">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#666]">Shipping</span>
                      <span className="font-bold text-green-500">${shipping.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-serif font-bold mb-10 text-[#F5F0EB]">
                    <span>Total</span>
                    <span className="text-[#C9A84C]">${total.toFixed(2)}</span>
                  </div>

                  {checkoutStep === "cart" ? (
                    <Button
                      onClick={() => setCheckoutStep("checkout")}
                      className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black h-14 rounded-none uppercase tracking-[0.2em] font-bold text-[11px]"
                    >
                      Checkout Securely
                    </Button>
                  ) : (
                    <Button
                      disabled={isRedirecting}
                      onClick={handleStripeCheckout}
                      className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black h-14 rounded-none uppercase tracking-[0.2em] font-bold text-[11px] disabled:opacity-60"
                    >
                      {isRedirecting ? (
                        <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Redirecting…</>
                      ) : (
                        <><Lock className="w-4 h-4 mr-2" /> Pay with Stripe</>
                      )}
                    </Button>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">
                      256-bit SSL encrypted
                    </span>
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
