-- ============================================================
-- Migration: Enable Row-Level Security on all public tables
-- Run this in the Supabase SQL Editor:
--   https://supabase.com/dashboard/project/kijcetovxxvqnrrlneaa/sql
-- ============================================================

-- 1. Enable RLS on every table
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories           ENABLE ROW LEVEL SECURITY;
ALTER TABLE products             ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites            ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews              ENABLE ROW LEVEL SECURITY;

-- 2. Public catalogue: anyone may read products, categories, images, reviews
--    (the store front needs these to be browsable without login)
CREATE POLICY "products_public_read"
  ON products FOR SELECT USING (true);

CREATE POLICY "categories_public_read"
  ON categories FOR SELECT USING (true);

CREATE POLICY "product_images_public_read"
  ON product_images FOR SELECT USING (true);

CREATE POLICY "reviews_public_read"
  ON reviews FOR SELECT USING (true);

-- 3. All other tables (users, cart, orders, favorites, ai_recommendations,
--    user_profiles, order_items) have NO anon policies — only the backend's
--    service-role / postgres connection (which bypasses RLS) may access them.
--    This prevents anyone from reading private data via the Supabase REST API.

-- ============================================================
-- NOTE: Your backend uses DATABASE_URL with the postgres/service-role
-- credentials which bypass RLS, so no backend queries are affected.
-- ============================================================
