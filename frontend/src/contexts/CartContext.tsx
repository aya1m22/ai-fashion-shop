import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Product } from '@/lib/mockProducts';

export interface CartItem {
  id: string;
  productId: number;
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  addItem: (product: Product, quantity: number, size: string, color: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('styleai_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('styleai_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = useCallback((product: Product, quantity: number, size: string, color: string) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.productId === product.id && item.size === size && item.color === color
      );

      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += quantity;
        toast.success("Added to cart ✓", { duration: 2000 });
        return newCart;
      }

      const newItem: CartItem = {
        id: Math.random().toString(36).substr(2, 9),
        productId: product.id,
        product,
        quantity,
        size,
        color
      };
      
      toast.success("Added to cart ✓", { duration: 2000 });
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
    toast("Item removed from cart");
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('styleai_cart');
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
