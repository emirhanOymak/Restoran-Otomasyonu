from app import db
from datetime import datetime

class Malzeme(db.Model):
    __tablename__ = 'malzemeler'

    malzeme_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    malzeme_adi = db.Column(db.String(150), nullable=False)
    birim = db.Column(db.String(10), nullable=False)
    stok_miktar = db.Column(db.Numeric(12, 3), default=0)
    kritik_seviye = db.Column(db.Numeric(12, 3), default=0)
    birim_maliyet = db.Column(db.Numeric(12, 4), default=0)

    def to_dict(self):
        return {
            "id": self.malzeme_id,
            "adi": self.malzeme_adi,
            "stok": float(self.stok_miktar),
            "birim": self.birim,
            "birim_maliyet": float(self.birim_maliyet) if self.birim_maliyet else 0
            
        }

class Recete(db.Model):
    __tablename__ = 'receteler'

    # Bu tabloda iki tane PK var (Composite Key)
    urun_id = db.Column(db.Integer, db.ForeignKey('urunler.urun_id'), primary_key=True)
    malzeme_id = db.Column(db.Integer, db.ForeignKey('malzemeler.malzeme_id'), primary_key=True)
    birim_tuketim = db.Column(db.Numeric(12, 3), nullable=False)

    malzeme = db.relationship('Malzeme')
    urun = db.relationship('Urun')

class Tedarikci(db.Model):
    __tablename__ = 'tedarikciler'

    tedarikci_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    unvan = db.Column(db.String(150), nullable=False)
    vergi_no = db.Column(db.String(20))
    telefon = db.Column(db.String(30))
    
    def to_dict(self):
        return {
            "tedarikci_id": self.tedarikci_id,
            "unvan": self.unvan
        }

class StokHareket(db.Model):
    __tablename__ = 'stok_hareketleri'

    hareket_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    malzeme_id = db.Column(db.Integer, db.ForeignKey('malzemeler.malzeme_id'), nullable=False)
    tip = db.Column(db.String(10)) # Giriş/Çıkış
    miktar = db.Column(db.Numeric(12, 3))
    
    birim_maliyet = db.Column(db.Numeric(12, 4))
    
    aciklama = db.Column(db.String(200))
    tarih = db.Column(db.DateTime, default=datetime.now)
    
    ref_tablo = db.Column(db.String(50)) # Hareketin kaynağı (siparis, zayi vb.)
    ref_id = db.Column(db.Integer)

    malzeme = db.relationship('Malzeme')

class Gider(db.Model):
    __tablename__ = 'giderler'

    gider_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tedarikci_id = db.Column(db.Integer, db.ForeignKey('tedarikciler.tedarikci_id'))
    tur = db.Column(db.String(20)) # Satın Alma, Fatura, Kira
    baslik = db.Column(db.String(150))
    brut_tutar = db.Column(db.Numeric(12, 2))
    kdv_orani = db.Column(db.Numeric(4, 2))
    stopaj_orani = db.Column(db.Numeric(4, 2))
    tarih = db.Column(db.Date)