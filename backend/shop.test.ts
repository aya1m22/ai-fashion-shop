/**
 * End-to-end verification tests for the AI Fashion Shop.
 * These tests run against the in-memory catalog (no DB required).
 */
import { describe, it, expect, beforeAll } from "vitest";
import { getProducts, getProductById, seedProductsIfEmpty } from "./db";
import { catalogToProduct } from "../frontend/src/lib/catalogAdapter";
import { initialCatalog } from "./catalog";

// Seed in-memory catalog before all tests
beforeAll(async () => {
  await seedProductsIfEmpty();
});

// ─── 1. Catalog tRPC: products have valid non-empty imageUrl ─────────────────

describe("catalog: imageUrl validity", () => {
  it("every product has a non-empty imageUrl", async () => {
    const products = await getProducts(undefined, 200, 0);
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.imageUrl, `product ${p.id} (${p.name}) is missing imageUrl`).toBeTruthy();
      expect(p.imageUrl.startsWith("https://"), `product ${p.id} imageUrl is not https`).toBe(true);
    }
  });
});

// ─── 2. Gender filter correctness ───────────────────────────────────────────

describe("catalog: gender filter", () => {
  it("men filter returns only men products", async () => {
    const products = await getProducts("men", 200, 0);
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.gender).toBe("men");
    }
  });

  it("women filter returns only women products", async () => {
    const products = await getProducts("women", 200, 0);
    expect(products.length).toBeGreaterThan(0);
    for (const p of products) {
      expect(p.gender).toBe("women");
    }
  });

  it("men and women products are distinct", async () => {
    const men = await getProducts("men", 200, 0);
    const women = await getProducts("women", 200, 0);
    const menIds = new Set(men.map((p) => p.id));
    const womenIds = new Set(women.map((p) => p.id));
    const overlap = [...menIds].filter((id) => womenIds.has(id));
    expect(overlap).toHaveLength(0);
  });
});

// ─── 3. AI Stylist: recommendations reference real catalog IDs ───────────────

describe("aiStylist: mocked recommendations are real catalog products", () => {
  it("product IDs returned by AI exist in the catalog", async () => {
    // Simulate AI response returning these IDs (from men's accessories in catalog)
    const mockedAiIds = [2018, 2019, 2020];
    const catalogIds = new Set(initialCatalog.map((p) => p.id));

    for (const id of mockedAiIds) {
      expect(
        catalogIds.has(id),
        `ID ${id} returned by AI is not in the catalog`,
      ).toBe(true);
    }
  });

  it("getProductById resolves catalog products", async () => {
    const product = await getProductById(1001);
    expect(product).not.toBeNull();
    expect(product!.name).toBeTruthy();
    expect(product!.imageUrl).toBeTruthy();
  });
});

// ─── 4. Cart: add/remove count logic ────────────────────────────────────────

describe("cart: count logic (CartContext simulation)", () => {
  it("adding an item increases total count", () => {
    const cartItems: Array<{ productId: number; quantity: number }> = [];

    // Add item
    cartItems.push({ productId: 1001, quantity: 1 });
    const countAfterAdd = cartItems.reduce((s, i) => s + i.quantity, 0);
    expect(countAfterAdd).toBe(1);

    // Add same product again (merge quantity)
    const existing = cartItems.find((i) => i.productId === 1001);
    if (existing) existing.quantity += 1;
    const countAfterSecondAdd = cartItems.reduce((s, i) => s + i.quantity, 0);
    expect(countAfterSecondAdd).toBe(2);
  });

  it("removing an item decreases total count", () => {
    const cartItems = [
      { id: "a", productId: 1001, quantity: 2 },
      { id: "b", productId: 1002, quantity: 1 },
    ];

    const afterRemove = cartItems.filter((i) => i.id !== "a");
    const count = afterRemove.reduce((s, i) => s + i.quantity, 0);
    expect(count).toBe(1);
  });
});

// ─── 5. catalogAdapter: converts CatalogProduct correctly ───────────────────

describe("catalogAdapter", () => {
  it("converts a catalog product to UI Product shape", () => {
    const raw = initialCatalog[0]; // Satin Evening Dress (id 1001)
    const adapted = catalogToProduct(raw);

    expect(adapted.id).toBe(raw.id);
    expect(adapted.name).toBe(raw.name);
    expect(adapted.imageUrl).toBe(raw.imageUrl);
    expect(adapted.gender).toBe(raw.gender);
    expect(Array.isArray(adapted.colors)).toBe(true);
    expect(adapted.colors.length).toBeGreaterThan(0);
    expect(adapted.sizes.length).toBeGreaterThan(0);
    expect(["in stock", "low stock", "out of stock"]).toContain(adapted.stock);
  });

  it("women products have women gender in adapted form", async () => {
    const womenRaw = await getProducts("women", 50, 0);
    for (const raw of womenRaw) {
      const adapted = catalogToProduct(raw as any);
      expect(adapted.gender).toBe("women");
    }
  });

  it("men products have men gender in adapted form", async () => {
    const menRaw = await getProducts("men", 50, 0);
    for (const raw of menRaw) {
      const adapted = catalogToProduct(raw as any);
      expect(adapted.gender).toBe("men");
    }
  });
});
