import "dotenv/config";
/**
 * Database Seed Script
 * Run with: npm run db:seed
 * 
 * This script populates the database with the initial product catalog.
 * It clears existing products and inserts fresh data from catalog.ts.
 */
import { getDb } from "./db";
import { products } from "../drizzle/schema";
import { initialCatalog } from "./catalog";
import { eq } from "drizzle-orm";
import { users } from "../drizzle/schema";

async function seed() {
  console.log("🌱 Starting database seed...");

  const db = await getDb();
  if (!db) {
    console.error("❌ Could not connect to database. Make sure DATABASE_URL is set.");
    process.exit(1);
  }

  try {
    // Clear existing products
    await db.delete(products);
    console.log("✓ Cleared existing products");

    // Insert catalog products
    let inserted = 0;
    for (const item of initialCatalog) {
      await db.insert(products).values({
        name: item.name,
        description: item.description,
        price: item.price,
        gender: item.gender,
        subcategory: item.subcategory,
        imageUrl: item.imageUrl,
        sizes: item.sizes,
        colors: item.colors,
        colorStock: item.colorStock,
        styleTags: item.styleTags,
        stock: item.stock,
      });
      inserted++;
    }

    console.log(`✓ Inserted ${inserted} products`);

    // Add an Admin user
    await db.delete(users);
    await db.insert(users).values({
      openId: "mock-admin-id",
      name: "Admin User",
      email: "admin@styleai.com",
      loginMethod: "mock",
      role: "admin",
    });
    console.log("✓ Created Admin user (mock-admin-id)");

    console.log("✅ Database seed complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
