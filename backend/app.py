from flask import Flask, session
from flask_cors import CORS
from models import db
from flask_jwt_extended import JWTManager
from datetime import timedelta
from routes.products import products_bp
from routes.users import users_bp
from routes.cart import cart_bp
from routes.orders import order_bp
from routes.payment import payment_bp
import stripe
from dotenv import load_dotenv
import os
app = Flask(__name__, static_folder='static', static_url_path='/static')
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173", 
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://localhost:5001",
    "http://frontend:80",
    "http://frontend"
])
load_dotenv()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.secret_key = os.getenv("SECRET_KEY")
app.permanent_session_lifetime = timedelta(days=3)

app.config["JWT_SECRET_KEY"] =  os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=3)

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

jwt = JWTManager(app)
db.init_app(app)

app.register_blueprint(products_bp)
app.register_blueprint(users_bp)
app.register_blueprint(cart_bp)
app.register_blueprint(order_bp)
app.register_blueprint(payment_bp)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)