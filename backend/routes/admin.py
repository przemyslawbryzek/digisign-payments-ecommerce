from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Order, Payment, Product, OrderItem
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

def require_admin():
    user = User.query.get(get_jwt_identity())
    if not user or not user.is_admin:
        return None, (jsonify({"error": "Brak dostępu"}), 403)
    return user, None

@admin_bp.route('/api/admin/metrics', methods=['GET'])
@jwt_required()
def metrics():
    user, err = require_admin()
    if err: return err
    total_users = User.query.count()
    total_orders = Order.query.count()
    pending_orders = Order.query.filter_by(status="pending").count()
    paid_orders = Order.query.filter_by(status="paid").count()
    revenue = db.session.query(db.func.coalesce(db.func.sum(Order.total_amount), 0.0))\
        .filter(Order.status.in_(["paid", "shipped"])).scalar() or 0.0
    
    category_sales = db.session.query(
        Product.category,
        func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('revenue')
    ).join(OrderItem, Product.id == OrderItem.product_id
    ).join(Order, OrderItem.order_id == Order.id
    ).filter(Order.status.in_(["paid", "shipped"])
    ).group_by(Product.category).all()
    
    top_products = db.session.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('quantity'),
        func.sum(OrderItem.price_at_purchase * OrderItem.quantity).label('revenue')
    ).join(OrderItem, Product.id == OrderItem.product_id
    ).join(Order, OrderItem.order_id == Order.id
    ).filter(Order.status.in_(["paid", "shipped"])
    ).group_by(Product.id, Product.name
    ).order_by(func.sum(OrderItem.quantity).desc()
    ).limit(10).all()
  
    return jsonify({
        "total_users": total_users,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "paid_orders": paid_orders,
        "revenue": round(float(revenue), 2),
        "category_sales": [{"category": c or "Brak", "revenue": round(float(r), 2)} for c, r in category_sales],
        "top_products": [{"id": p_id, "name": name, "quantity": int(qty), "revenue": round(float(rev), 2)} for p_id, name, qty, rev in top_products]
    })

@admin_bp.route('/api/admin/orders', methods=['GET'])
@jwt_required()
def list_orders():
    user, err = require_admin()
    if err: return err
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([{
        "id": o.id,
        "user_id": o.user_id,
        "user_email": o.user.email if o.user else None,
        "status": o.status,
        "total_amount": o.total_amount,
        "created_at": o.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "items": [{
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else None,
            "quantity": item.quantity,
            "price_at_purchase": item.price_at_purchase,
            "subtotal": item.price_at_purchase * item.quantity
        } for item in o.items]
    } for o in orders])

@admin_bp.route('/api/admin/orders/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    user, err = require_admin()
    if err: return err
    order = Order.query.get_or_404(order_id)
    return jsonify({
        "id": order.id,
        "user_id": order.user_id,
        "user_email": order.user.email if order.user else None,
        "status": order.status,
        "total_amount": order.total_amount,
        "created_at": order.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        "items": [{
            "product_id": item.product_id,
            "product_name": item.product.name if item.product else None,
            "quantity": item.quantity,
            "price_at_purchase": item.price_at_purchase,
            "subtotal": item.price_at_purchase * item.quantity
        } for item in order.items]
    })

@admin_bp.route('/api/admin/orders/<int:order_id>', methods=['PATCH'])
@jwt_required()
def update_order(order_id):
    user, err = require_admin()
    if err: return err
    data = request.get_json() or {}
    status = data.get("status")
    if status not in {"pending","paid","cancelled","shipped"}:
        return jsonify({"error": "Nieprawidłowy status"}), 400
    order = Order.query.get_or_404(order_id)
    order.status = status
    db.session.commit()
    return jsonify({"message": "Zaktualizowano", "order_id": order.id, "status": order.status})

@admin_bp.route('/api/admin/products', methods=['POST'])
@jwt_required()
def create_product():
    user, err = require_admin()
    if err: return err
    data = request.get_json() or {}
    p = Product(
        name=data.get("name"),
        description=data.get("description"),
        price=float(data.get("price", 0)),
        stock=int(data.get("stock", 0)),
        category=data.get("category"),
        image_urls=data.get("image_urls")
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({"message": "Utworzono", "id": p.id}), 201

@admin_bp.route('/api/admin/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    user, err = require_admin()
    if err: return err
    data = request.get_json() or {}
    p = Product.query.get_or_404(product_id)
    for field in ["name","description","category","image_urls"]:
        if field in data: setattr(p, field, data[field])
    if "price" in data: p.price = float(data["price"])
    if "stock" in data: p.stock = int(data["stock"])
    db.session.commit()
    return jsonify({"message":"Zaktualizowano"})

@admin_bp.route('/api/admin/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    user, err = require_admin()
    if err: return err
    p = Product.query.get_or_404(product_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({"message":"Usunięto"})