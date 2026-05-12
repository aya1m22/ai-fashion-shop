import { X, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FilterSidebarProps {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  totalCount: number;
  filteredCount: number;
  onClearAll: () => void;
}

export default function FilterSidebar({
  priceRange,
  onPriceChange,
  totalCount,
  filteredCount,
  onClearAll,
}: FilterSidebarProps) {
  const [minPrice, setMinPrice] = useState(priceRange[0].toString());
  const [maxPrice, setMaxPrice] = useState(priceRange[1].toString());

  useEffect(() => {
    setMinPrice(priceRange[0].toString());
    setMaxPrice(priceRange[1].toString());
  }, [priceRange]);

  const handleApplyPrice = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || 1000;
    onPriceChange([min, max]);
  };

  return (
    <aside className="w-full bg-[#111] p-6 border border-[#2A2A2A]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" />
          <span className="font-serif text-[#F5F0EB] text-sm uppercase tracking-widest font-bold">Filters</span>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#A0A0A0] hover:text-[#C9A84C] transition"
        >
          <X className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Result count */}
      <p className="text-[11px] text-[#A0A0A0] mb-8 uppercase tracking-widest">
        Showing <span className="text-[#F5F0EB] font-bold">{filteredCount}</span> of {totalCount}
      </p>

      {/* Price Range */}
      <div className="space-y-6">
        <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-[0.2em]">Price Range</p>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[9px] text-[#A0A0A0] uppercase tracking-widest block mb-1">Min $</label>
            <Input 
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="bg-transparent border-[#333] text-[#F5F0EB] h-10 rounded-none focus:border-[#C9A84C] text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-[9px] text-[#A0A0A0] uppercase tracking-widest block mb-1">Max $</label>
            <Input 
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-transparent border-[#333] text-[#F5F0EB] h-10 rounded-none focus:border-[#C9A84C] text-sm"
              placeholder="1000"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleApplyPrice}
          className="w-full bg-transparent border border-[#333] text-[#F5F0EB] hover:border-[#C9A84C] hover:text-[#C9A84C] rounded-none h-10 text-[10px] uppercase tracking-widest font-bold transition-all"
        >
          Apply Price
        </Button>
      </div>
    </aside>
  );
}
