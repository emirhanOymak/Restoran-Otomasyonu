from flask import Blueprint, jsonify, request
from app.services.inventory_service import get_all_materials, add_stock_entry

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