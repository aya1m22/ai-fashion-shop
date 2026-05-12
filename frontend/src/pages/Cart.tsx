import { Link, useLocation } from "wouter";
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Cart() {
  const { cartItems, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [isPlacing, setIsPlacing] = useState(false);

  useState(() => {
    document.title = "StyleAI — Your Cart";
  });

  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  if (checkoutStep === "success") {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
        <Navbar />
        <div className="container py-32 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-[#C9A84C]/20 rounded-full flex items-center justify-center mb-8 border border-[#C9A84C]/50 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-[#C9A84C]" />
          </div>
          <h1 className="font-serif text-5xl font-bold mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>Order placed! 🎉</h1>
          <p className="text-[#A0A0A0] text-xl max-w-lg mb-12">
            Thank you for shopping with StyleAI. A confirmation will be sent to your email.
          </p>
          <Link href="/">
            <Button className="bg-[#C9A84C] hover:bg-[#B0923D] text-black px-12 py-7 rounded-none uppercase tracking-widest font-bold text-xs">
              Continue Shopping
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

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
              <button onClick={() => setCheckoutStep("cart")} className="flex items-center gap-2 text-[#A0A0A0] hover:text-[#F5F0EB] transition uppercase tracking-widest text-[10px] font-bold">
                <ArrowLeft className="w-4 h-4" /> Back to Cart
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-24 bg-[#111] border border-[#2A2A2A]">
              <ShoppingBag className="w-16 h-16 text-[#333] mx-auto mb-6" />
              <h3 className="text-2xl font-serif mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Your gallery is empty</h3>
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
                      <div key={item.id} className="bg-[#111] border border-[#2A2A2A] p-6 flex gap-6 group hover:border-[#333] transition-colors">
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
                            Size: <span className="text-[#F5F0EB]">{item.size}</span> · 
                            Color: <span className="text-[#F5F0EB]">{item.color}</span>
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 border border-[#2A2A2A] bg-[#0D0D0D]">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 hover:bg-[#1A1A1A] text-[#A0A0A0]">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:bg-[#1A1A1A] text-[#A0A0A0]">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[#C9A84C] font-bold">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#111] border border-[#2A2A2A] p-10 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Full Name</label>
                        <input type="text" placeholder="John Doe" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Email Address</label>
                        <input type="email" placeholder="john@example.com" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-[#666]">Shipping Address</label>
                      <input type="text" placeholder="123 Luxury Lane, Fashion District" className="w-full bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm focus:border-[#C9A84C] outline-none transition-all" />
                    </div>
                    <div className="pt-4 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-4 h-4 text-[#C9A84C]" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Payment Method</span>
                      </div>
                      <div className="bg-[#0D0D0D] border border-[#2A2A2A] p-4 flex items-center gap-4">
                        <div className="flex-1 flex gap-4">
                          <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="bg-transparent text-sm w-full outline-none" maxLength={19} />
                          <input type="text" placeholder="MM/YY" className="bg-transparent text-sm w-16 outline-none" maxLength={5} />
                          <input type="text" placeholder="CVC" className="bg-transparent text-sm w-12 outline-none" maxLength={3} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-1">
                <div className="bg-[#111] border border-[#2A2A2A] p-8 sticky top-28">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#F5F0EB] mb-8 border-b border-[#2A2A2A] pb-4">Order Summary</h3>
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
                      disabled={isPlacing}
                      onClick={() => {
                        setIsPlacing(true);
                        setTimeout(() => {
                          clearCart();
                          setCheckoutStep("success");
                          setIsPlacing(false);
                        }, 2000);
                      }}
                      className="w-full bg-[#C9A84C] hover:bg-[#B0923D] text-black h-14 rounded-none uppercase tracking-[0.2em] font-bold text-[11px]"
                    >
                      {isPlacing ? <Loader2 className="animate-spin" /> : "Place Order"}
                    </Button>
                  )}
                  
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">Secure SSL encrypted payment</span>
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
