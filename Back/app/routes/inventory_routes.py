from flask import Blueprint, jsonify, request
from app.services.inventory_service import (
    get_all_materials, 
    add_stock_entry, 
    get_recipe_by_product,      # <-- Ekle
    update_product_recipe,
    create_new_material      # <-- Ekle
)

inventory_bp = Blueprint('inventory', __name__, url_prefix='/api/inventory')

@inventory_bp.route('/materials', methods=['GET'])
def list_materials():
    try:
        data = get_all_materials()
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 500

@inventory_bp.route('/stock-entry', methods=['POST'])
def add_stock():
    try:
        data = request.json
        result = add_stock_entry(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"hata": str(e)}), 400
    
@inventory_bp.route('/recipe/<int:urun_id>', methods=['GET'])
def get_recipe(urun_id):
    try:
        data = get_recipe_by_product(urun_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 500

@inventory_bp.route('/recipe/<int:urun_id>', methods=['POST'])
def save_recipe(urun_id):
    try:
        # Frontend'den gelen liste: [{malzeme_id: 1, miktar: 200}, ...]
        items = request.json.get('items', [])
        sonuc = update_product_recipe(urun_id, items)
        return jsonify(sonuc), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 500    
    
@inventory_bp.route('/material/add', methods=['POST'])
def add_material():
    try:
        data = request.json
        create_new_material(data)
        return jsonify({"mesaj": "Malzeme başarıyla tanımlandı."}), 201
    except Exception as e:
        return jsonify({"hata": str(e)}), 400    