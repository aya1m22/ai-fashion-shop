export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  oldPrice?: string;
  gender: "men" | "women";
  category: string;
  subcategory: string;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  styleTags: string[];
  rating: number;
  reviews: number;
  stockStatus: "In Stock" | "Low Stock";
  isNew?: boolean;
  isSale?: boolean;
}

export const mockProducts: Product[] = [
  // WOMEN (6 items)
  {
    id: 101,
    name: "Satin Evening Gown",
    description: "Elegant silk-satin blend dress with a fluid silhouette. Perfect for formal galas and sophisticated evening dinners.",
    price: "129.00",
    oldPrice: "159.00",
    gender: "women",
    category: "Women's Dresses",
    subcategory: "dresses",
    imageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=500&fit=crop&q=80",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Emerald", "Black", "Gold"],
    styleTags: ["formal", "evening", "silk"],
    rating: 4.8,
    reviews: 124,
    stockStatus: "In Stock",
    isSale: true
  },
  {
    id: 102,
    name: "Classic Silk Blouse",
    description: "Premium mulberry silk blouse with a tailored fit. A versatile piece that transitions from office to evening with ease.",
    price: "89.00",
    gender: "women",
    category: "Women's Tops",
    subcategory: "tops",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop&q=80",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory", "Soft Pink", "Black"],
    styleTags: ["classic", "silk", "office"],
    rating: 4.5,
    reviews: 86,
    stockStatus: "In Stock",
    isNew: true
  },
  {
    id: 103,
    name: "Heritage Leather Jacket",
    description: "Soft lambskin leather jacket with silver-tone hardware. Hand-crafted for a timeless look that only improves with age.",
    price: "189.00",
    gender: "women",
    category: "Women's Jackets",
    subcategory: "jackets",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop&q=80",
    sizes: ["S", "M", "L"],
    colors: ["Black", "Cognac"],
    styleTags: ["edgy", "leather", "outerwear"],
    rating: 4.9,
    reviews: 42,
    stockStatus: "Low Stock"
  },
  {
    id: 104,
    name: "Floral Midi Day Dress",
    description: "Lightweight chiffon midi dress with a delicate floral print. Features a cinched waist and romantic ruffled sleeves.",
    price: "74.00",
    gender: "women",
    category: "Women's Dresses",
    subcategory: "dresses",
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop&q=80",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blue Floral", "White Floral"],
    styleTags: ["romantic", "floral", "summer"],
    rating: 4.6,
    reviews: 215,
    stockStatus: "In Stock"
  },
  {
    id: 105,
    name: "Oversized Cashmere Knit",
    description: "Ultra-soft 100% cashmere sweater with a relaxed, modern fit. Perfect for cozy layering during the cooler months.",
    price: "119.00",
    gender: "women",
    category: "Women's Tops",
    subcategory: "tops",
    imageUrl: "https://images.unsplash.com/photo-1539008835154-13dec337190d?w=400&h=500&fit=crop&q=80",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Oatmeal", "Charcoal", "Cream"],
    styleTags: ["cozy", "luxury", "cashmere"],
    rating: 4.7,
    reviews: 63,
    stockStatus: "In Stock",
    isNew: true
  },
  {
    id: 106,
    name: "Structured Wool Blazer",
    description: "Professional wool-blend blazer with sharp lapels and a tailored waist. Elevates any outfit with a touch of modern power.",
    price: "145.00",
    gender: "women",
    category: "Women's Jackets",
    subcategory: "jackets",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=500&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Navy", "Gray", "Black"],
    styleTags: ["professional", "wool", "tailored"],
    rating: 4.4,
    reviews: 38,
    stockStatus: "Low Stock"
  },

  // MEN (6 items)
  {
    id: 201,
    name: "Oxford Cotton Shirt",
    description: "Traditional Oxford weave cotton shirt with a button-down collar. A fundamental wardrobe piece for the modern gentleman.",
    price: "59.00",
    gender: "men",
    category: "Men's Tops",
    subcategory: "tops",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "White", "Striped"],
    styleTags: ["classic", "cotton", "smart-casual"],
    rating: 4.6,
    reviews: 145,
    stockStatus: "In Stock"
  },
  {
    id: 202,
    name: "Slim Fit Chinos",
    description: "Tailored chinos made from premium stretch cotton twill. Provides comfort and style for both casual and formal settings.",
    price: "69.00",
    gender: "men",
    category: "Men's Pants",
    subcategory: "pants",
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&q=80",
    sizes: ["30", "32", "34", "36"],
    colors: ["Khaki", "Navy", "Olive"],
    styleTags: ["essential", "cotton", "versatile"],
    rating: 4.5,
    reviews: 312,
    stockStatus: "In Stock",
    isNew: true
  },
  {
    id: 203,
    name: "Classic Bomber Jacket",
    description: "Nylon-blend flight jacket with ribbed trim and metallic hardware. A modern take on a timeless military silhouette.",
    price: "129.00",
    oldPrice: "169.00",
    gender: "men",
    category: "Men's Jackets",
    subcategory: "jackets",
    imageUrl: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&h=500&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Olive", "Black", "Navy"],
    styleTags: ["modern", "military", "streetwear"],
    rating: 4.7,
    reviews: 94,
    stockStatus: "In Stock",
    isSale: true
  },
  {
    id: 204,
    name: "Premium Slub Tee",
    description: "High-quality heavy cotton t-shirt with a unique slub texture. Features a relaxed fit and a soft, breathable hand-feel.",
    price: "34.00",
    gender: "men",
    category: "Men's Tops",
    subcategory: "tops",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&q=80",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Gray", "White", "Navy"],
    styleTags: ["casual", "cotton", "basic"],
    rating: 4.3,
    reviews: 256,
    stockStatus: "In Stock"
  },
  {
    id: 205,
    name: "Raw Indigo Denim",
    description: "14oz selvedge denim jeans in a deep indigo wash. Designed to break in and fade uniquely to your lifestyle over time.",
    price: "98.00",
    gender: "men",
    category: "Men's Pants",
    subcategory: "pants",
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&q=80",
    sizes: ["30", "32", "34", "36"],
    colors: ["Indigo"],
    styleTags: ["denim", "raw", "premium"],
    rating: 4.8,
    reviews: 118,
    stockStatus: "Low Stock"
  },
  {
    id: 206,
    name: "Modern Executive Blazer",
    description: "Sharp navy blazer crafted from premium Italian wool. Features pick-stitch detailing and a natural shoulder for a clean profile.",
    price: "199.00",
    gender: "men",
    category: "Men's Jackets",
    subcategory: "jackets",
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&q=80",
    sizes: ["38R", "40R", "42R", "44R"],
    colors: ["Navy", "Charcoal"],
    styleTags: ["executive", "wool", "formal"],
    rating: 4.9,
    reviews: 28,
    stockStatus: "In Stock"
  }
];
