import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzePhotoWithGemini, askGeminiText } from "./gemini";
import {
  addFavorite,
  addToCart,
  createOrder,
  getAllOrders,
  getCartItems,
  getFavoritesByUser,
  getProductById,
  getProducts,
  getUserOrders,
  isFavorite,
  removeFavorite,
  removeFromCart,
  reserveProductColorStock,
  saveAIRecommendation,
  seedProductsIfEmpty,
  updateCartItem,
  updateProductInventory,
} from "./db";

const ensureAdmin = (role?: string | null) => {
  if (role !== "admin") throw new Error("Admin access required");
};

// Seed products on first router use
let seeded = false;
async function ensureSeeded() {
  if (!seeded) { seeded = true; await seedProductsIfEmpty(); }
}

import { sendVerificationEmail, sendInvoiceEmail } from "./_core/email";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  email: router({
    sendVerification: publicProcedure
      .input(z.object({ email: z.string() }))
      .mutation(async ({ input }) => {
        const verifyUrl = `http://localhost:3000/verify-email?email=${encodeURIComponent(input.email)}`;
        const url = await sendVerificationEmail(input.email, verifyUrl);
        return { success: true, previewUrl: url };
      }),
    sendInvoice: protectedProcedure
      .input(z.object({ email: z.string(), items: z.array(z.any()), total: z.string() }))
      .mutation(async ({ input }) => {
        const url = await sendInvoiceEmail(input.email, input.items, input.total);
        return { success: true, previewUrl: url };
      }),
  }),

  products: router({
    list: publicProcedure
      .input(z.object({
        gender: z.enum(["men", "women"]).optional(),
        subcategory: z.string().optional(),
        limit: z.number().default(80),
        offset: z.number().default(0),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
      }))
      .query(async ({ input }) => {
        await ensureSeeded();
        return getProducts(input.gender, input.limit, input.offset, input.subcategory, input.minPrice, input.maxPrice);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        await ensureSeeded();
        return getProductById(input.id);
      }),

    updateInventory: protectedProcedure
      .input(z.object({
        productId: z.number(),
        sizes: z.array(z.string()).optional(),
        colorStock: z.record(z.string(), z.number().min(0)).optional(),
        price: z.string().optional(),
        subcategory: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        ensureAdmin(ctx.user.role);
        const updated = await updateProductInventory(input.productId, {
          sizes: input.sizes,
          colorStock: input.colorStock,
          price: input.price,
          subcategory: input.subcategory,
        });
        return { success: !!updated, product: updated };
      }),
  }),

  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      await ensureSeeded();
      return getCartItems(ctx.user.id);
    }),
    addItem: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number().min(1).default(1),
        size: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const product = await getProductById(input.productId);
        if (!product) throw new Error("Product not found");
        if (!input.color) throw new Error("Please select a color");
        if (!input.size) throw new Error("Please select a size");
        await addToCart(ctx.user.id, input.productId, input.quantity, input.size, input.color);
        return { success: true };
      }),
    updateItem: protectedProcedure
      .input(z.object({ cartItemId: z.number(), quantity: z.number().min(1) }))
      .mutation(async ({ input }) => {
        await updateCartItem(input.cartItemId, input.quantity);
        return { success: true };
      }),
    removeItem: protectedProcedure
      .input(z.object({ cartItemId: z.number() }))
      .mutation(async ({ input }) => {
        await removeFromCart(input.cartItemId);
        return { success: true };
      }),
  }),

  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      await ensureSeeded();
      return getFavoritesByUser(ctx.user.id);
    }),
    isFavorite: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ ctx, input }) => {
        const fav = await isFavorite(ctx.user.id, input.productId);
        return { isFavorite: fav };
      }),
    toggle: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const already = await isFavorite(ctx.user.id, input.productId);
        if (already) {
          await removeFavorite(ctx.user.id, input.productId);
          return { isFavorite: false };
        }
        await addFavorite(ctx.user.id, input.productId);
        return { isFavorite: true };
      }),
  }),

  orders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllOrders();
      return getUserOrders(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({ totalPrice: z.string(), shippingAddress: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const items = await getCartItems(ctx.user.id);
        if (items.length === 0) throw new Error("Cart is empty");
        
        for (const item of items) {
          if (item.color) {
            const reserve = await reserveProductColorStock(item.productId, item.color, item.quantity);
            if (!reserve.ok) throw new Error(`Stock issue for ${item.product.name}: ${reserve.error}`);
          }
        }
        
        await createOrder(ctx.user.id, input.totalPrice, input.shippingAddress);
        
        for (const item of items) {
          await removeFromCart(item.id);
        }
        
        return { success: true };
      }),
  }),

  aiStylist: router({
    analyzePhoto: protectedProcedure
      .input(z.object({
        imageUrl: z.string(),
        gender: z.enum(["men", "women"]),
      }))
      .mutation(async ({ ctx, input }) => {
        let analysisData: Awaited<ReturnType<typeof analyzePhotoWithGemini>>;

        try {
          analysisData = await analyzePhotoWithGemini(input.imageUrl);
        } catch (err: any) {
          const msg = err?.message || "Unknown error";
          console.error("[AI Stylist] Gemini error:", msg);
          throw new Error(msg);
        }

        if (!analysisData.isValid) {
          return {
            success: false,
            error: analysisData.message || "Could not detect skin tone. Please upload a clear photo with visible skin.",
            analysis: null,
            recommendations: [],
            detectedGender: analysisData.detectedGender,
          };
        }

        // Gender mismatch: warn but still return results for the selected gender
        const genderMismatch =
          analysisData.detectedGender !== "unknown" &&
          analysisData.detectedGender !== input.gender;

        const allProducts = await getProducts(input.gender, 200, 0);

        // Build color token list from Gemini's recommended colors
        const bestColorTokens = analysisData.bestColors.map((c) =>
          (typeof c === "string" ? c : c.name).toLowerCase()
        );

        // Season → additional color keywords to broaden matching
        const seasonKeywords: Record<string, string[]> = {
          Spring:  ["coral", "peach", "ivory", "camel", "warm", "yellow", "light"],
          Summer:  ["lavender", "rose", "grey", "blue", "pink", "soft", "cool"],
          Autumn:  ["rust", "olive", "brown", "camel", "terracotta", "warm", "mustard", "burgundy"],
          Winter:  ["black", "white", "navy", "red", "charcoal", "jewel", "bold"],
        };
        const extraTokens = seasonKeywords[analysisData.seasonalPalette] ?? [];
        const allTokens = [...new Set([...bestColorTokens, ...extraTokens])];

        // Score each product: +2 for each Gemini color match, +1 for season keyword match
        const scored = allProducts.map((p: any) => {
          const productColors = ((p.colors as string[]) ?? []).map((c: string) => c.toLowerCase());
          let score = 0;
          for (const token of bestColorTokens) {
            if (productColors.some((c) => c.includes(token) || token.includes(c))) score += 2;
          }
          for (const token of extraTokens) {
            if (productColors.some((c) => c.includes(token) || token.includes(c))) score += 1;
          }
          return { product: p, score };
        });

        // Sort by score descending, take products with score > 0 first
        scored.sort((a, b) => b.score - a.score);
        const colorMatched = scored.filter((s) => s.score > 0).map((s) => s.product);

        // Accessory metal matching
        const metal = analysisData.accessoryMetal;
        const metalTokens = metal === "either" ? ["gold", "silver"] : [metal];

        let recommendedProducts: any[];

        if (input.gender === "men") {
          const clothingItems = colorMatched
            .filter((p: any) => p.subcategory !== "accessories")
            .slice(0, 5);
          const accessoryItems = allProducts.filter((p: any) => {
            if (p.subcategory !== "accessories") return false;
            return (p.colors as string[])?.some((c) =>
              metalTokens.some((m) => c.toLowerCase().includes(m))
            );
          }).slice(0, 3);
          recommendedProducts = [...clothingItems, ...accessoryItems];
        } else {
          recommendedProducts = colorMatched.slice(0, 9);
        }

        // Fallback: if color matching yields nothing, use top-scored or first products
        if (recommendedProducts.length === 0) {
          recommendedProducts = allProducts.slice(0, input.gender === "men" ? 8 : 9);
        }

        // Non-fatal — if DB is unavailable the analysis results still return to the user
        saveAIRecommendation(ctx.user.id, analysisData, recommendedProducts).catch(
          (e) => console.warn("[AI Stylist] Could not save recommendation to DB:", e.message),
        );

        return {
          success: true,
          analysis: analysisData,
          recommendations: recommendedProducts,
          detectedGender: analysisData.detectedGender,
          genderMismatch,
        };
      }),

    outfitBuilder: protectedProcedure
      .input(z.object({
        gender: z.enum(["men", "women"]),
        occasion: z.string(),
        palette: z.string(),
        budget: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are StyleAI, a luxury personal fashion stylist. 
        Create a complete outfit (Top, Bottom, Shoes, Accessory) based on:
        Occasion: ${input.occasion}
        Palette: ${input.palette}
        Budget: ${input.budget}
        Return ONLY JSON with "explanation" and "items" (array of subcategory names like ["Shirts", "Pants", "Shoes", "Accessories"]).`;

        const allProducts = await getProducts(input.gender, 100, 0);

        const rawText = await askGeminiText(systemPrompt);

        // Graceful fallback when Gemini is unavailable or rate-limited
        if (!rawText) {
          const fallbackItems = allProducts.slice(0, 4);
          return {
            explanation: "Here's a curated selection that suits your style and occasion perfectly.",
            items: fallbackItems,
          };
        }

        let content: { explanation: string; items: string[] };
        try {
          const cleaned = rawText.replace(/```json|```/gi, "").trim();
          content = JSON.parse(cleaned);
        } catch {
          const fallbackItems = allProducts.slice(0, 4);
          return {
            explanation: rawText.split("\n")[0] || "A curated look for your occasion.",
            items: fallbackItems,
          };
        }

        const selectedItems = (content.items ?? []).map((sub: string) =>
          allProducts.find((p) => p.subcategory.toLowerCase() === sub.toLowerCase()),
        ).filter(Boolean);

        return {
          explanation: content.explanation,
          items: selectedItems,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
