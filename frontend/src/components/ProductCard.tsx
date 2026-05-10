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
  const [favAnimating, setFavAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const utils = trpc.useUtils();

  const toggleFavMutation = trpc.favorites.toggle.useMutation({
    onMutate: () => {
      setLocalFav((prev) => !prev);
      setFavAnimating(true);
      setTimeout(() => setFavAnimating(false), 400);
    },
    onSuccess: (data) => {
      setLocalFav(data.isFavorite);
      onFavoriteChange?.(product.id, data.isFavorite);
      utils.favorites.list.invalidate();
      toast(data.isFavorite ? "❤️ Added to favorites" : "Removed from favorites");
    },
    onError: () => {
      setLocalFav((prev) => !prev); // rollback
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
      className="product-card animate-fade-in-up group bg-white rounded-xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 transform"
      style={{ animationDelay: `${animationDelay}ms`, opacity: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative overflow-hidden bg-stone-100 aspect-[3/4]">
          {/* Loading skeleton */}
          {!imgLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}

          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${
              imgLoaded ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-108" : "scale-100"}`}
            style={{ transform: isHovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease" }}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80";
              setImgLoaded(true);
            }}
          />

          {/* Favorite button with animation */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
              localFav
                ? "bg-rose-500 text-white"
                : "bg-white/95 text-stone-400 hover:text-rose-500 hover:bg-white"
            } ${favAnimating ? "animate-bounce-in" : ""}`}
            aria-label={localFav ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 transition-all duration-200 ${localFav ? "fill-current scale-110" : "scale-100"}`} />
          </button>

          {/* Quick view overlay on hover */}
          <div className={`absolute inset-x-0 bottom-0 bg-stone-900/85 text-white text-xs font-medium text-center py-2.5 flex items-center justify-center gap-1.5 transition-all duration-300 ${
            isHovered && !isOutOfStock ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          }`}>
            <ShoppingBag className="w-3.5 h-3.5" />
            View Details
          </div>

          {/* Stock badge */}
          {isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 bg-stone-900/80 text-white text-xs font-medium text-center py-1.5">
              Out of Stock
            </div>
          )}

          {/* Subcategory pill */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-stone-700 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              {product.subcategory}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-medium text-stone-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-stone-600 transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-stone-400 text-xs mb-3 line-clamp-1">{product.description}</p>

          <div className="flex items-center justify-between">
            <span className="text-stone-900 font-bold text-base group-hover:text-amber-700 transition-colors duration-200">
              ${price}
            </span>
            {/* Color dots */}
            <div className="flex gap-1.5">
              {(product.colors || []).slice(0, 4).map((color: string) => {
                const stock = product.colorStock?.[color] ?? 0;
                return (
                  <div
                    key={color}
                    title={`${color}${stock <= 0 ? " (Out)" : ""}`}
                    className={`color-swatch w-3.5 h-3.5 rounded-full border-2 ${
                      stock <= 0 ? "opacity-25 border-stone-200" : "border-white shadow-sm"
                    }`}
                    style={{ backgroundColor: getColorHex(color) }}
                  />
                );
              })}
              {(product.colors || []).length > 4 && (
                <span className="text-stone-400 text-[10px] self-center font-medium">
                  +{(product.colors || []).length - 4}
                </span>
              )}
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
    Navy: "#1e3a5f", Blue: "#3b82f6", Light_Blue: "#93c5fd", Stone: "#78716c",
    Brown: "#92400e", Tan: "#d97706", Camel: "#ca8a04", Khaki: "#a3a37a",
    Beige: "#d4c5a9", Ivory: "#fffff0", Cream: "#fffdd0", Champagne: "#f7e7ce",
    Sand: "#c2b280", Natural: "#c8a97e",
    Red: "#ef4444", Burgundy: "#800020", Terracotta: "#c1440e",
    Pink: "#f472b6", Blush: "#fda4af", Lilac: "#c084fc",
    Emerald: "#10b981", Olive: "#6b7c3c", Sage: "#8fad88", Green: "#22c55e",
    Gold: "#d4af37", Silver: "#c0c0c0", Multicolor: "#a78bfa",
    Nude: "#e8c9a0", Rose: "#f43f5e", Blush_Pink: "#ffb6c1",
  };
  return map[colorName] || "#d1d5db";
}
