import { Link } from "wouter";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Product } from "@/lib/mockProducts";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const price = parseFloat(String(product.price)).toFixed(2);
  const oldPrice = product.oldPrice ? parseFloat(String(product.oldPrice)).toFixed(2) : null;

  return (
    <div
      className="product-card bg-[#111] border border-[#2A2A2A] overflow-hidden transition-all duration-300 hover:border-[#C9A84C] flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block relative h-[260px] overflow-hidden bg-[#1A1A1A]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-700 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          } ${isHovered ? "scale-105" : "scale-100"}`}
          onLoad={() => setImgLoaded(true)}
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-[#C9A84C] text-black text-[9px] font-bold uppercase tracking-widest px-2 py-1">
              New Arrival
            </span>
          )}
          {product.isSale && (
            <span className="bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1">
              Sale
            </span>
          )}
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${
            product.stockStatus === 'Low Stock' 
              ? 'border-orange-500 text-orange-500 bg-black/40' 
              : 'border-[#2A2A2A] text-[#A0A0A0] bg-black/40'
          }`}>
            {product.stockStatus}
          </span>
        </div>

        {/* Favorite Overlay (Optional but nice) */}
        <button className="absolute top-3 right-3 p-2 text-white/40 hover:text-[#C9A84C] transition-colors">
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center text-[#C9A84C]">
            <Star className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-bold ml-1">{product.rating}</span>
          </div>
          <span className="text-[10px] text-[#666]">({product.reviews} reviews)</span>
        </div>

        <h3 className="text-[#F5F0EB] text-[15px] font-bold mb-1 truncate">
          {product.name}
        </h3>
        
        <p className="text-[#666] text-[12px] mb-3 line-clamp-2 leading-tight">
          {product.description}
        </p>
        
        <div className="mt-auto mb-4 flex items-baseline gap-2">
          <span className="text-[#C9A84C] text-[17px] font-bold">
            ${price}
          </span>
          {oldPrice && (
            <span className="text-[#444] text-[13px] line-through">
              ${oldPrice}
            </span>
          )}
        </div>

        <button 
          onClick={(e) => {
            e.preventDefault();
            addItem(product, 1, product.sizes[0], product.colors[0]);
          }}
          className="w-full py-3 bg-[#1A1A1A] text-[#F5F0EB] text-[10px] font-bold uppercase tracking-widest border border-[#2A2A2A] hover:bg-[#C9A84C] hover:text-black hover:border-[#C9A84C] transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
