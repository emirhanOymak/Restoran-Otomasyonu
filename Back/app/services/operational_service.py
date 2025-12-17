from app.models.operational import Masa
from app import db


def get_all_masalar():
    # SQL: SELECT * FROM masalar;
    return Masa.query.all()

def create_masa(data):
    # SQL: INSERT INTO masalar (masa_adi, durum) VALUES (..., 'Boş');
    yeni_masa = Masa(
        masa_adi=data.get('masa_adi'),
        durum="Boş"
    )
    db.session.add(yeni_masa)
    db.session.commit()
    return yeni_masa