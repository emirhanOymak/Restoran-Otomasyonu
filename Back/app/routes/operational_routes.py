from flask import Blueprint, jsonify, request
from app import db
from app.services.operational_service import get_all_masalar, create_masa
from app.schemas.operational import MasaSchema, Masa

# Blueprint: URL gruplaması (Örn: /api/operational/...)
op_bp = Blueprint('operational', __name__, url_prefix='/api/operational')

@op_bp.route('/masalar', methods=['GET'])
def list_masalar():
    masalar = get_all_masalar()
    
    # many=True -> Birden fazla kayıt döneceğimizi belirtir
    masa_schema = MasaSchema(many=True)
    
    # Veriyi JSON'a çevirip yolla
    return jsonify(masa_schema.dump(masalar))

@op_bp.route('/masa-ekle', methods=['POST'])
def add_masa():
    data = request.json
    yeni_masa = create_masa(data)
    
    # many=False -> Tek kayıt dönüyoruz
    masa_schema = MasaSchema()
    return jsonify(masa_schema.dump(yeni_masa)), 201

@op_bp.route('/cagir/<int:masa_id>', methods=['POST'])
def garson_cagir(masa_id):
    masa = Masa.query.get(masa_id)
    if masa:
        masa.servis_istiyor = True
        db.session.commit()
        return jsonify({"mesaj": "Garson çağrıldı."}), 200
    return jsonify({"hata": "Masa bulunamadı"}), 404

# --- YENİ: ÇAĞRIYI KAPATMA (Admin/Garson Tarafı) ---
@op_bp.route('/cagir-iptal/<int:masa_id>', methods=['POST'])
def garson_cagir_iptal(masa_id):
    masa = Masa.query.get(masa_id)
    if masa:
        masa.servis_istiyor = False
        db.session.commit()
        return jsonify({"mesaj": "Çağrı yanıtlandı."}), 200
    return jsonify({"hata": "Masa bulunamadı"}), 404