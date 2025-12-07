from app import db
from datetime import datetime

class Siparis(db.Model):
    __tablename__ = 'siparisler'

    siparis_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    masa_id = db.Column(db.Integer, db.ForeignKey('masalar.masa_id'))
    musteri_id = db.Column(db.Integer, db.ForeignKey('musteriler.musteri_id'))
    tip = db.Column(db.String(20)) # Dine-in, Paket
    durum = db.Column(db.String(20)) # Hazırlanıyor, Teslim
    olusturma_tarihi = db.Column(db.DateTime, default=datetime.now)

    # İlişkiler
    detaylar = db.relationship('SiparisDetay', backref='siparis', lazy=True)
    odemeler = db.relationship('Odeme', backref='siparis', lazy=True)

    def to_dict(self):
        return {
            "siparis_id": self.siparis_id,
            "masa_id": self.masa_id,
            "durum": self.durum,
            "tarih": self.olusturma_tarihi.isoformat() if self.olusturma_tarihi else None
        }

class SiparisDetay(db.Model):
    __tablename__ = 'siparis_detaylari'

    detay_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    siparis_id = db.Column(db.Integer, db.ForeignKey('siparisler.siparis_id'), nullable=False)
    urun_id = db.Column(db.Integer, db.ForeignKey('urunler.urun_id'), nullable=False)
    adet = db.Column(db.Numeric(10, 2), default=1)
    satis_fiyati = db.Column(db.Numeric(10, 2), nullable=False)
    aciklama = db.Column(db.String(100))
    ikram_mi = db.Column(db.Boolean, default=False)
    durum = db.Column(db.String(20))

    # Hangi ürün olduğunu bilmek isteriz
    urun = db.relationship('Urun')

    def to_dict(self):
        return {
            "detay_id": self.detay_id,
            "urun_adi": self.urun.urun_adi if self.urun else "Silinmiş Ürün",
            "adet": float(self.adet),
            "fiyat": float(self.satis_fiyati)
        }

class Odeme(db.Model):
    __tablename__ = 'odemeler'

    odeme_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    siparis_id = db.Column(db.Integer, db.ForeignKey('siparisler.siparis_id'), nullable=False)
    tutar = db.Column(db.Numeric(10, 2), nullable=False)
    yontem = db.Column(db.String(20)) # Nakit, Kart
    durum = db.Column(db.String(20))   # <-- Hatanın sebebi bu satırın olmamasıydı
    saglayici = db.Column(db.String(50))
    islem_ref = db.Column(db.String(100)) # Banka işlem ref vs.
    olusturma_tarihi = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        return {
            "odeme_id": self.odeme_id,
            "tutar": float(self.tutar),
            "yontem": self.yontem
        }