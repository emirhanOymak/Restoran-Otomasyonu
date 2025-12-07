from flask_marshmallow import Marshmallow
from app.models.products import UrunKategori, Urun, UrunOpsiyon
from marshmallow import fields

ma = Marshmallow()

class UrunOpsiyonSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UrunOpsiyon
        load_instance = True
        include_fk = True # Foreign Key'leri de göster (urun_id gibi)

class UrunSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Urun
        load_instance = True
        include_fk = True
    
    # Modeldeki 'opsiyonlar' ilişkisini buraya gömüyoruz
    opsiyonlar = fields.Nested(UrunOpsiyonSchema, many=True)
    
    # Sayısal değerleri string yerine float olarak göndermek için:
    fiyat = fields.Float()

class UrunKategoriSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UrunKategori
        load_instance = True
    
    # Modeldeki 'urunler' ilişkisini buraya gömüyoruz
    urunler = fields.Nested(UrunSchema, many=True)