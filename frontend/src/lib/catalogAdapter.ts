import type { CatalogProduct } from "@shared/catalog";
import type { Product } from "./mockProducts";

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function catalogToProduct(p: CatalogProduct): Product {
  const stockNum = typeof p.stock === "number" ? p.stock : 0;
  const stockStatus: Product["stock"] =
    stockNum <= 0 ? "out of stock" : stockNum <= 5 ? "low stock" : "in stock";

  const genderLabel = p.gender === "women" ? "Women's" : "Men's";

  return {
    id: p.id,
    name: p.name,
    category: `${genderLabel} ${capitalize(p.subcategory)}`,
    subcategory: capitalize(p.subcategory),
    gender: p.gender,
    color: p.colors?.[0] ?? "",
    colors: p.colors ?? [],
    style: p.styleTags ?? [],
    occasion: [],
    price: p.price,
    oldPrice: null,
    imageUrl: p.imageUrl ?? "",
    sizes: p.sizes ?? [],
    stock: stockStatus,
    isNew: false,
    isSale: false,
    rating: 4.5,
    reviews: 0,
    description: p.description ?? "",
  };
}
