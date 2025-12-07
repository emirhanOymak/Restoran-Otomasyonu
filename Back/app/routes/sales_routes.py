from flask import Blueprint, jsonify, request
from app.services.sales_service import create_siparis, get_masa_hesabi, odeme_yap_ve_kapat
from app.schemas.sales import SiparisOlusturSchema

sales_bp = Blueprint('sales', __name__, url_prefix='/api/sales')

@sales_bp.route('/siparis-ver', methods=['POST'])
def siparis_ver():
    try:
        # 1. Gelen veriyi (JSON) al
        json_data = request.json
        
        # 2. Şema ile doğrula (Eksik veri var mı?)
        schema = SiparisOlusturSchema()
        data = schema.load(json_data)
        
        # 3. Servisi çağır ve kaydet
        sonuc = create_siparis(data)
        
        return jsonify(sonuc), 201
        
    except Exception as e:
        return jsonify({"hata": str(e)}), 400
    
@sales_bp.route('/hesap/<int:masa_id>', methods=['GET'])
def hesap_goster(masa_id):
    sonuc = get_masa_hesabi(masa_id)
    if sonuc:
        return jsonify(sonuc)
    else:
        return jsonify({"mesaj": "Aktif adisyon yok"}), 404

@sales_bp.route('/odeme-yap', methods=['POST'])
def odeme_al():
    try:
        data = request.json
        sonuc = odeme_yap_ve_kapat(data)
        return jsonify(sonuc), 200
    except Exception as e:
        return jsonify({"hata": str(e)}), 400    