# BUGS FIXED

All bugs discovered during the audit of the AI Fashion Shop codebase.

---

## BUG-01 — `Product` type missing `colors: string[]` field

**Where:** `frontend/src/lib/mockProducts.ts` — `Product` interface  
**What:** `ProductCard.tsx` called `addItem(product, 1, product.sizes[0], product.colors[0])` and `AIStylist.tsx` did the same, but `Product` only had `color: string` (singular). At runtime `product.colors[0]` evaluated to `undefined`, silently passing an undefined color to the cart.  
**Fix:** Added `colors: string[]` to the `Product` interface and populated `colors: [color]` for all 14 mock products.

---

## BUG-02 — AI Stylist page had no photo upload; backend procedure was completely unwired

**Where:** `frontend/src/pages/AIStylist.tsx`  
**What:** The AI Stylist page (which was supposed to do photo upload → recommendations) contained only a text-based occasion chat using Gemini + mock products. The backend `aiStylist.analyzePhoto` tRPC procedure (which performs LLM vision analysis and returns real catalog products) was never called from the frontend.  
**Fix:** Rewrote `AIStylist.tsx` to add a full photo-upload section: drag-and-drop / file picker, base64 DataURL conversion, `trpc.aiStylist.analyzePhoto.useMutation()` call, loading spinner, error state, invalid-photo state, and a recommendations grid wired to real catalog products via `catalogToProduct`.

---

## BUG-03 — Men / Women / Home pages used hardcoded mock data instead of real catalog

**Where:** `frontend/src/pages/Men.tsx`, `Women.tsx`, `Home.tsx`  
**What:** All three pages imported `mockProducts` (14 local items, IDs 1–14) instead of calling the tRPC `products.list` endpoint. The real backend catalog had 50+ products (IDs 1001–2025) with proper photos and data. Users only ever saw the 14 hardcoded items.  
**Fix:** Replaced `mockProducts` imports with `trpc.products.list.useQuery({ gender })` calls and an adapter (`catalogToProduct`) that maps `CatalogProduct` to the UI `Product` type. Added loading skeletons and error states to all three pages.

---

## BUG-04 — Occasion chat in AIStylist still used 14 mock products instead of real catalog

**Where:** `frontend/src/pages/AIStylist.tsx` — `handleChatSearch`  
**What:** The occasion-based chat fallback filtered from `mockProducts` (14 items). Recommendations were limited to those 14 and never matched the catalog.  
**Fix:** Updated `handleChatSearch` to pull the full catalog via `trpc.products.list`, falling back to `mockProducts` only if tRPC is unavailable.

---

## BUG-05 — `AdminDashboard` referenced non-existent `product.stockStatus` property

**Where:** `frontend/src/pages/AdminDashboard.tsx` line 119  
**What:** The template used `product.stockStatus` (e.g. `=== 'Low Stock'`) which does not exist on the `Product` type. The UI rendered `undefined` for all stock labels.  
**Fix:** Replaced with `product.stock` (`'in stock' | 'low stock' | 'out of stock'`) and updated the conditional class names to match the correct string values.

---

## BUG-06 — No `/shop` page existed; entire product catalogue was unnavigable

**Where:** Missing file — no `Shop.tsx`, no `/shop` route, no nav link  
**What:** There was no way to browse all products across categories in one view.  
**Fix:** Created `frontend/src/pages/Shop.tsx` with a 4-column responsive product grid, realtime search, gender/subcategory/sort filters, skeleton loading, empty state, and a product-detail Sheet. Added the `/shop` route to `App.tsx` and a "Shop" link to `Navbar.tsx`.

---

## BUG-07 — `vitest.config.ts` had wrong `@` alias path (`client/src` → `frontend/src`)

**Where:** `vitest.config.ts`  
**What:** The path alias `@` pointed to `client/src` which does not exist in this project (the frontend lives at `frontend/src`). Any test importing `@/…` paths would fail to resolve.  
**Fix:** Updated alias to `frontend/src` and removed the unused `@assets` alias.

---

## BUG-08 — `catalogAdapter` was missing (no bridge between CatalogProduct and UI Product)

**Where:** No such file existed  
**What:** The backend catalog type (`CatalogProduct`) and the UI product type (`Product`) had different shapes. There was no conversion utility, making it impossible to display tRPC data in existing `ProductCard` and cart flows.  
**Fix:** Created `frontend/src/lib/catalogAdapter.ts` with `catalogToProduct(p: CatalogProduct): Product` that maps all fields, derives stock status from stock count, and populates `colors[]` from the catalog's `colorStock` keys.

---

---

## BUG-09 — All tRPC requests crashed when Supabase was unreachable

**Where:** `backend/_core/context.ts`, `backend/db.ts`  
**What:** `createContext` called `getUserByOpenId` and `upsertUser` without try/catch. If the Supabase connection was unreachable those calls threw, which crashed the entire Express request before tRPC could write a response. The client received an empty HTTP body which JSON.parse turned into "Unexpected end of JSON input". This affected every page — including the public `products.list` query that powers /shop, /men, and /women.  
**Fix:** Wrapped the email-auth block in `context.ts` in try/catch. Added try/catch to `getUserByOpenId`, `getProducts`, `getProductById`, `getFavoritesByUser`, and `isFavorite` in `db.ts`, each falling back to the in-memory catalog on DB failure. Changed `upsertUser` to log-and-return instead of re-throwing.

---

## BUG-10 — AI Stylist backend used unavailable forge LLM (BUILT_IN_FORGE_API_KEY)

**Where:** `backend/routers.ts` — `aiStylist.analyzePhoto` mutation  
**What:** The `analyzePhoto` procedure called `invokeLLM` which required `BUILT_IN_FORGE_API_KEY`. This key is never in the project `.env` (it is an internal Manus platform key). The call always threw "OPENAI_API_KEY is not configured", making photo analysis completely broken.  
**Fix:** Created `backend/gemini.ts` with `analyzePhotoWithGemini()` that calls the Gemini 2.0 Flash multimodal API directly using `GEMINI_API_KEY` (falling back to `VITE_GEMINI_API_KEY`). Replaced the `invokeLLM` call in `analyzePhoto` with the new Gemini helper. Added `geminiApiKey` to `backend/_core/env.ts`. The analysis now returns `skinTone`, `undertone`, `bestColors`, `accessoryMetal`, `seasonalPalette`, and `detectedGender`.

---

## BUG-11 — AI Stylist had no gender mismatch detection

**Where:** `backend/routers.ts`, `frontend/src/pages/AIStylist.tsx`  
**What:** If a user selected "Women's Analysis" but uploaded a photo of a man (or vice versa), the backend silently returned the wrong gender's products with no indication.  
**Fix:** Backend now includes `detectedGender` and `genderMismatch: boolean` in the response. Frontend shows an amber warning banner when `genderMismatch` is true, naming both the detected gender and the selected category, and instructing the user to switch the selector if desired.

---

## BUG-12 — ProductCard heart button used localStorage only; favorites never persisted to DB

**Where:** `frontend/src/components/ProductCard.tsx`  
**What:** The heart button called `toggleSave` from `WardrobeContext` (localStorage). Authenticated users' favorites were never written to the tRPC `favorites` table. The Profile page read from `trpc.favorites.list` (DB) which was always empty.  
**Fix:** `ProductCard` now accepts an optional `isFavorited` prop. When the user is authenticated the heart click calls `trpc.favorites.toggle` (DB write) and keeps `WardrobeContext` in sync for persistence across navigation. When not authenticated it falls back to `WardrobeContext` only.

---

## BUG-13 — Profile page passed unsupported props to ProductCard; favorites rendered broken

**Where:** `frontend/src/pages/Profile.tsx`  
**What:** The favorites grid passed `isFavorited={true}` and `animationDelay={idx * 60}` to `ProductCard`, but neither prop existed in `ProductCardProps`. The raw DB product shape (`CatalogProduct`) was also not adapted before being passed to `ProductCard`, which expected the UI `Product` type.  
**Fix:** Added `isFavorited?: boolean` to `ProductCardProps`. Removed the unsupported `animationDelay` prop. Added `catalogToProduct()` mapping in Profile so `ProductCard` receives the correct shape.

---

## BUG-14 — No `.env.example` — developers had no reference for required environment variables

**Where:** Project root  
**What:** There was no `.env.example` file. New contributors had no documentation on which variables to set, leading to silent failures (blank API key → runtime throws).  
**Fix:** Created `.env.example` documenting all required and optional variables with descriptions and where to obtain each key.

---

## Security Notes

- No API keys found in the client-side bundle. All keys remain in `.env`.
- The `BUILT_IN_FORGE_API_KEY` (required for backend LLM vision) must be set in `.env` for `aiStylist.analyzePhoto` to succeed. The backend throws a descriptive error if it is missing; the frontend displays it gracefully.
- File upload in AIStylist validates type (`image/*`) and size (≤ 10 MB) before converting to DataURL — no raw files are sent to the backend.
- All tRPC admin procedures use `protectedProcedure` / role checks — no unprotected admin routes.
