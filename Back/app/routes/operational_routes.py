from flask import Blueprint, jsonify, request
from app.services.operational_service import get_all_masalar, create_masa
from app.schemas.operational import MasaSchema

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