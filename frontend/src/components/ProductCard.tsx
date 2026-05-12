import { Link } from "wouter";
import { Heart, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

interface ProductCardProps {
  product: any;
  isFavorited?: boolean;
  onFavoriteChange?: (productId: number, isFav: boolean) => void;
  animationDelay?: number;
}

export default function ProductCard({ product, isFavorited = false, onFavoriteChange, animationDelay = 0 }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const [localFav, setLocalFav] = useState(isFavorited);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const utils = trpc.useUtils();

  const toggleFavMutation = trpc.favorites.toggle.useMutation({
    onMutate: () => {
      setLocalFav((prev) => !prev);
    },
    onSuccess: (data) => {
      setLocalFav(data.isFavorite);
      onFavoriteChange?.(product.id, data.isFavorite);
      utils.favorites.list.invalidate();
    },
    onError: () => {
      setLocalFav((prev) => !prev);
      toast.error("Failed to update favorites");
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to save favorites");
      return;
    }
    toggleFavMutation.mutate({ productId: product.id });
  };

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const price = parseFloat(String(product.price)).toFixed(2);

  return (
    <div
      className="product-card animate-fade-in-up group bg-[#111] border border-[#2A2A2A] overflow-hidden transition-all duration-500 hover:border-[#C9A84C]"
      style={{ animationDelay: `${animationDelay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#1A1A1A]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-1000 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            onLoad={() => setImgLoaded(true)}
            loading="lazy"
          />
          
          {/* Top Pill */}
          <div className="absolute top-3 left-3">
            <span className="bg-black/60 backdrop-blur-md text-[#F5F0EB] text-[9px] font-bold uppercase tracking-widest px-3 py-1 border border-[#2A2A2A]">
              {product.subcategory}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all ${
              localFav ? "text-[#C9A84C]" : "text-white/40 hover:text-[#F5F0EB]"
            }`}
          >
            <Heart className={`w-4 h-4 ${localFav ? "fill-current" : ""}`} />
          </button>

          {/* Out of stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white border border-white px-4 py-2">
                Out of Stock
              </span>
            </div>
          )}

          {/* Hover View Details */}
          <div className={`absolute inset-x-0 bottom-0 bg-[#C9A84C] text-black text-[10px] font-bold uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-transform duration-500 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            View Selection
          </div>
        </div>

        <div className="p-5">
          <h3 className="text-[#F5F0EB] text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-[#C9A84C] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-[#666] text-[10px] mb-4 line-clamp-1 italic">{product.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-[#C9A84C] text-sm font-bold tracking-tighter">
              ${price}
            </span>
            <div className="flex gap-1.5">
              {(product.colors || []).slice(0, 3).map((color: string) => (
                <div
                  key={color}
                  className="w-2.5 h-2.5 rounded-full border border-white/10"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

function getColorHex(colorName: string): string {
  const map: Record<string, string> = {
    Black: "#1a1a1a", White: "#f5f5f5", Gray: "#9ca3af", Charcoal: "#374151",
    Navy: "#1e3a5f", Blue: "#3b82f6", Beige: "#d4c5a9", Camel: "#ca8a04",
    Red: "#ef4444", Gold: "#d4af37", Silver: "#c0c0c0",
  };
  return map[colorName] || "#d1d5db";
}
