import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/mockProducts";
import { toast } from "sonner";

interface Look {
  id: string;
  name: string;
  itemIds: number[];
  createdAt: number;
}

interface WardrobeContextType {
  savedItems: Product[];
  toggleSave: (product: Product) => void;
  isSaved: (productId: number) => boolean;
  looks: Look[];
  createLook: (name: string, itemIds: number[]) => void;
  deleteLook: (lookId: string) => void;
  removeItem: (productId: number) => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export function WardrobeProvider({ children }: { children: React.ReactNode }) {
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [looks, setLooks] = useState<Look[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("wardrobe_items");
    const storedLooks = localStorage.getItem("wardrobe_looks");
    if (stored) setSavedItems(JSON.parse(stored));
    if (storedLooks) setLooks(JSON.parse(storedLooks));
  }, []);

  const toggleSave = (product: Product) => {
    setSavedItems(prev => {
      const exists = prev.find(p => p.id === product.id);
      let next;
      if (exists) {
        next = prev.filter(p => p.id !== product.id);
        toast.info(`Removed ${product.name} from wardrobe`);
      } else {
        next = [...prev, product];
        toast.success(`Saved ${product.name} to wardrobe`);
      }
      localStorage.setItem("wardrobe_items", JSON.stringify(next));
      return next;
    });
  };

  const removeItem = (productId: number) => {
    setSavedItems(prev => {
      const next = prev.filter(p => p.id !== productId);
      localStorage.setItem("wardrobe_items", JSON.stringify(next));
      return next;
    });
  };

  const isSaved = (productId: number) => savedItems.some(p => p.id === productId);

  const createLook = (name: string, itemIds: number[]) => {
    const newLook: Look = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      itemIds,
      createdAt: Date.now()
    };
    setLooks(prev => {
      const next = [...prev, newLook];
      localStorage.setItem("wardrobe_looks", JSON.stringify(next));
      return next;
    });
    toast.success(`Look "${name}" created!`);
  };

  const deleteLook = (lookId: string) => {
    setLooks(prev => {
      const next = prev.filter(l => l.id !== lookId);
      localStorage.setItem("wardrobe_looks", JSON.stringify(next));
      return next;
    });
  };

  return (
    <WardrobeContext.Provider value={{ savedItems, toggleSave, isSaved, looks, createLook, deleteLook, removeItem }}>
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const context = useContext(WardrobeContext);
  if (!context) throw new Error("useWardrobe must be used within WardrobeProvider");
  return context;
}
