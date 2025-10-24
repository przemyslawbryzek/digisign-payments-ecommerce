from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import stripe, os
from datetime import datetime
from models import db, Order, Payment
from utils.pdf_generator import generate_order_pdf
from utils.pdf_signer import sign_pdf

payment_bp = Blueprint("payment", __name__)

@payment_bp.route("/api/payment/create-session", methods=["POST"])
@jwt_required()
def create_payment_session():
    user_id = get_jwt_identity()
    data = request.get_json()
    order_id = data.get("order_id")
    order = Order.query.get(order_id)
    if not order or str(order.user_id) != str(user_id):
        return jsonify({"error": "Zamówienie nie istnieje lub brak dostępu"}), 404

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            mode="payment",
            line_items=[
                {
                    "price_data": {
                        "currency": "pln",
                        "product_data": {"name": f"Zamówienie #{order.id}"},
                        "unit_amount": int(order.total_amount * 100),
                    },
                    "quantity": 1,
                }
            ],
            success_url=f"http://127.0.0.1:3000/orders/{order_id}",
            cancel_url="http://127.0.0.1:3000/payment-cancelled",
            metadata={"order_id": str(order.id)},
        )

        return jsonify({"checkout_url": session.url})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@payment_bp.route("/api/payment/webhook", methods=["POST"])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except stripe.error.SignatureVerificationError:
        return jsonify({"error": "Nieprawidłowy podpis webhoka"}), 400

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session["metadata"]["order_id"]
        payment_intent = event["data"]["object"]
        #amount = payment_intent["amount"] / 100

        order = Order.query.get(order_id)
        if order:
            payment = Payment(
                order_id=order.id,
                provider="stripe",
                amount=order.total_amount,
                currency=payment_intent["currency"].upper(),
                status="succeeded",
                transaction_id=payment_intent["id"],
                paid_at=datetime.now(),
            )
            db.session.add(payment)
            order.status = "paid"
            db.session.commit()
            pdf_path = generate_order_pdf(order, payment)
            pdf_dir = "pdfs/"
            os.makedirs(pdf_dir, exist_ok=True)
            input_pdf = os.path.join(pdf_dir, f"order_{order_id}.pdf")
            signed_pdf = os.path.join(pdf_dir, f"order_{order_id}_signed.pdf")
            signed_path = sign_pdf(input_pdf, signed_pdf)
            os.remove(input_pdf)
            
    elif event["type"] == "payment_intent.payment_failed":
        payment_intent = event["data"]["object"]
        order_id = payment_intent.get("metadata", {}).get("order_id")
        order = Order.query.get(order_id)
        if order:
            order.status = "failed"
            db.session.commit()

    return jsonify(success=True)

