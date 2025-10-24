from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=10)
    category = db.Column(db.String(50))
    image_urls = db.Column(db.Text)
    def images(self):
        try:
            return json.loads(self.image_urls) if self.image_urls else []
        except:
            return []

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    user = db.relationship('User', backref='cart_items', lazy=True)
    product = db.relationship('Product', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "user_id": self.user_id,
            "name": self.product.name,
            "price": self.product.price,
            "images": self.product.images() if hasattr(self.product, 'images') else []
        }

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.now)

    payments = db.relationship("Payment", backref="order", lazy=True)
    items = db.relationship("OrderItem", backref="order", lazy=True)
    user = db.relationship("User", backref="orders")
    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "status": self.status,
            "total_amount": round(self.total_amount, 2),
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "items": [item.to_dict() for item in self.items],
        }

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    price_at_purchase = db.Column(db.Float, nullable=False)

    product = db.relationship("Product")

    def to_dict(self):
        return {
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "quantity": self.quantity,
            "price_at_purchase": round(self.price_at_purchase, 2),
            "subtotal": round(self.price_at_purchase * self.quantity, 2),
            "images": self.product.images() if hasattr(self.product, 'images') else []
        }
    
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    provider = db.Column(db.String(50), default="stripe")
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(10), default="PLN")
    status = db.Column(db.String(50), default="pending")
    transaction_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now)
    paid_at = db.Column(db.DateTime, nullable=True)