import { and, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, aiRecommendations, cartItems, favorites, orderItems, orders, products, reviews, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { CatalogProduct } from "./catalog";
import { initialCatalog, catalogById } from "./catalog";

let _db: ReturnType<typeof drizzle> | null = null;
let queryClient: postgres.Sql<{}> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      if (!queryClient) {
        const url = new URL(process.env.DATABASE_URL);
        console.log(`[Database] Connecting to host: ${url.host}`);
        queryClient = postgres(process.env.DATABASE_URL);
      }
      _db = drizzle(queryClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── User helpers ────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    for (const field of textFields) {
      const value = user[field];
      if (value === undefined) continue;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.warn("[Database] getUserByOpenId failed:", error);
    return undefined;
  }
}

// ─── In-memory catalog helpers ────────────────────────────────────────────────

let memoryProducts = initialCatalog.map((p) => ({ ...p }));

function cloneProduct(p: CatalogProduct): CatalogProduct {
  return { ...p, colorStock: { ...p.colorStock }, sizes: [...p.sizes], colors: [...p.colors], styleTags: [...p.styleTags] };
}

function getMemoryProduct(id: number): CatalogProduct | undefined {
  return memoryProducts.find((p) => p.id === id);
}

// ─── Product helpers ──────────────────────────────────────────────────────────

export async function getProducts(
  gender?: string,
  limit = 60,
  offset = 0,
  subcategory?: string,
  minPrice?: number,
  maxPrice?: number,
) {
  const db = await getDb();
  if (db) {
    try {
      let query = db.select().from(products).$dynamic();
      const conditions = [];
      if (gender && (gender === "men" || gender === "women")) conditions.push(eq(products.gender, gender));
      if (subcategory) conditions.push(eq(products.subcategory, subcategory));
      if (minPrice !== undefined) conditions.push(gte(products.price, String(minPrice)));
      if (maxPrice !== undefined) conditions.push(lte(products.price, String(maxPrice)));
      if (conditions.length > 0) query = query.where(and(...conditions)) as typeof query;
      const rows = await query.limit(limit).offset(offset);
      return rows.map(normalizeDbProduct);
    } catch (error) {
      console.warn("[Database] getProducts query failed, falling back to memory:", error);
    }
  }
  // fallback to memory
  let list = memoryProducts.map(cloneProduct);
  if (gender && (gender === "men" || gender === "women")) list = list.filter((p) => p.gender === gender);
  if (subcategory) list = list.filter((p) => p.subcategory === subcategory);
  if (minPrice !== undefined) list = list.filter((p) => parseFloat(p.price) >= minPrice);
  if (maxPrice !== undefined) list = list.filter((p) => parseFloat(p.price) <= maxPrice);
  return list.slice(offset, offset + limit);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
      if (rows.length > 0) return normalizeDbProduct(rows[0]);
    } catch (error) {
      console.warn("[Database] getProductById query failed, falling back to memory:", error);
    }
  }
  const p = getMemoryProduct(id);
  return p ? cloneProduct(p) : null;
}

function normalizeDbProduct(row: any) {
  const colorStock: Record<string, number> = typeof row.colorStock === "object" && row.colorStock !== null && !Array.isArray(row.colorStock) ? row.colorStock : {};
  const stock = typeof row.stock === "number" ? row.stock : Object.values(colorStock).reduce((s: number, v: any) => s + (Number(v) || 0), 0);
  return {
    ...row,
    price: String(row.price),
    colorStock,
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : Object.keys(colorStock),
    styleTags: Array.isArray(row.styleTags) ? row.styleTags : [],
    stock,
  };
}

export async function updateProductInventory(
  productId: number,
  updates: { sizes?: string[]; colorStock?: Record<string, number>; price?: string; subcategory?: string },
) {
  const db = await getDb();
  if (db) {
    const setValues: Record<string, unknown> = {};
    if (updates.sizes) setValues.sizes = updates.sizes;
    if (updates.colorStock) {
      setValues.colorStock = updates.colorStock;
      setValues.colors = Object.keys(updates.colorStock);
      setValues.stock = Object.values(updates.colorStock).reduce((s, v) => s + (Number(v) || 0), 0);
    }
    if (updates.price) setValues.price = updates.price;
    if (updates.subcategory) setValues.subcategory = updates.subcategory;
    if (Object.keys(setValues).length > 0) {
      await db.update(products).set(setValues).where(eq(products.id, productId));
    }
    return getProductById(productId);
  }
  const p = getMemoryProduct(productId);
  if (!p) return null;
  if (updates.sizes) p.sizes = updates.sizes;
  if (updates.colorStock) {
    p.colorStock = updates.colorStock;
    p.colors = Object.keys(updates.colorStock);
    p.stock = Object.values(updates.colorStock).reduce((s, v) => s + (Number(v) || 0), 0);
  }
  if (updates.price) p.price = updates.price;
  if (updates.subcategory) p.subcategory = updates.subcategory;
  return cloneProduct(p);
}

export async function reserveProductColorStock(productId: number, color: string, quantity: number) {
  const db = await getDb();
  if (db) {
    const rows = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!rows.length) return { ok: false as const, error: "Product not found" };
    const row = rows[0];
    const colorStock: Record<string, number> = typeof row.colorStock === "object" && row.colorStock !== null && !Array.isArray(row.colorStock) ? (row.colorStock as Record<string, number>) : {};
    const current = colorStock[color] ?? 0;
    if (current < quantity) return { ok: false as const, error: `Only ${current} items left in ${color}` };
    const updated = { ...colorStock, [color]: current - quantity };
    const newStock = Object.values(updated).reduce((s, v) => s + (Number(v) || 0), 0);
    await db.update(products).set({ colorStock: updated, colors: Object.keys(updated), stock: newStock }).where(eq(products.id, productId));
    return { ok: true as const, updated, updatedStock: newStock };
  }
  const p = getMemoryProduct(productId);
  if (!p) return { ok: false as const, error: "Product not found" };
  const current = p.colorStock[color] ?? 0;
  if (current < quantity) return { ok: false as const, error: `Only ${current} items left in ${color}` };
  p.colorStock[color] = current - quantity;
  p.stock = Object.values(p.colorStock).reduce((s, v) => s + (Number(v) || 0), 0);
  return { ok: true as const, updated: { ...p.colorStock }, updatedStock: p.stock };
}

// ─── Seed products into DB ────────────────────────────────────────────────────

export async function seedProductsIfEmpty() {
  const db = await getDb();
  if (!db) return;
  try {
    const existing = await db.select({ id: products.id }).from(products).limit(1);
    if (existing.length > 0) return;
    for (const p of initialCatalog) {
      await db.insert(products).values({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        gender: p.gender,
        subcategory: p.subcategory,
        imageUrl: p.imageUrl,
        sizes: p.sizes,
        colors: p.colors,
        colorStock: p.colorStock,
        styleTags: p.styleTags,
        stock: p.stock,
      });
    }
    console.log(`[DB] Seeded ${initialCatalog.length} products`);
  } catch (err) {
    console.error("[DB] Seed error:", err);
  }
}

// ─── Cart helpers ─────────────────────────────────────────────────────────────

let memoryCart: any[] = [];
let memoryCartId = 1;

export async function getCartItems(userId: number) {
  const db = await getDb();
  if (db) {
    const rows = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    return Promise.all(rows.map(async (item: any) => ({ ...item, product: await getProductById(item.productId) })));
  }
  return memoryCart.filter((i) => i.userId === userId).map((i) => ({ ...i, product: getMemoryProduct(i.productId) ? cloneProduct(getMemoryProduct(i.productId)!) : null }));
}

export async function addToCart(userId: number, productId: number, quantity: number, size?: string, color?: string) {
  const db = await getDb();
  if (db) { await db.insert(cartItems).values({ userId, productId, quantity, size, color }); return { success: true }; }
  memoryCart.push({ id: memoryCartId++, userId, productId, quantity, size, color, createdAt: new Date(), updatedAt: new Date() });
  return { success: true };
}

export async function updateCartItem(id: number, quantity: number) {
  const db = await getDb();
  if (db) { await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)); return { success: true }; }
  const item = memoryCart.find((i) => i.id === id);
  if (item) { item.quantity = quantity; item.updatedAt = new Date(); }
  return { success: true };
}

export async function removeFromCart(id: number) {
  const db = await getDb();
  if (db) { await db.delete(cartItems).where(eq(cartItems.id, id)); return { success: true }; }
  const idx = memoryCart.findIndex((i) => i.id === id);
  if (idx >= 0) memoryCart.splice(idx, 1);
  return { success: true };
}

// ─── Favorites helpers ────────────────────────────────────────────────────────

let memoryFavorites: any[] = [];
let memoryFavoriteId = 1;

export async function getFavoritesByUser(userId: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(favorites).where(eq(favorites.userId, userId));
      return Promise.all(rows.map(async (row: any) => ({ ...row, product: await getProductById(row.productId) })));
    } catch (error) {
      console.warn("[Database] getFavoritesByUser failed, falling back to memory:", error);
    }
  }
  return memoryFavorites.filter((r) => r.userId === userId).map((r) => ({ ...r, product: getMemoryProduct(r.productId) ? cloneProduct(getMemoryProduct(r.productId)!) : null }));
}

export async function isFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productId, productId))).limit(1);
      return rows.length > 0;
    } catch (error) {
      console.warn("[Database] isFavorite failed, falling back to memory:", error);
    }
  }
  return memoryFavorites.some((r) => r.userId === userId && r.productId === productId);
}

export async function addFavorite(userId: number, productId: number) {
  const already = await isFavorite(userId, productId);
  if (already) return { success: true };
  const db = await getDb();
  if (db) { await db.insert(favorites).values({ userId, productId }); return { success: true }; }
  memoryFavorites.push({ id: memoryFavoriteId++, userId, productId, createdAt: new Date() });
  return { success: true };
}

export async function removeFavorite(userId: number, productId: number) {
  const db = await getDb();
  if (db) { await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.productId, productId))); return { success: true }; }
  const idx = memoryFavorites.findIndex((r) => r.userId === userId && r.productId === productId);
  if (idx >= 0) memoryFavorites.splice(idx, 1);
  return { success: true };
}

// ─── Orders helpers ───────────────────────────────────────────────────────────

export async function createOrder(userId: number, totalPrice: string, shippingAddress?: string) {
  const db = await getDb();
  if (db) { const result = await db.insert(orders).values({ userId, totalPrice, shippingAddress }); return result; }
  return { success: true };
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}

// ─── AI Recommendation helpers ────────────────────────────────────────────────

export async function saveAIRecommendation(userId: number, analysisData: any, recommendedProducts: any) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(aiRecommendations).values({ userId, analysisData, recommendedProducts });
}
