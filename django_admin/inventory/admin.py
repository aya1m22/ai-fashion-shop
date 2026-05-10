"""
Django Admin configuration for the Fashion Shop Inventory Dashboard.
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from .models import Product, Order, CartItem, Favorite


# ── Custom Admin Site ─────────────────────────────────────────────────────────
admin.site.site_header = "StyleAI — Fashion Admin Dashboard"
admin.site.site_title = "StyleAI Admin"
admin.site.index_title = "Inventory & Order Management"


# ── Product Admin ─────────────────────────────────────────────────────────────
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'product_image_preview',
        'name',
        'gender',
        'subcategory',
        'price_display',
        'stock_badge',
        'colors_display',
        'id',
    ]
    list_display_links = ['product_image_preview', 'name']
    list_filter = ['gender', 'subcategory']
    search_fields = ['name', 'description']
    list_per_page = 25
    ordering = ['gender', 'subcategory', 'name']
    readonly_fields = ['product_image_large', 'id', 'created_at', 'updated_at', 'stock_summary']

    fieldsets = (
        ('Product Identity', {
            'fields': ('id', 'name', 'description', 'gender', 'subcategory'),
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock', 'stock_summary', 'color_stock'),
        }),
        ('Image — IMPORTANT: Verify image matches the product category!', {
            'fields': ('image_url', 'product_image_large'),
            'description': 'Always check that the image shows the correct product type. '
                           'A watch product must show a watch image, not shoes or clothing.',
        }),
        ('Variants', {
            'fields': ('sizes', 'colors', 'style_tags'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )

    def product_image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" style="width:60px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb;" '
                'onerror="this.src=\'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=60&q=60\'" />',
                obj.image_url
            )
        return format_html('<div style="width:60px;height:80px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#9ca3af;">No Image</div>')
    product_image_preview.short_description = 'Image'

    def product_image_large(self, obj):
        if obj.image_url:
            return format_html(
                '<div style="margin:8px 0;">'
                '<img src="{}" style="max-width:300px;max-height:400px;object-fit:cover;border-radius:12px;border:1px solid #e5e7eb;box-shadow:0 4px 12px rgba(0,0,0,0.1);" />'
                '<p style="margin-top:8px;font-size:12px;color:#6b7280;">URL: <a href="{}" target="_blank">{}</a></p>'
                '</div>',
                obj.image_url, obj.image_url,
                obj.image_url[:80] + '...' if len(obj.image_url) > 80 else obj.image_url
            )
        return "No image URL set."
    product_image_large.short_description = 'Image Preview (verify this matches the product!)'

    def price_display(self, obj):
        return format_html('<strong style="color:#1a1a1a;">${}</strong>', obj.price)
    price_display.short_description = 'Price'
    price_display.admin_order_field = 'price'

    def stock_badge(self, obj):
        if obj.stock <= 0:
            return format_html('<span style="background:#fee2e2;color:#dc2626;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">Out of Stock</span>')
        elif obj.stock <= 5:
            return format_html('<span style="background:#fef3c7;color:#d97706;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">Low: {}</span>', obj.stock)
        else:
            return format_html('<span style="background:#d1fae5;color:#059669;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;">In Stock: {}</span>', obj.stock)
    stock_badge.short_description = 'Stock'
    stock_badge.admin_order_field = 'stock'

    def colors_display(self, obj):
        colors = obj.colors or []
        color_map = {
            'Black': '#1a1a1a', 'White': '#f5f5f5', 'Gray': '#9ca3af',
            'Navy': '#1e3a5f', 'Blue': '#3b82f6', 'Red': '#ef4444',
            'Pink': '#f472b6', 'Beige': '#d4c5a9', 'Gold': '#d4af37',
            'Silver': '#c0c0c0', 'Brown': '#92400e', 'Tan': '#d97706',
            'Emerald': '#10b981', 'Olive': '#6b7c3c', 'Burgundy': '#800020',
            'Champagne': '#f7e7ce', 'Ivory': '#fffff0', 'Camel': '#ca8a04',
            'Khaki': '#a3a37a', 'Nude': '#e8c9a0', 'Blush': '#fda4af',
            'Lilac': '#c084fc', 'Sage': '#8fad88', 'Terracotta': '#c1440e',
            'Natural': '#c8a97e', 'Sand': '#c2b280',
        }
        dots = ''
        for color in colors[:6]:
            bg = color_map.get(color, '#d1d5db')
            dots += f'<span title="{color}" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:{bg};border:1px solid #e5e7eb;margin-right:2px;"></span>'
        if len(colors) > 6:
            dots += f'<span style="font-size:10px;color:#6b7280;">+{len(colors)-6}</span>'
        return format_html(dots)
    colors_display.short_description = 'Colors'

    def stock_summary(self, obj):
        color_stock = obj.color_stock or {}
        if not color_stock:
            return "No color stock data"
        rows = ''
        for color, qty in color_stock.items():
            badge_color = '#d1fae5' if qty > 0 else '#fee2e2'
            text_color = '#059669' if qty > 0 else '#dc2626'
            rows += f'<tr><td style="padding:4px 8px;">{color}</td><td style="padding:4px 8px;"><span style="background:{badge_color};color:{text_color};padding:1px 6px;border-radius:8px;font-size:11px;">{qty}</span></td></tr>'
        return format_html(
            '<table style="border-collapse:collapse;font-size:12px;">'
            '<tr><th style="padding:4px 8px;text-align:left;color:#6b7280;">Color</th>'
            '<th style="padding:4px 8px;text-align:left;color:#6b7280;">Stock</th></tr>'
            '{}</table>', mark_safe(rows)
        )
    stock_summary.short_description = 'Stock by Color'

    actions = ['mark_out_of_stock', 'restock_10']

    def mark_out_of_stock(self, request, queryset):
        count = queryset.update(stock=0)
        self.message_user(request, f"{count} product(s) marked as out of stock.")
    mark_out_of_stock.short_description = "Mark selected as out of stock"

    def restock_10(self, request, queryset):
        count = queryset.update(stock=10)
        self.message_user(request, f"{count} product(s) restocked to 10 units.")
    restock_10.short_description = "Restock selected products (set to 10)"


# ── Order Admin ───────────────────────────────────────────────────────────────
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'status_badge', 'total_display', 'item_count', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user_id']
    list_per_page = 30
    ordering = ['-created_at']
    readonly_fields = ['id', 'created_at', 'updated_at', 'items_detail']

    fieldsets = (
        ('Order Info', {
            'fields': ('id', 'user_id', 'status', 'total_amount'),
        }),
        ('Items', {
            'fields': ('items_detail', 'items'),
        }),
        ('Shipping', {
            'fields': ('shipping_address',),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

    def status_badge(self, obj):
        colors = {
            'pending': ('#fef3c7', '#d97706'),
            'confirmed': ('#dbeafe', '#2563eb'),
            'processing': ('#e0e7ff', '#7c3aed'),
            'shipped': ('#cffafe', '#0891b2'),
            'delivered': ('#d1fae5', '#059669'),
            'cancelled': ('#fee2e2', '#dc2626'),
            'refunded': ('#f3f4f6', '#6b7280'),
        }
        bg, text = colors.get(obj.status, ('#f3f4f6', '#6b7280'))
        return format_html(
            '<span style="background:{};color:{};padding:2px 10px;border-radius:12px;font-size:11px;font-weight:600;text-transform:capitalize;">{}</span>',
            bg, text, obj.status
        )
    status_badge.short_description = 'Status'

    def total_display(self, obj):
        return format_html('<strong>${}</strong>', obj.total_amount)
    total_display.short_description = 'Total'

    def item_count(self, obj):
        items = obj.items or []
        return len(items)
    item_count.short_description = 'Items'

    def items_detail(self, obj):
        items = obj.items or []
        if not items:
            return "No items"
        rows = ''
        for item in items:
            rows += (
                f'<tr>'
                f'<td style="padding:4px 8px;">{item.get("productId", "?")}</td>'
                f'<td style="padding:4px 8px;">{item.get("name", "Unknown")}</td>'
                f'<td style="padding:4px 8px;">{item.get("quantity", 1)}</td>'
                f'<td style="padding:4px 8px;">${item.get("price", 0)}</td>'
                f'</tr>'
            )
        return format_html(
            '<table style="border-collapse:collapse;font-size:12px;width:100%;">'
            '<tr style="background:#f9fafb;">'
            '<th style="padding:4px 8px;text-align:left;">ID</th>'
            '<th style="padding:4px 8px;text-align:left;">Product</th>'
            '<th style="padding:4px 8px;text-align:left;">Qty</th>'
            '<th style="padding:4px 8px;text-align:left;">Price</th>'
            '</tr>{}</table>', mark_safe(rows)
        )
    items_detail.short_description = 'Order Items (read-only summary)'

    actions = ['mark_shipped', 'mark_delivered', 'mark_cancelled']

    def mark_shipped(self, request, queryset):
        count = queryset.filter(status__in=['confirmed', 'processing']).update(status='shipped')
        self.message_user(request, f"{count} order(s) marked as shipped.")
    mark_shipped.short_description = "Mark selected as shipped"

    def mark_delivered(self, request, queryset):
        count = queryset.filter(status='shipped').update(status='delivered')
        self.message_user(request, f"{count} order(s) marked as delivered.")
    mark_delivered.short_description = "Mark selected as delivered"

    def mark_cancelled(self, request, queryset):
        count = queryset.exclude(status__in=['delivered', 'refunded']).update(status='cancelled')
        self.message_user(request, f"{count} order(s) cancelled.")
    mark_cancelled.short_description = "Cancel selected orders"


# ── Cart Item Admin ───────────────────────────────────────────────────────────
@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'product_id', 'quantity', 'size', 'color', 'created_at']
    list_filter = ['color', 'size']
    search_fields = ['user_id']
    list_per_page = 30
    ordering = ['-created_at']


# ── Favorite Admin ────────────────────────────────────────────────────────────
@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_id', 'product_id', 'created_at']
    search_fields = ['user_id']
    list_per_page = 30
    ordering = ['-created_at']
