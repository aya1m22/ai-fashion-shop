import { useEffect, useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Loader2, Mail, Package, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface OrderResult {
  orderNumber: string;
  customerEmail: string;
  total: number;
  items: { name: string; quantity: number; unitPrice: number }[];
}

export default function CheckoutSuccess() {
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setErrorMsg("No session ID found in URL.");
      setStatus("error");
      return;
    }

    fetch(`${API_BASE}/api/stripe/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setOrder(data);
        clearCart();
        setStatus("success");
      })
      .catch((err) => {
        setErrorMsg(err.message || "Something went wrong.");
        setStatus("error");
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
      <Navbar />

      <div className="container py-32 flex flex-col items-center text-center max-w-2xl mx-auto px-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-14 h-14 text-[#C9A84C] animate-spin mb-8" />
            <h1 className="font-serif text-3xl mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Confirming your payment…
            </h1>
            <p className="text-[#666]">Please wait while we verify your order.</p>
          </>
        )}

        {status === "success" && order && (
          <>
            <div className="w-20 h-20 bg-[#C9A84C]/20 rounded-full flex items-center justify-center mb-8 border border-[#C9A84C]/50">
              <CheckCircle2 className="w-10 h-10 text-[#C9A84C]" />
            </div>

            <h1 className="font-serif text-5xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Order Confirmed!
            </h1>
            <p className="text-[#A0A0A0] text-lg mb-2">
              Order <span className="text-[#C9A84C] font-bold">#{order.orderNumber}</span>
            </p>

            {/* Invoice sent note */}
            <div className="flex items-center gap-3 bg-[#111] border border-[#C9A84C]/30 px-6 py-4 mb-10 mt-4">
              <Mail className="w-5 h-5 text-[#C9A84C] shrink-0" />
              <p className="text-sm text-[#A0A0A0] text-left">
                Invoice sent to <span className="text-[#F5F0EB] font-bold">{order.customerEmail}</span>
              </p>
            </div>

            {/* Items summary */}
            <div className="w-full bg-[#111] border border-[#2A2A2A] mb-10">
              <div className="p-5 border-b border-[#2A2A2A] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#C9A84C]" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Items Ordered</span>
              </div>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center px-5 py-3 border-b border-[#1A1A1A] last:border-0">
                  <span className="text-sm text-[#F5F0EB]">{item.name}</span>
                  <span className="text-xs text-[#666]">×{item.quantity}</span>
                  <span className="text-sm text-[#C9A84C] font-bold">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between px-5 py-4 bg-[#0D0D0D]">
                <span className="text-sm font-bold uppercase tracking-widest">Total Paid</span>
                <span className="text-[#C9A84C] font-bold text-lg">${order.total.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/">
              <Button className="bg-[#C9A84C] hover:bg-[#B0923D] text-black px-12 py-7 rounded-none uppercase tracking-widest font-bold text-xs">
                Continue Shopping
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="w-14 h-14 text-red-500 mb-8" />
            <h1 className="font-serif text-3xl mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Something went wrong
            </h1>
            <p className="text-[#666] mb-8">{errorMsg}</p>
            <Link href="/cart">
              <Button className="bg-[#C9A84C] text-black px-10 py-6 rounded-none uppercase tracking-widest font-bold text-xs">
                Return to Cart
              </Button>
            </Link>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
