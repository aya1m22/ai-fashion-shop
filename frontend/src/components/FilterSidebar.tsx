import { X, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

interface FilterSidebarProps {
  subcategories: string[];
  selectedSubcategory: string;
  onSubcategoryChange: (sub: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  availableColors: string[];
  totalCount: number;
  filteredCount: number;
}

const COLOR_MAP: Record<string, string> = {
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

export default function FilterSidebar({
  subcategories,
  selectedSubcategory,
  onSubcategoryChange,
  priceRange,
  onPriceChange,
  selectedColors,
  onColorsChange,
  availableColors,
  totalCount,
  filteredCount,
}: FilterSidebarProps) {
  const [priceExpanded, setPriceExpanded] = useState(true);
  const [colorExpanded, setColorExpanded] = useState(true);

  const hasActiveFilters = selectedSubcategory !== "all" || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 500;

  const clearAll = () => {
    onSubcategoryChange("all");
    onColorsChange([]);
    onPriceChange([0, 500]);
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorsChange(selectedColors.filter((c) => c !== color));
    } else {
      onColorsChange([...selectedColors, color]);
    }
  };

  return (
    <aside className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-stone-600" />
          <span className="font-semibold text-stone-900 text-sm">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900 transition"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-stone-500 mb-5">
        Showing <span className="font-semibold text-stone-900">{filteredCount}</span> of {totalCount} items
      </p>

      {/* Subcategory Pills */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSubcategoryChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              selectedSubcategory === "all"
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
            }`}
          >
            All
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => onSubcategoryChange(sub)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedSubcategory === sub
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              }`}
            >
              {sub.charAt(0).toUpperCase() + sub.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-100 mb-5" />

      {/* Price Range */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-3"
          onClick={() => setPriceExpanded(!priceExpanded)}
        >
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Price Range</p>
          <span className="text-stone-400 text-xs">{priceExpanded ? "▲" : "▼"}</span>
        </button>
        {priceExpanded && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-900">${priceRange[0]}</span>
              <span className="text-xs text-stone-400">to</span>
              <span className="text-sm font-semibold text-stone-900">${priceRange[1]}</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-stone-400 uppercase tracking-wider">Min</label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={priceRange[0]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= priceRange[1]) onPriceChange([val, priceRange[1]]);
                  }}
                  className="price-slider mt-1"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 uppercase tracking-wider">Max</label>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={10}
                  value={priceRange[1]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= priceRange[0]) onPriceChange([priceRange[0], val]);
                  }}
                  className="price-slider mt-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-stone-100 mb-5" />

      {/* Color Swatches */}
      {availableColors.length > 0 && (
        <div className="mb-6">
          <button
            className="flex items-center justify-between w-full mb-3"
            onClick={() => setColorExpanded(!colorExpanded)}
          >
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Color</p>
            <span className="text-stone-400 text-xs">{colorExpanded ? "▲" : "▼"}</span>
          </button>
          {colorExpanded && (
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => {
                const hex = COLOR_MAP[color] || "#d1d5db";
                const isSelected = selectedColors.includes(color);
                const isGradient = hex.startsWith("linear");
                return (
                  <button
                    key={color}
                    onClick={() => toggleColor(color)}
                    title={color}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      isSelected ? "border-stone-900 scale-110 shadow-md" : "border-transparent hover:border-stone-400"
                    }`}
                    style={isGradient ? { background: hex } : { backgroundColor: hex }}
                    aria-label={color}
                  >
                    {color === "White" && (
                      <span className="block w-full h-full rounded-full border border-stone-200" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {selectedColors.length > 0 && (
            <button
              onClick={() => onColorsChange([])}
              className="mt-2 text-xs text-stone-400 hover:text-stone-700 transition"
            >
              Clear colors
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
