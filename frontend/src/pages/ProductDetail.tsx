import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, ArrowLeft, Loader2, Check, Star, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompleteTheLook from "@/components/CompleteTheLook";
import SizeRecommender from "@/components/SizeRecommender";
import { useCart } from "@/contexts/CartContext";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { mockProducts } from "@/lib/mockProducts";
import { initialCatalog } from "@shared/catalog";
import { catalogToProduct } from "@/lib/catalogAdapter";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id || "0");
  const { addItem } = useCart();
  const { toggleSave, isSaved } = useWardrobe();

  const product = useMemo(() => {
    const mock = mockProducts.find(p => p.id === productId);
    if (mock) return mock;
    const catalogItem = initialCatalog.find(p => p.id === productId);
    return catalogItem ? catalogToProduct(catalogItem) : undefined;
  }, [productId]);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const saved = isSaved(productId);

  useEffect(() => {
    if (product) {
      document.title = `StyleAI — ${product.name}`;
      setSelectedColor(product.color);
      setSelectedSize(product.sizes[Math.floor(product.sizes.length / 2)]);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]">
        <Navbar />
        <div className="container py-32 text-center">
          <h2 className="text-3xl font-serif mb-6">Product not found</h2>
          <Link href="/">
            <button className="px-8 py-3 bg-[#C9A84C] text-black font-bold uppercase tracking-widest text-[10px]">
              Return Home
            </button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product, quantity, selectedSize, selectedColor);
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#F5F0EB]" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Navigation */}
        <div className="mb-12 flex justify-between items-center">
          <Link href={product.gender === 'women' ? '/women' : '/men'} className="inline-flex items-center gap-2 text-[#666] hover:text-[#C9A84C] transition-colors uppercase tracking-[0.2em] text-[10px] font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to {product.gender === 'women' ? "Women's" : "Men's"} Collection
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 mb-24">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-[#111] border border-[#2A2A2A] overflow-hidden group">
              <img src={product.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={product.name} />
            </div>
          </div>

          {/* Product Content */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#C9A84C] px-3 py-1 border border-[#C9A84C]/20 bg-[#C9A84C]/5">
                {product.category}
              </span>
              <div className="flex items-center gap-1 text-[#C9A84C]">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold">{product.rating}</span>
                <span className="text-[#666] ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-[#C9A84C]">${product.price}</span>
              {product.oldPrice && (
                <span className="text-xl text-[#444] line-through font-light">${product.oldPrice}</span>
              )}
            </div>

            <p className="text-[#A0A0A0] text-lg leading-relaxed mb-12">
              {product.description}
            </p>

            <div className="space-y-10 border-t border-[#2A2A2A] pt-10">
              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold">Select Size</h4>
                    <SizeRecommender product={product} onSelectSize={(size) => setSelectedSize(size)} />
                  </div>
                  <button className="text-[9px] uppercase tracking-widest text-[#666] hover:text-[#C9A84C] underline font-bold">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[54px] h-12 border transition-all text-[11px] font-bold uppercase tracking-widest ${
                        selectedSize === size ? 'bg-[#C9A84C] border-[#C9A84C] text-black' : 'border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C] hover:text-[#C9A84C]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="flex gap-4 pt-6">
                <div className="flex items-center border border-[#2A2A2A] h-14 px-4 gap-6 bg-[#111]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#666] hover:text-[#F5F0EB]">-</button>
                  <span className="w-4 text-center font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-[#666] hover:text-[#F5F0EB]">+</button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 h-14 bg-[#C9A84C] hover:bg-[#B0923D] text-black font-bold uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_30px_rgba(201,168,76,0.15)] flex items-center justify-center gap-3"
                >
                  {isAdding ? <Loader2 className="animate-spin w-4 h-4" /> : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Collection
                    </>
                  )}
                </button>
                <button 
                  onClick={() => toggleSave(product)}
                  className={`w-14 h-14 border border-[#2A2A2A] flex items-center justify-center hover:border-[#C9A84C] group transition-all ${saved ? 'bg-[#C9A84C] border-[#C9A84C] text-black' : ''}`}
                >
                  <Heart className={`w-5 h-5 ${saved ? 'fill-current' : 'text-[#666] group-hover:text-[#C9A84C]'}`} />
                </button>
              </div>

              {/* Guarantees */}
              <div className="flex flex-wrap gap-8 pt-8 text-[9px] uppercase tracking-widest text-[#444] font-bold border-t border-[#2A2A2A]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-800" />
                  Secure Transaction
                </div>
                <div>Free Shipping Over $75</div>
                <div>Authenticity Guaranteed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete the Look Section */}
        <CompleteTheLook currentProduct={product} />
      </main>

      <Footer />
    </div>
  );
}
