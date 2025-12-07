from flask_marshmallow import Marshmallow
from marshmallow import fields, Schema

ma = Marshmallow()

# Bu şema veritabanı modeli için değil, sadece 
# Frontend'den gelen sipariş isteğini doğrulamak için (Input Validation)
class SiparisItemSchema(Schema):
    urun_id = fields.Int(required=True)
    # GÜNCELLEME: 'missing' yerine 'load_default' kullanıyoruz
    adet = fields.Float(load_default=1)
    aciklama = fields.Str(load_default="")

class SiparisOlusturSchema(Schema):
    masa_id = fields.Int(required=True)
    items = fields.List(fields.Nested(SiparisItemSchema), required=True)