from flask import Blueprint, jsonify, request, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, CartItem, Payment
import os
order_bp = Blueprint('orders', __name__)

@order_bp.route("/api/checkout", methods=["POST"])
@jwt_required()
def checkout():
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    if not cart_items:
        return jsonify({"error": "Koszyk jest pusty"}), 400
    total = 0
    order = Order(user_id=user_id, total_amount=0)
    db.session.add(order)
    db.session.flush()
    for item in cart_items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.product.price
        )
        total += item.product.price * item.quantity
        db.session.add(order_item)
    order.total_amount = total
    db.session.commit()
    CartItem.query.filter_by(user_id=user_id).delete()
    return jsonify({"message": "Zamówienie utworzone", "order_id": order.id}), 201

@order_bp.route("/api/orders", methods=["GET"])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).all()
    return jsonify([
        {
            "order_id": o.id,
            "total_amount": o.total_amount,
            "status":o.status,
            "date":o.created_at
        } for o in orders
    ]), 200

@order_bp.route("/api/orders/<int:order_id>", methods=["GET"])
@jwt_required()
def get_order(order_id):
    user_id = get_jwt_identity()
    order = Order.query.get_or_404(order_id)

    if str(order.user_id) != str(user_id):
        return jsonify({"error": "Brak dostępu"}), 403

    return jsonify(order.to_dict()), 200

@order_bp.route("/api/orders/<int:order_id>/pdf", methods=["GET"])
@jwt_required()
def get_pdf(order_id):
    user_id = get_jwt_identity()
    order = Order.query.get_or_404(order_id)
    if str(order.user_id) != str(user_id):
        return jsonify({"error": "Brak dostępu"}), 403
    pdf_dir = "pdfs/"
    signed_path = os.path.join(pdf_dir, f"order_{order_id}_signed.pdf")
    return send_file(signed_path, as_attachment=True)