import React, { useState } from "react";
import { Link } from "wouter";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Product } from "@/lib/mockProducts";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  isFavorited?: boolean;
  onFavoriteChange?: (productId: number, newState: boolean) => void;
}

export default function ProductCard({ product, isFavorited, onFavoriteChange }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleSave, isSaved } = useWardrobe();
  const { isAuthenticated } = useAuth();

  // Prefer explicit prop; fall back to WardrobeContext for unauthenticated state
  const [saved, setSaved] = useState<boolean>(isFavorited ?? isSaved(product.id));

  const toggleFavorite = trpc.favorites.toggle.useMutation({
    onSuccess: (data) => {
      setSaved(data.isFavorite);
      // Keep WardrobeContext in sync so the heart state persists across pages
      const currentlySavedLocally = isSaved(product.id);
      if (data.isFavorite !== currentlySavedLocally) toggleSave(product);
      onFavoriteChange?.(product.id, data.isFavorite);
    },
    onError: () => toast.error("Failed to update favorites"),
  });

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      toggleFavorite.mutate({ productId: product.id });
    } else {
      toggleSave(product);
      setSaved(isSaved(product.id));
    }
  };

  const price = parseFloat(product.price).toFixed(2);
  const oldPrice = product.oldPrice ? parseFloat(product.oldPrice).toFixed(2) : null;

  return (
    <div className="group bg-[#111] border border-[#2A2A2A] overflow-hidden transition-all duration-500 hover:border-[#C9A84C]/30 flex flex-col h-full relative">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-[#C9A84C] text-black text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 shadow-lg">
            New Arrival
          </span>
        )}
        {product.isSale && (
          <span className="bg-white text-black text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 shadow-lg">
            Limited Sale
          </span>
        )}
        {product.stock === "low stock" && (
          <span className="bg-red-900 text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1 shadow-lg">
            Low Stock
          </span>
        )}
      </div>

      {/* Heart / Save Button */}
      <button
        onClick={handleHeartClick}
        disabled={toggleFavorite.isPending}
        className={`absolute top-4 right-4 z-20 p-2.5 rounded-full transition-all duration-300 ${
          saved
            ? "bg-[#C9A84C] text-black shadow-[0_0_15px_rgba(201,168,76,0.4)]"
            : "bg-black/40 text-white hover:bg-[#C9A84C] hover:text-black"
        }`}
      >
        <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
      </button>

      {/* Image */}
      <Link href={`/product/${product.id}`}>
        <div className="relative h-[320px] overflow-hidden cursor-pointer">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <div className="w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex items-center gap-1 text-[#C9A84C] mb-2">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-bold">{product.rating}</span>
                <span className="text-white/40 text-[9px] ml-1">({product.reviews} reviews)</span>
              </div>
              <p className="text-white/70 text-[10px] uppercase tracking-widest line-clamp-2 italic mb-2">
                "{product.description.split(".")[0]}..."
              </p>
            </div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 bg-[#111]">
        <div className="mb-4 flex-1">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F0EB] mb-2 group-hover:text-[#C9A84C] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-3">
            <span className="text-[#C9A84C] font-bold text-sm">${price}</span>
            {oldPrice && (
              <span className="text-[#444] line-through text-xs">${oldPrice}</span>
            )}
          </div>
        </div>

        <Button
          onClick={() => addItem(product, 1, product.sizes[0], product.colors[0])}
          className="w-full h-12 bg-transparent border border-[#2A2A2A] text-[#A0A0A0] hover:border-[#C9A84C] hover:text-[#C9A84C] rounded-none uppercase tracking-[0.2em] font-bold text-[9px] transition-all"
        >
          <ShoppingBag className="w-3.5 h-3.5 mr-2" /> Add to Collection
        </Button>
      </div>
    </div>
  );
}
