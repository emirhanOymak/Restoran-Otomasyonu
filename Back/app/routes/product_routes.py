from flask import Blueprint, jsonify
from app.services.product_service import get_full_menu
from app.schemas.products import UrunKategoriSchema

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/menu', methods=['GET'])
def get_menu():
    kategoriler = get_full_menu()
    
    # many=True diyerek liste döneceğimizi belirtiyoruz
    menu_schema = UrunKategoriSchema(many=True)
    
    return jsonify(menu_schema.dump(kategoriler))