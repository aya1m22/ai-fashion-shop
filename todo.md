# AI Fashion Shop - TODO

## Database & Backend
- [x] Products table with gender, subcategory, colorStock (JSON), sizes (JSON), imageUrl, stock
- [x] Favorites table (userId, productId)
- [x] Cart items table
- [x] Orders table
- [x] Catalog data: Women's subcategories (Dresses, Shirts, Pants, Pajamas, Bags, Accessories, Shoes) with Pinterest images
- [x] Catalog data: Men's subcategories (Shirts, Pants, Pajamas, Shoes, Accessories) with Pinterest images
- [x] Men's accessories: Watches (Gold, Silver, Black, White) + Rings (Gold, Silver, Black, White)
- [x] Shoe sizes numeric (6-12) for both genders
- [x] tRPC router: products.list (filter by gender + subcategory)
- [x] tRPC router: products.getById
- [x] tRPC router: products.updateInventory (admin)
- [x] tRPC router: cart (add, remove, update, list)
- [x] tRPC router: favorites (toggle, list, isFavorite)
- [x] tRPC router: aiStylist.analyzePhoto (vision LLM, men=color only)
- [x] tRPC router: orders (create, list)

## Frontend Pages
- [x] Global layout with top navigation (logo, Men, Women, AI Stylist, Cart, Profile/Login)
- [x] Home page: hero, featured categories, featured products
- [x] Women page: professional filter sidebar (subcategory pills, price slider, color swatches), product grid
- [x] Men page: professional filter sidebar, product grid (strict gender separation)
- [x] ProductDetail page: color buttons (red + disabled when stock=0), numeric shoe sizes, favorites toggle
- [x] AI Stylist page: photo upload, gender selector, color recommendations display
- [x] Profile page: user info, My Favorites section, order history
- [x] Admin Dashboard: product list with edit modal (gender, subcategory, colorStock, sizes, price)
- [x] Cart page: cart items, checkout flow

## Features
- [x] Strict gender separation: men's page only shows gender=men, women's page only shows gender=women
- [x] Color-level stock: color button turns red + disabled when colorStock[color] <= 0
- [x] Working heart/favorites toggle on all product cards
- [x] Profile My Favorites section with product image, name, price, link
- [x] AI Stylist: vision LLM analyzes skin tone, returns structured JSON (clothingColors, watchColors, ringColors)
- [x] Professional filter design: pill tabs for subcategory, price slider, color swatches
- [x] Admin can update colorStock, sizes, price, subcategory per product

## Tests
- [x] auth.logout test (existing)
- [x] products.list filter test
- [x] favorites toggle test
- [x] isFavorite state test
- [x] admin inventory test
- [x] AI stylist validation test
- [x] All 21 tests passing
