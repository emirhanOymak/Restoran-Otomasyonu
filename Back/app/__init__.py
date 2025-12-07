from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_marshmallow import Marshmallow # <-- Yeni eklendi
from flask_migrate import Migrate
from app.config import Config

db = SQLAlchemy()
ma = Marshmallow() # <-- Yeni eklendi
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    ma.init_app(app) # <-- Yeni eklendi
    migrate.init_app(app, db)
    
    with app.app_context():
        # Blueprint'leri import et ve kaydet
        from app.routes.operational_routes import op_bp
        from app.routes.product_routes import products_bp
        from app.routes.sales_routes import sales_bp
        from app.routes.report_routes import report_bp
        from app.routes.inventory_routes import inventory_bp
        
        app.register_blueprint(op_bp) # <-- Rotayı sisteme kaydettik
        app.register_blueprint(products_bp)
        app.register_blueprint(sales_bp)
        app.register_blueprint(report_bp)
        app.register_blueprint(inventory_bp)
        
        try:
            db.engine.connect()
            print("✅ Veritabanı bağlantısı BAŞARILI!")
        except Exception as e:
            print(f"❌ Hata: {e}")
            
    return app