from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, CartItem
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity


users_bp = Blueprint('users', __name__)

@users_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email i hasło są wymagane"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Użytkownik o tym e-mailu już istnieje"}), 400

    hashed_password = generate_password_hash(data['password'])
    user = User(email=data['email'], password=hashed_password)

    db.session.add(user)
    db.session.commit()
    access_token = access_token = create_access_token(
    identity=str(user.id))
    session_cart = session.get("cart", [])
    for item in session_cart:
        existing = CartItem.query.filter_by(user_id=user.id, product_id=item["product_id"]).first()
        if existing:
            existing.quantity += item["quantity"]
        else:
            db.session.add(CartItem(
                user_id=user.id,
                product_id=item["product_id"],
                quantity=item["quantity"]
            ))
    db.session.commit()
    session.pop("cart", None)

    return jsonify({"message": "Rejestracja zakończona sukcesem", "user_id": user.id, "access_token": access_token}), 201

@users_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not check_password_hash(user.password, data.get('password')):
        return jsonify({"error": "Nieprawidłowy e-mail lub hasło"}), 401
    access_token = access_token = create_access_token(
    identity=str(user.id))
    session_cart = session.get("cart", [])
    for item in session_cart:
        existing = CartItem.query.filter_by(user_id=user.id, product_id=item["product_id"]).first()
        if existing:
            existing.quantity += item["quantity"]
        else:
            db.session.add(CartItem(
                user_id=user.id,
                product_id=item["product_id"],
                quantity=item["quantity"]
            ))
    db.session.commit()
    session.pop("cart", None)
    return jsonify({
        "message": "Zalogowano pomyślnie",
        "access_token": access_token
    }), 200

@users_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "message": "Dane profilu użytkownika",
        "email": user.email,
        "is_admin": bool(user.is_admin)
    }), 200