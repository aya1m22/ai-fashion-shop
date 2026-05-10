"""
Inventory models for the Fashion Admin Dashboard.
These models mirror the database tables created by the Node.js/Drizzle backend.
"""
from django.db import models
from django.core.validators import MinValueValidator


class Product(models.Model):
    GENDER_CHOICES = [
        ("men", "Men"),
        ("women", "Women"),
    ]
    SUBCATEGORY_CHOICES = [
        ("dresses", "Dresses"),
        ("shirts", "Shirts"),
        ("pants", "Pants"),
        ("pajamas", "Pajamas"),
        ("bags", "Bags"),
        ("accessories", "Accessories"),
        ("shoes", "Shoes"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    subcategory = models.CharField(max_length=50, choices=SUBCATEGORY_CHOICES)
    image_url = models.URLField(max_length=1000, blank=True, default="")
    sizes = models.JSONField(default=list, blank=True)
    colors = models.JSONField(default=list, blank=True)
    color_stock = models.JSONField(default=dict, blank=True)
    style_tags = models.JSONField(default=list, blank=True)
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "products"
        ordering = ["gender", "subcategory", "name"]
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return f"{self.name} ({self.gender} / {self.subcategory})"

    @property
    def is_in_stock(self):
        return self.stock > 0


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("processing", "Processing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
        ("cancelled", "Cancelled"),
        ("refunded", "Refunded"),
    ]

    user_id = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    items = models.JSONField(default=list, blank=True)
    shipping_address = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "orders"
        ordering = ["-created_at"]
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order #{self.pk} - {self.status} (${self.total_amount})"


class CartItem(models.Model):
    user_id = models.CharField(max_length=255)
    product_id = models.IntegerField()
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])
    size = models.CharField(max_length=20, blank=True, default="")
    color = models.CharField(max_length=50, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        db_table = "cart_items"
        ordering = ["-created_at"]
        verbose_name = "Cart Item"
        verbose_name_plural = "Cart Items"

    def __str__(self):
        return f"Cart: user={self.user_id} product={self.product_id} qty={self.quantity}"


class Favorite(models.Model):
    user_id = models.CharField(max_length=255)
    product_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        db_table = "favorites"
        ordering = ["-created_at"]
        verbose_name = "Favorite"
        verbose_name_plural = "Favorites"
        unique_together = [["user_id", "product_id"]]

    def __str__(self):
        return f"Favorite: user={self.user_id} product={self.product_id}"
