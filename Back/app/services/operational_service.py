from app.models.operational import Masa
from app import db

# Fonksiyon isminin tam olarak bu olduğundan emin ol:
def get_all_masalar():
    # Tüm masaları veritabanından çeker
    return Masa.query.all()

def create_masa(data):
    # Yeni masa oluşturma mantığı
    yeni_masa = Masa(
        masa_adi=data.get('masa_adi'),
        durum="Boş"
    )
    db.session.add(yeni_masa)
    db.session.commit()
    return yeni_masa