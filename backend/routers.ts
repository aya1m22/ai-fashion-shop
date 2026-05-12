import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
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
        const isMen = input.gender === "men";

        const systemPrompt = "You are StyleAI, a luxury personal fashion stylist assistant. Help users find outfits, suggest combinations, advise on trends, and recommend products from the store. Be warm, stylish, and confident. Analyze the provided photo and return color recommendations. Return ONLY valid JSON matching the schema.";

        const userPrompt = isMen
          ? `Analyze this photo and return color recommendations for men's clothing, watches, and rings based on the detected skin tone.`
          : `Analyze this photo and return fashion recommendations including skin tone, body shape, style preference, and color recommendations.`;

        const responseSchema = isMen
          ? {
              type: "json_schema",
              json_schema: {
                name: "men_color_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    isValid: { type: "boolean", description: "Whether skin tone was detectable" },
                    message: { type: "string", description: "Status message or error reason" },
                    skinTone: { type: "string", description: "Detected skin tone category: warm, cool, neutral, or deep" },
                    clothingColors: { type: "array", items: { type: "string" }, description: "Recommended clothing colors for this skin tone" },
                    watchColors: { type: "array", items: { type: "string" }, description: "Recommended watch metal colors: Gold, Silver, Black, White" },
                    ringColors: { type: "array", items: { type: "string" }, description: "Recommended ring metal colors: Gold, Silver, Black, White" },
                  },
                  required: ["isValid", "message", "skinTone", "clothingColors", "watchColors", "ringColors"],
                  additionalProperties: false,
                },
              },
            }
          : {
              type: "json_schema",
              json_schema: {
                name: "women_style_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    isValid: { type: "boolean" },
                    message: { type: "string" },
                    skinTone: { type: "string" },
                    bodyShape: { type: "string" },
                    stylePreference: { type: "string" },
                    colorRecommendations: { type: "array", items: { type: "string" } },
                  },
                  required: ["isValid", "message", "skinTone", "bodyShape", "stylePreference", "colorRecommendations"],
                  additionalProperties: false,
                },
              },
            };

        let analysisData: any;
        try {
          const llmResult = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: input.imageUrl, detail: "high" } },
                  { type: "text", text: userPrompt + "\n\nYou MUST return ONLY valid JSON matching this schema:\n" + JSON.stringify(responseSchema) },
                ],
              },
            ],
            responseFormat: { type: "json_object" },
          });
          const content = llmResult?.choices?.[0]?.message?.content;
          analysisData = typeof content === "string" ? JSON.parse(content) : content;
        } catch (err) {
          console.error("[AI Stylist] LLM error:", err);
          throw new Error("Failed to analyze photo. Please try again with a clear photo.");
        }

        if (!analysisData?.isValid) {
          return {
            success: false,
            error: analysisData?.message || "Could not detect skin tone. Please upload a clear photo with visible skin.",
            analysis: null,
            recommendations: [],
          };
        }

        const allProducts = await getProducts(input.gender, 200, 0);
        let recommendedProducts: any[] = [];

        if (isMen) {
          const clothingColors: string[] = (analysisData.clothingColors || []).map((c: string) => c.toLowerCase());
          const watchColors: string[] = (analysisData.watchColors || []).map((c: string) => c.toLowerCase());
          const ringColors: string[] = (analysisData.ringColors || []).map((c: string) => c.toLowerCase());

          const clothingItems = allProducts.filter((p: any) => {
            if (p.subcategory === "accessories") return false;
            return p.colors?.some((c: string) => clothingColors.includes(c.toLowerCase()));
          }).slice(0, 6);

          const watchItems = allProducts.filter((p: any) =>
            p.subcategory === "accessories" && p.styleTags?.includes("watch") &&
            p.colors?.some((c: string) => watchColors.includes(c.toLowerCase()))
          ).slice(0, 2);

          const ringItems = allProducts.filter((p: any) =>
            p.subcategory === "accessories" && p.styleTags?.includes("ring") &&
            p.colors?.some((c: string) => ringColors.includes(c.toLowerCase()))
          ).slice(0, 2);

          recommendedProducts = [...clothingItems, ...watchItems, ...ringItems];
        } else {
          const recColors: string[] = (analysisData.colorRecommendations || []).map((c: string) => c.toLowerCase());
          recommendedProducts = allProducts.filter((p: any) =>
            p.colors?.some((c: string) => recColors.includes(c.toLowerCase()))
          ).slice(0, 9);
        }

        await saveAIRecommendation(ctx.user.id, analysisData, recommendedProducts);

        return {
          success: true,
          analysis: analysisData,
          recommendations: recommendedProducts,
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

        const llmResult = await invokeLLM({
          messages: [{ role: "system", content: systemPrompt }],
          response_format: { type: "json_object" }
        });
        
        const content = JSON.parse(llmResult.choices[0].message.content as string);
        
        const allProducts = await getProducts(input.gender, 100, 0);
        const selectedItems = content.items.map((sub: string) => {
          return allProducts.find(p => p.subcategory.toLowerCase() === sub.toLowerCase());
        }).filter(Boolean);

        return {
          explanation: content.explanation,
          items: selectedItems
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
