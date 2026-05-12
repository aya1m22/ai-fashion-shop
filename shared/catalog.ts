// Shared product catalog — imported by both the backend (db.ts) and the frontend
// (static fallback when the backend is unreachable, e.g. GitHub Pages).

export interface CatalogProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  gender: "men" | "women";
  subcategory: string;
  imageUrl: string;
  sizes: string[];
  colors: string[];
  colorStock: Record<string, number>;
  styleTags: string[];
  stock: number;
}

const shoeSizes = ["6", "7", "8", "9", "10", "11", "12"];
const apparelSizes = ["XS", "S", "M", "L", "XL"];
const ringSizes = ["6", "7", "8", "9", "10", "11", "12"];

const makeProduct = (
  id: number,
  name: string,
  description: string,
  price: string,
  gender: "men" | "women",
  subcategory: string,
  imageUrl: string,
  sizes: string[],
  colorStock: Record<string, number>,
  styleTags: string[],
): CatalogProduct => {
  const stock = Object.values(colorStock).reduce((sum, count) => sum + count, 0);
  return { id, name, description, price, gender, subcategory, imageUrl, sizes, colors: Object.keys(colorStock), colorStock, styleTags, stock };
};

export const initialCatalog: CatalogProduct[] = [
  // ─── WOMEN'S DRESSES ───────────────────────────────────────────────────────
  makeProduct(1001, "Satin Evening Dress", "Flowing satin dress perfect for formal events and evening dinners. Features a sleek silhouette with a subtle sheen.", "119.00", "women", "dresses", "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80", apparelSizes, { Black: 4, Emerald: 3, Burgundy: 2 }, ["elegant", "formal", "evening"]),
  makeProduct(1002, "Minimal Chic Wrap Dress", "Soft wrap-style dress with a flattering silhouette for everyday elegance. Lightweight fabric with a relaxed drape.", "98.00", "women", "dresses", "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80", apparelSizes, { Black: 4, Beige: 3, White: 2 }, ["minimal", "casual", "daywear"]),
  makeProduct(1003, "Floral Midi Dress", "Romantic floral print midi dress with puff sleeves. Ideal for brunches, garden parties, and summer outings.", "87.00", "women", "dresses", "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80", apparelSizes, { Pink: 4, Blue: 3, White: 2 }, ["romantic", "floral", "summer"]),
  makeProduct(1004, "Bodycon Cocktail Dress", "Sleek bodycon dress with ruched detailing. Perfect for cocktail parties and night events.", "105.00", "women", "dresses", "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80", apparelSizes, { Black: 5, Red: 3, Navy: 2 }, ["cocktail", "night-out", "fitted"]),
  makeProduct(1005, "Boho Maxi Dress", "Flowy bohemian maxi dress with tiered skirt and embroidered neckline. Great for beach and festival looks.", "92.00", "women", "dresses", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80", apparelSizes, { White: 4, Terracotta: 3, Sage: 2 }, ["boho", "maxi", "festival"]),
  // ─── WOMEN'S SHIRTS ────────────────────────────────────────────────────────
  makeProduct(1006, "Classic Button Blouse", "Crisp cotton blouse with a classic button-down front. Versatile for office and smart-casual outfits.", "54.00", "women", "shirts", "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&q=80", apparelSizes, { White: 5, Blue: 4, Black: 3 }, ["office", "classic", "smart-casual"]),
  makeProduct(1007, "Striped Ruffle Top", "Lightweight striped top with feminine ruffle details at the neckline. Easy to style with jeans or trousers.", "46.00", "women", "shirts", "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600&q=80", apparelSizes, { Navy: 4, White: 3, Black: 2 }, ["trendy", "daywear", "feminine"]),
  makeProduct(1008, "Linen Relaxed Shirt", "Breathable linen shirt with a relaxed fit. Perfect for warm days and casual weekend styling.", "61.00", "women", "shirts", "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600&q=80", apparelSizes, { Beige: 4, White: 3, Olive: 2 }, ["linen", "casual", "summer"]),
  makeProduct(1009, "Satin Cami Top", "Luxurious satin cami with adjustable straps. Pairs beautifully with blazers or high-waisted pants.", "42.00", "women", "shirts", "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?w=600&q=80", apparelSizes, { Champagne: 4, Black: 4, Blush: 3 }, ["satin", "elegant", "layering"]),
  // ─── WOMEN'S PANTS ─────────────────────────────────────────────────────────
  makeProduct(1010, "High-Waist Tailored Trousers", "Structured high-waist trousers with a straight-leg cut. A wardrobe essential for polished looks.", "79.00", "women", "pants", "https://images.unsplash.com/photo-1594938374182-a57d3b792a26?w=600&q=80", apparelSizes, { Black: 5, Camel: 3, Gray: 3 }, ["tailored", "office", "classic"]),
  makeProduct(1011, "Wide-Leg Palazzo Pants", "Flowing wide-leg palazzo pants in a lightweight fabric. Effortlessly chic for both casual and dressy occasions.", "72.00", "women", "pants", "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&q=80", apparelSizes, { White: 4, Black: 4, Beige: 3 }, ["palazzo", "wide-leg", "chic"]),
  makeProduct(1012, "Slim Fit Denim Jeans", "Classic slim-fit jeans with a modern mid-rise waist. Versatile staple for any casual outfit.", "68.00", "women", "pants", "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80", apparelSizes, { Blue: 5, Black: 4, Stone: 2 }, ["denim", "casual", "everyday"]),
  // ─── WOMEN'S PAJAMAS ───────────────────────────────────────────────────────
  makeProduct(1013, "Silk Pajama Set", "Luxurious silk-feel pajama set with piped trim. Includes long-sleeve top and matching pants for ultimate comfort.", "89.00", "women", "pajamas", "https://images.unsplash.com/photo-1620803450257-27038e8cb573?w=600&q=80", apparelSizes, { Ivory: 4, Blush: 3, Navy: 3 }, ["silk", "luxury", "sleepwear"]),
  makeProduct(1014, "Cotton Floral Pajamas", "Soft cotton pajama set with a delicate floral print. Breathable and comfortable for all-night wear.", "58.00", "women", "pajamas", "https://images.unsplash.com/photo-1551806235-a05a8286a0fb?w=600&q=80", apparelSizes, { Pink: 4, Blue: 3, White: 3 }, ["cotton", "floral", "comfort"]),
  makeProduct(1015, "Satin Shorts Pajama Set", "Elegant satin pajama set with shorts and a button-up top. Perfect for warm nights.", "65.00", "women", "pajamas", "https://images.unsplash.com/photo-1583846665766-3d60742f59fa?w=600&q=80", apparelSizes, { Champagne: 4, Black: 3, Lilac: 2 }, ["satin", "shorts", "summer-sleep"]),
  // ─── WOMEN'S BAGS ──────────────────────────────────────────────────────────
  makeProduct(1016, "Structured Leather Tote", "Premium structured tote bag in genuine leather. Spacious interior with multiple pockets for organized carry.", "189.00", "women", "bags", "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80", ["One Size"], { Black: 5, Tan: 4, Burgundy: 2 }, ["tote", "leather", "work"]),
  makeProduct(1017, "Mini Crossbody Bag", "Compact crossbody bag with a chain strap. Fits essentials and elevates any evening or casual look.", "95.00", "women", "bags", "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80", ["One Size"], { Black: 5, Beige: 4, Pink: 3 }, ["crossbody", "mini", "evening"]),
  makeProduct(1018, "Woven Straw Bucket Bag", "Handwoven straw bucket bag with leather handles. A summer staple for beach and resort looks.", "72.00", "women", "bags", "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80", ["One Size"], { Natural: 5, Black: 3 }, ["straw", "summer", "bucket"]),
  makeProduct(1019, "Quilted Chain Shoulder Bag", "Classic quilted shoulder bag with gold-tone chain strap. Timeless elegance for any occasion.", "145.00", "women", "bags", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80", ["One Size"], { Black: 5, Beige: 3, White: 2 }, ["quilted", "chain", "classic"]),
  // ─── WOMEN'S ACCESSORIES ───────────────────────────────────────────────────
  makeProduct(1020, "Pearl Drop Earrings", "Elegant freshwater pearl drop earrings with gold-tone settings. Perfect for formal and everyday wear.", "38.00", "women", "accessories", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80", ["One Size"], { White: 5, Blush: 3 }, ["pearl", "earrings", "elegant"]),
  makeProduct(1021, "Layered Gold Necklace", "Delicate layered necklace set with fine gold-tone chains. Adds a refined touch to any neckline.", "52.00", "women", "accessories", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80", ["One Size"], { Gold: 5, Silver: 4 }, ["necklace", "layered", "gold"]),
  makeProduct(1022, "Silk Hair Scarf", "Luxurious silk-feel hair scarf with a vibrant print. Wear as a headband, hair tie, or neck accessory.", "28.00", "women", "accessories", "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80", ["One Size"], { Multicolor: 4, Black: 3, Ivory: 3 }, ["scarf", "silk", "hair"]),
  makeProduct(1023, "Leather Belt", "Classic leather belt with a polished buckle. Completes tailored and casual outfits alike.", "44.00", "women", "accessories", "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80", ["XS", "S", "M", "L"], { Black: 5, Tan: 4, White: 2 }, ["belt", "leather", "classic"]),
  // ─── WOMEN'S SHOES ─────────────────────────────────────────────────────────
  makeProduct(1024, "Strappy Heeled Sandals", "Elegant strappy sandals with a block heel. Comfortable enough for all-day wear with a sophisticated finish.", "112.00", "women", "shoes", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80", shoeSizes, { Black: 4, Nude: 4, Silver: 2 }, ["heels", "sandals", "formal"]),
  makeProduct(1025, "White Leather Sneakers", "Clean white leather sneakers with a cushioned sole. The ultimate casual-chic footwear staple.", "89.00", "women", "shoes", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", shoeSizes, { White: 5, Black: 4, Beige: 2 }, ["sneakers", "casual", "white"]),
  makeProduct(1026, "Pointed-Toe Kitten Heels", "Refined pointed-toe kitten heels in smooth leather. Perfect for office and smart-casual dressing.", "98.00", "women", "shoes", "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=600&q=80", shoeSizes, { Black: 5, Nude: 3, Red: 2 }, ["kitten-heel", "pointed", "office"]),
  makeProduct(1027, "Suede Ankle Boots", "Chic suede ankle boots with a stacked heel. Versatile for autumn and winter styling.", "135.00", "women", "shoes", "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80", shoeSizes, { Camel: 4, Black: 4, Gray: 2 }, ["boots", "suede", "ankle"]),
  makeProduct(1028, "Espadrille Wedge Sandals", "Classic espadrille wedge sandals with a jute platform. Effortless summer style with added height.", "76.00", "women", "shoes", "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80", shoeSizes, { Natural: 4, Black: 4, White: 2 }, ["espadrille", "wedge", "summer"]),
  // ─── MEN'S SHIRTS ──────────────────────────────────────────────────────────
  makeProduct(2001, "Oxford Button-Down Shirt", "Classic Oxford weave button-down shirt. A timeless wardrobe staple for smart-casual and business-casual looks.", "64.00", "men", "shirts", "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80", apparelSizes, { White: 5, Blue: 4, Black: 3 }, ["oxford", "classic", "smart-casual"]),
  makeProduct(2002, "Linen Summer Shirt", "Lightweight linen shirt with a relaxed fit. Breathable and stylish for warm weather and travel.", "57.00", "men", "shirts", "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80", apparelSizes, { Beige: 4, White: 4, Olive: 3 }, ["linen", "summer", "casual"]),
  makeProduct(2003, "Slim Fit Dress Shirt", "Tailored slim-fit dress shirt in premium cotton. Perfect for formal occasions and business meetings.", "72.00", "men", "shirts", "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80", apparelSizes, { White: 5, Light_Blue: 4, Gray: 2 }, ["formal", "slim-fit", "dress"]),
  makeProduct(2004, "Graphic Print Tee", "Premium cotton graphic tee with a modern print. Casual and expressive for everyday streetwear.", "38.00", "men", "shirts", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", apparelSizes, { Black: 5, White: 4, Gray: 3 }, ["graphic", "streetwear", "casual"]),
  makeProduct(2005, "Flannel Check Shirt", "Soft flannel shirt in a classic check pattern. Ideal for layering in autumn and winter.", "58.00", "men", "shirts", "https://images.unsplash.com/photo-1588359348347-9bc6cbbb689e?w=600&q=80", apparelSizes, { Red: 4, Blue: 4, Green: 3 }, ["flannel", "check", "layering"]),
  // ─── MEN'S PANTS ───────────────────────────────────────────────────────────
  makeProduct(2006, "Slim Tapered Chinos", "Modern slim-tapered chinos in a stretch-cotton blend. Versatile for smart-casual and weekend wear.", "69.00", "men", "pants", "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80", apparelSizes, { Khaki: 5, Navy: 4, Black: 4 }, ["chinos", "slim", "smart-casual"]),
  makeProduct(2007, "Classic Denim Jeans", "Well-crafted straight-leg denim jeans with a comfortable mid-rise. A timeless everyday essential.", "74.00", "men", "pants", "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80", apparelSizes, { Blue: 5, Black: 4, Stone: 2 }, ["denim", "straight-leg", "classic"]),
  makeProduct(2008, "Tailored Dress Trousers", "Sharp tailored trousers in a wool-blend fabric. Essential for formal and business attire.", "89.00", "men", "pants", "https://images.unsplash.com/photo-1594938374182-a57d3b792a26?w=600&q=80", apparelSizes, { Charcoal: 4, Black: 5, Navy: 3 }, ["tailored", "formal", "dress"]),
  makeProduct(2009, "Cargo Utility Pants", "Durable cargo pants with multiple pockets and a relaxed fit. Functional and stylish for outdoor and casual wear.", "62.00", "men", "pants", "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80", apparelSizes, { Olive: 5, Black: 4, Khaki: 3 }, ["cargo", "utility", "outdoor"]),
  // ─── MEN'S PAJAMAS ─────────────────────────────────────────────────────────
  makeProduct(2010, "Cotton Lounge Set", "Soft cotton lounge set with elastic waistband and drawstring. Comfortable for home wear and relaxed evenings.", "52.00", "men", "pajamas", "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&q=80", apparelSizes, { Navy: 4, Gray: 4, Black: 3 }, ["cotton", "lounge", "comfort"]),
  makeProduct(2011, "Flannel Pajama Set", "Warm flannel pajama set with a classic plaid pattern. Perfect for cold nights and weekend mornings.", "58.00", "men", "pajamas", "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80", apparelSizes, { Blue: 4, Red: 3, Gray: 3 }, ["flannel", "plaid", "winter-sleep"]),
  makeProduct(2012, "Lightweight Shorts Pajama Set", "Breathable shorts and tee pajama set for warm nights. Minimal design with maximum comfort.", "44.00", "men", "pajamas", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", apparelSizes, { White: 4, Black: 4, Gray: 3 }, ["shorts", "summer-sleep", "lightweight"]),
  // ─── MEN'S SHOES ───────────────────────────────────────────────────────────
  makeProduct(2013, "Leather Oxford Shoes", "Classic leather Oxford shoes with a Goodyear-welted sole. The definitive formal footwear for any dress code.", "148.00", "men", "shoes", "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80", shoeSizes, { Black: 5, Brown: 4, Tan: 2 }, ["oxford", "leather", "formal"]),
  makeProduct(2014, "White Leather Sneakers", "Minimalist white leather sneakers with a clean profile. Versatile for casual and smart-casual outfits.", "95.00", "men", "shoes", "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80", shoeSizes, { White: 5, Black: 4, Gray: 2 }, ["sneakers", "white", "minimal"]),
  makeProduct(2015, "Chelsea Boots", "Sleek Chelsea boots in premium leather with elastic side panels. Effortlessly stylish for any season.", "135.00", "men", "shoes", "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80", shoeSizes, { Black: 5, Brown: 4, Tan: 2 }, ["chelsea", "boots", "leather"]),
  makeProduct(2016, "Suede Desert Boots", "Casual suede desert boots with a crepe rubber sole. Perfect for relaxed weekend and smart-casual styling.", "112.00", "men", "shoes", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=600&q=80", shoeSizes, { Sand: 4, Brown: 4, Black: 3 }, ["desert", "suede", "casual"]),
  makeProduct(2017, "Running Sneakers", "High-performance running sneakers with advanced cushioning. Engineered for comfort during workouts and daily wear.", "119.00", "men", "shoes", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80", shoeSizes, { Black: 5, White: 4, Blue: 3 }, ["running", "sport", "performance"]),
  // ─── MEN'S ACCESSORIES — WATCHES ──────────────────────────────────────────
  makeProduct(2018, "Classic Gold Watch", "Refined dress watch with a gold-tone stainless steel case and leather strap.", "189.00", "men", "accessories", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", ["One Size"], { Gold: 5 }, ["watch", "gold", "dress", "formal"]),
  makeProduct(2019, "Silver Minimalist Watch", "Clean silver-tone watch with a slim profile and mesh bracelet.", "169.00", "men", "accessories", "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600&q=80", ["One Size"], { Silver: 5 }, ["watch", "silver", "minimal", "cool-tone"]),
  makeProduct(2020, "Matte Black Sport Watch", "Bold matte-black watch with a sport-style rubber strap.", "155.00", "men", "accessories", "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600&q=80", ["One Size"], { Black: 5 }, ["watch", "black", "sport", "bold"]),
  makeProduct(2021, "White Ceramic Watch", "Striking white ceramic watch with a high-contrast dial.", "175.00", "men", "accessories", "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600&q=80", ["One Size"], { White: 5 }, ["watch", "white", "ceramic", "statement"]),
  // ─── MEN'S ACCESSORIES — RINGS ─────────────────────────────────────────────
  makeProduct(2022, "Gold Signet Ring", "Classic gold signet ring with a polished face. A heritage-inspired accessory for confident styling.", "89.00", "men", "accessories", "https://images.unsplash.com/photo-1610384462494-06c8ba87d60f?w=600&q=80", ringSizes, { Gold: 5 }, ["ring", "gold", "signet", "heritage"]),
  makeProduct(2023, "Silver Band Ring", "Sleek silver band ring with a brushed finish. Minimal and versatile.", "65.00", "men", "accessories", "https://images.unsplash.com/photo-1509315703195-529879416a7d?w=600&q=80", ringSizes, { Silver: 5 }, ["ring", "silver", "band", "minimal"]),
  makeProduct(2024, "Black Tungsten Ring", "Durable black tungsten ring with a high-polish finish.", "79.00", "men", "accessories", "https://images.unsplash.com/photo-1605342939943-34e2c842b03e?w=600&q=80", ringSizes, { Black: 5 }, ["ring", "black", "tungsten", "bold"]),
  makeProduct(2025, "White Gold Ring", "Elegant white gold-tone ring with a clean geometric profile.", "72.00", "men", "accessories", "https://images.unsplash.com/photo-1543209520-22c9e782bcbe?w=600&q=80", ringSizes, { White: 5 }, ["ring", "white", "geometric", "elegant"]),
];

export const catalogById = new Map(initialCatalog.map((p) => [p.id, p]));
