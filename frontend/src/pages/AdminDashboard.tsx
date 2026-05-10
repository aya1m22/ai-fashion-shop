import { useState, useMemo } from "react";
import { Loader2, Package, Search, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "wouter";

const SHOE_SIZES = ["6", "7", "8", "9", "10", "11", "12"];
const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];
const RING_SIZES = ["6", "7", "8", "9", "10", "11", "12"];

function isShoeProduct(product: any) { return product.subcategory === "shoes"; }
function isRingProduct(product: any) { return (product.styleTags || []).includes("ring"); }
function isAccessoryOneSize(product: any) {
  return ["bags"].includes(product.subcategory) ||
    (product.subcategory === "accessories" && !isRingProduct(product));
}

function getSizeOptions(product: any) {
  if (isShoeProduct(product)) return SHOE_SIZES;
  if (isRingProduct(product)) return RING_SIZES;
  if (isAccessoryOneSize(product)) return ["One Size"];
  return APPAREL_SIZES;
}

interface EditState {
  sizes: string[];
  colorStock: Record<string, number>;
  price: string;
}

export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "men" | "women">("all");
  const [subcatFilter, setSubcatFilter] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: products = [], isLoading } = trpc.products.list.useQuery({
    gender: genderFilter === "all" ? undefined : genderFilter,
    limit: 200,
  });

  const updateInventory = trpc.products.updateInventory.useMutation({
    onSuccess: () => {
      toast.success("Inventory updated successfully");
      utils.products.list.invalidate();
      setEditingId(null);
      setEditState(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update"),
  });

  const filteredProducts = useMemo(() => {
    return (products as any[]).filter((p: any) => {
      if (subcatFilter !== "all" && p.subcategory !== subcatFilter) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [products, subcatFilter, search]);

  const subcategories = useMemo(() => {
    const cats = new Set<string>();
    (products as any[]).forEach((p: any) => cats.add(p.subcategory));
    return Array.from(cats).sort();
  }, [products]);

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditState({
      sizes: Array.isArray(product.sizes) ? [...product.sizes] : [],
      colorStock: typeof product.colorStock === "object" && product.colorStock !== null ? { ...product.colorStock } : {},
      price: String(product.price),
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditState(null); };

  const saveEdit = (productId: number) => {
    if (!editState) return;
    updateInventory.mutate({
      productId,
      sizes: editState.sizes,
      colorStock: editState.colorStock,
      price: editState.price,
    });
  };

  const toggleSize = (size: string) => {
    if (!editState) return;
    const newSizes = editState.sizes.includes(size)
      ? editState.sizes.filter((s) => s !== size)
      : [...editState.sizes, size];
    setEditState({ ...editState, sizes: newSizes });
  };

  const updateColorStock = (color: string, value: string) => {
    if (!editState) return;
    const num = Math.max(0, parseInt(value) || 0);
    setEditState({ ...editState, colorStock: { ...editState.colorStock, [color]: num } });
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container py-20 text-center">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-stone-900 mb-2">Admin Dashboard</h2>
          <p className="text-stone-500 mb-4">You need admin access to view this page.</p>
          <Link href="/" className="text-stone-900 font-medium underline">Back to Home</Link>
        </div>
      </div>
    );
  }

  const totalStock = (products as any[]).reduce((sum: number, p: any) => sum + (p.stock || 0), 0);
  const outOfStock = (products as any[]).filter((p: any) => (p.stock || 0) <= 0).length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-stone-900">Inventory Management</h1>
            <p className="text-stone-500 text-sm mt-1">Manage product stock, sizes, and pricing</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl border border-stone-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-stone-900">{(products as any[]).length}</p>
              <p className="text-xs text-stone-500">Total Products</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-stone-900">{totalStock}</p>
              <p className="text-xs text-stone-500">Total Stock</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-100 px-4 py-3 text-center">
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
              <p className="text-xs text-red-500">Out of Stock</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-stone-100 p-4 mb-6 flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-500"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value as any)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white"
          >
            <option value="all">All Genders</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
          </select>
          <select
            value={subcatFilter}
            onChange={(e) => setSubcatFilter(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white"
          >
            <option value="all">All Categories</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        {/* Product Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product: any) => {
              const isEditing = editingId === product.id;
              const isExpanded = expandedId === product.id;
              const colorStock: Record<string, number> = typeof product.colorStock === "object" && product.colorStock !== null ? product.colorStock : {};
              const totalProductStock = Object.values(colorStock).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
              const sizeOptions = getSizeOptions(product);

              return (
                <div key={product.id} className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                  {/* Product Row */}
                  <div className="p-4 flex items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-12 h-14 object-cover rounded-lg bg-stone-100 shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=80"; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-stone-900 text-sm truncate">{product.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          product.gender === "women" ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                        }`}>{product.gender}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 capitalize">{product.subcategory}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span>ID: {product.id}</span>
                        <span>Price: ${parseFloat(String(product.price)).toFixed(2)}</span>
                        <span className={`font-medium ${totalProductStock <= 0 ? "text-red-600" : totalProductStock <= 5 ? "text-amber-600" : "text-green-600"}`}>
                          Stock: {totalProductStock}
                        </span>
                      </div>
                    </div>

                    {/* Color stock dots */}
                    <div className="hidden md:flex gap-1.5 items-center">
                      {Object.entries(colorStock).map(([color, stock]) => (
                        <div
                          key={color}
                          title={`${color}: ${stock}`}
                          className={`w-5 h-5 rounded-full border-2 ${stock <= 0 ? "border-red-400 opacity-50" : "border-stone-200"}`}
                          style={{ backgroundColor: getColorHex(color) }}
                        />
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : product.id)}
                        className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {!isEditing ? (
                        <button
                          onClick={() => { startEdit(product); setExpandedId(product.id); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(product.id)}
                            disabled={updateInventory.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {updateInventory.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Edit Panel */}
                  {(isExpanded || isEditing) && (
                    <div className="border-t border-stone-100 p-4 bg-stone-50">
                      {isEditing && editState ? (
                        <div className="space-y-5">
                          {/* Price */}
                          <div>
                            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 block">Price ($)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={editState.price}
                              onChange={(e) => setEditState({ ...editState, price: e.target.value })}
                              className="w-32 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-stone-500 bg-white"
                            />
                          </div>

                          {/* Sizes */}
                          <div>
                            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 block">
                              Sizes {isShoeProduct(product) ? "(US Shoe Sizes)" : isRingProduct(product) ? "(Ring Sizes)" : ""}
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {sizeOptions.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => toggleSize(size)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                                    editState.sizes.includes(size)
                                      ? "bg-stone-900 text-white border-stone-900"
                                      : "bg-white text-stone-600 border-stone-200 hover:border-stone-500"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Color Stock */}
                          <div>
                            <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2 block">
                              Color Stock (set to 0 to mark as out of stock — button will turn red)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {Object.entries(editState.colorStock).map(([color, stock]) => (
                                <div key={color} className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 p-2">
                                  <div
                                    className="w-6 h-6 rounded-full border border-stone-200 shrink-0"
                                    style={{ backgroundColor: getColorHex(color) }}
                                  />
                                  <span className="text-xs font-medium text-stone-700 flex-1 truncate">{color.replace("_", " ")}</span>
                                  <input
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => updateColorStock(color, e.target.value)}
                                    className={`w-14 px-2 py-1 border rounded text-xs text-center focus:outline-none ${
                                      stock <= 0 ? "border-red-300 bg-red-50 text-red-600" : "border-stone-200 focus:border-stone-500"
                                    }`}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Read-only expanded view */
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Sizes</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(Array.isArray(product.sizes) ? product.sizes : []).map((s: string) => (
                                <span key={s} className="text-xs px-2 py-1 bg-white border border-stone-200 rounded-md text-stone-700">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Color Stock</p>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(colorStock).map(([color, stock]) => (
                                <div key={color} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${
                                  stock <= 0 ? "bg-red-50 border-red-200 text-red-600" :
                                  stock <= 3 ? "bg-amber-50 border-amber-200 text-amber-700" :
                                  "bg-green-50 border-green-200 text-green-700"
                                }`}>
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColorHex(color) }} />
                                  <span>{color.replace("_", " ")}: {stock}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
    Gold: "#d4af37", Silver: "#c0c0c0",
    Nude: "#e8c9a0", Rose: "#f43f5e",
  };
  return map[colorName] || "#d1d5db";
}
