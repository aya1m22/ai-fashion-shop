// Re-exports from shared/catalog.ts — kept here so existing backend imports
// (db.ts, shop.test.ts, seed.ts) continue to work unchanged.
export type { CatalogProduct } from "../shared/catalog";
export { initialCatalog, catalogById } from "../shared/catalog";
