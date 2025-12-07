from flask_marshmallow import Marshmallow
from app.models.operational import Masa

ma = Marshmallow()

class MasaSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Masa
        load_instance = True # JSON'dan Python objesine dönüşüme izin ver

    # Özel olarak formatlamak istediğin alan varsa buraya ekleyebilirsin
    # Örn: masa_kodu'nu string olarak garanti etmek gibi