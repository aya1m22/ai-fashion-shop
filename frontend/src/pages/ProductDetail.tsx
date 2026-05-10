import { useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { Heart, ShoppingBag, ArrowLeft, Loader2, Check, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const COLOR_HEX: Record<string, string> = {
  Black: "#1a1a1a", White: "#f5f5f5", Gray: "#9ca3af", Charcoal: "#374151",
  Navy: "#1e3a5f", Blue: "#3b82f6", Light_Blue: "#93c5fd", Stone: "#78716c",
  Brown: "#92400e", Tan: "#d97706", Camel: "#ca8a04", Khaki: "#a3a37a",
  Beige: "#d4c5a9", Ivory: "#fffff0", Cream: "#fffdd0", Champagne: "#f7e7ce",
  Sand: "#c2b280", Natural: "#c8a97e",
  Red: "#ef4444", Burgundy: "#800020", Terracotta: "#c1440e",
  Pink: "#f472b6", Blush: "#fda4af", Lilac: "#c084fc",
  Emerald: "#10b981", Olive: "#6b7c3c", Sage: "#8fad88", Green: "#22c55e",
  Gold: "#d4af37", Silver: "#c0c0c0",
  Nude: "#e8c9a0", Rose: "#f43f5e",
};

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id || "0");
  const { isAuthenticated } = useAuth();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading, refetch } = trpc.products.getById.useQuery(
    { id: productId },
    { enabled: productId > 0 }
  );

  const { data: favData, refetch: refetchFav } = trpc.favorites.isFavorite.useQuery(
    { productId },
    { enabled: isAuthenticated && productId > 0 }
  );

  const isFavorited = favData?.isFavorite ?? false;
  const utils = trpc.useUtils();

  const toggleFavMutation = trpc.favorites.toggle.useMutation({
    onSuccess: (data) => {
      refetchFav();
      utils.favorites.list.invalidate();
      toast(data.isFavorite ? "Added to favorites ♥" : "Removed from favorites");
    },
    onError: () => toast.error("Failed to update favorites"),
  });

  const addToCartMutation = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      setAddedToCart(true);
      utils.cart.getItems.invalidate();
      toast.success("Added to cart!");
      setTimeout(() => setAddedToCart(false), 2500);
    },
    onError: (err) => toast.error(err.message || "Failed to add to cart"),
  });

  const colorStock: Record<string, number> = useMemo(() => {
    if (!product) return {};
    if (typeof product.colorStock === "object" && product.colorStock !== null && !Array.isArray(product.colorStock)) {
      return product.colorStock as Record<string, number>;
    }
    return {};
  }, [product]);

  const colors: string[] = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.colors)) return product.colors;
    return Object.keys(colorStock);
  }, [product, colorStock]);

  const sizes: string[] = useMemo(() => {
    if (!product) return [];
    return Array.isArray(product.sizes) ? product.sizes : [];
  }, [product]);

  const isShoeCategory = product?.subcategory === "shoes";
  const isAccessoryNoSize = ["bags", "accessories"].includes(product?.subcategory || "") &&
    !["rings"].some((t) => (product?.styleTags || []).includes(t));

  const selectedColorStock = selectedColor ? (colorStock[selectedColor] ?? 0) : null;
  const isColorOutOfStock = selectedColor && selectedColorStock !== null && selectedColorStock <= 0;

  const canAddToCart =
    isAuthenticated &&
    selectedColor &&
    !isColorOutOfStock &&
    (isAccessoryNoSize || selectedSize);

  const handleAddToCart = () => {
    if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
    if (!selectedColor) { toast.error("Please select a color"); return; }
    if (!isAccessoryNoSize && !selectedSize) { toast.error("Please select a size"); return; }
    if (isColorOutOfStock) { toast.error("This color is out of stock"); return; }

    addToCartMutation.mutate({
      productId,
      quantity,
      size: isAccessoryNoSize ? "One Size" : selectedSize,
      color: selectedColor,
    });
  };

  const handleFavorite = () => {
    if (!isAuthenticated) { toast.error("Please sign in to save favorites"); return; }
    toggleFavMutation.mutate({ productId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-stone-400" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-stone-500 text-lg mb-4">Product not found</p>
          <Link href="/" className="text-stone-900 font-medium underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(String(product.price)).toFixed(2);
  const genderPath = product.gender === "women" ? "/women" : "/men";
  const genderLabel = product.gender === "women" ? "Women" : "Men";

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-stone-500 mb-8">
          <Link href="/" className="hover:text-stone-900 transition">Home</Link>
          <span>/</span>
          <Link href={genderPath} className="hover:text-stone-900 transition">{genderLabel}</Link>
          <span>/</span>
          <Link href={`${genderPath}?sub=${product.subcategory}`} className="hover:text-stone-900 transition capitalize">{product.subcategory}</Link>
          <span>/</span>
          <span className="text-stone-900 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-stone-100">
              <img
                src={product.imageUrl || ""}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80";
                }}
              />
            </div>
            {/* Favorite button on image */}
            <button
              onClick={handleFavorite}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                isFavorited ? "bg-rose-500 text-white" : "bg-white text-stone-500 hover:text-rose-500"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Category + Gender badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 bg-stone-100 px-3 py-1 rounded-full capitalize">
                {product.subcategory}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${
                product.gender === "women" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
              }`}>
                {genderLabel}
              </span>
            </div>

            <h1 className="font-display text-3xl font-bold text-stone-900 mb-2">{product.name}</h1>
            <p className="text-stone-500 text-sm leading-relaxed mb-4">{product.description}</p>

            <div className="text-3xl font-bold text-stone-900 mb-6">${price}</div>

            {/* Color Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-stone-900">
                  Color {selectedColor && <span className="font-normal text-stone-500">— {selectedColor}</span>}
                </p>
                {selectedColor && selectedColorStock !== null && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    selectedColorStock <= 0 ? "bg-red-100 text-red-600" :
                    selectedColorStock <= 3 ? "bg-amber-100 text-amber-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {selectedColorStock <= 0 ? "Out of Stock" :
                     selectedColorStock <= 3 ? `Only ${selectedColorStock} left` :
                     `${selectedColorStock} in stock`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const stock = colorStock[color] ?? 0;
                  const isOut = stock <= 0;
                  const hex = COLOR_HEX[color] || "#d1d5db";
                  const isSelected = selectedColor === color;

                  return (
                    <button
                      key={color}
                      onClick={() => !isOut && setSelectedColor(color)}
                      disabled={isOut}
                      title={`${color}${isOut ? " — Out of Stock" : ` (${stock} left)`}`}
                      className={`relative flex flex-col items-center gap-1 group transition-all ${isOut ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    >
                      {/* Color circle */}
                      <div
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          isOut
                            ? "border-red-400 ring-2 ring-red-200"
                            : isSelected
                            ? "border-stone-900 ring-2 ring-stone-900/20 scale-110"
                            : "border-stone-200 hover:border-stone-500"
                        }`}
                        style={{ backgroundColor: hex }}
                      >
                        {isOut && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-red-500/20">
                            <span className="text-red-600 text-[10px] font-bold">✕</span>
                          </div>
                        )}
                        {isSelected && !isOut && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-full">
                            <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                      {/* Color label */}
                      <span className={`text-[10px] font-medium ${
                        isOut ? "text-red-500" : isSelected ? "text-stone-900" : "text-stone-500"
                      }`}>
                        {color.replace("_", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Out of stock warning */}
              {isColorOutOfStock && (
                <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-medium">This color is currently out of stock. Please choose another color.</p>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {!isAccessoryNoSize && sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-stone-900 mb-3">
                  Size {selectedSize && <span className="font-normal text-stone-500">— {selectedSize}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSize === size
                          ? "bg-stone-900 text-white border-stone-900"
                          : "bg-white text-stone-700 border-stone-200 hover:border-stone-500"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {isShoeCategory && (
                  <p className="text-xs text-stone-400 mt-2">Shoe sizes are in US sizing (6–12)</p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-stone-900 mb-3">Quantity</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:border-stone-500 transition"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold text-stone-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(selectedColorStock || 10, quantity + 1))}
                  className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-700 hover:border-stone-500 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!!isColorOutOfStock || addToCartMutation.isPending}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  isColorOutOfStock
                    ? "bg-red-100 text-red-400 border border-red-200 cursor-not-allowed"
                    : addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-stone-900 text-white hover:bg-stone-700"
                }`}
              >
                {addToCartMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : addedToCart ? (
                  <><Check className="w-4 h-4" /> Added to Cart</>
                ) : isColorOutOfStock ? (
                  <><AlertCircle className="w-4 h-4" /> Out of Stock</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" /> Add to Cart</>
                )}
              </button>
              <button
                onClick={handleFavorite}
                className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                  isFavorited
                    ? "bg-rose-500 border-rose-500 text-white"
                    : "border-stone-200 text-stone-500 hover:border-rose-400 hover:text-rose-500"
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Style Tags */}
            {(product.styleTags || []).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-stone-100">
                {(product.styleTags as string[]).map((tag) => (
                  <span key={tag} className="text-xs text-stone-500 bg-stone-100 px-3 py-1 rounded-full capitalize">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
