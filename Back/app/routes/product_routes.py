from flask import Blueprint, jsonify, request
from app.services.product_service import (
    get_full_menu, 
    add_new_product, 
    update_product_price_or_details, 
    delete_product_soft,
    add_new_category
)
from app.schemas.products import UrunKategoriSchema, UrunSchema

products_bp = Blueprint('products', __name__, url_prefix='/api/products')

@products_bp.route('/menu', methods=['GET'])
def get_menu():
    kategoriler = get_full_menu()
    
    # many=True diyerek liste döneceğimizi belirtiyoruz
    menu_schema = UrunKategoriSchema(many=True)
    
    return jsonify(menu_schema.dump(kategoriler))

# 1. Ürün Ekle
@products_bp.route('/add', methods=['POST'])
def add_product():
    try:
        data = request.json
        urun = add_new_product(data)
        return jsonify({"mesaj": "Ürün eklendi", "id": urun.urun_id}), 201
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

# 2. Ürün Güncelle
@products_bp.route('/update/<int:urun_id>', methods=['PUT'])
def update_product(urun_id):
    try:
        data = request.json
        update_product_price_or_details(urun_id, data)
        return jsonify({"mesaj": "Ürün güncellendi"}), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

# 3. Ürün Sil
@products_bp.route('/delete/<int:urun_id>', methods=['DELETE'])
def delete_product(urun_id):
    try:
        delete_product_soft(urun_id)
        return jsonify({"mesaj": "Ürün silindi"}), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 400

# 4. Kategori Ekle
@products_bp.route('/category/add', methods=['POST'])
def add_category():
    try:
        data = request.json
        add_new_category(data)
        return jsonify({"mesaj": "Kategori eklendi"}), 201
    except Exception as e:
        return jsonify({"hata": str(e)}), 400