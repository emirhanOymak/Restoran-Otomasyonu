from app import db
from datetime import datetime

"""
CREATE TABLE siparisler (
    siparis_id INT IDENTITY(1,1) PRIMARY KEY,
    masa_id INT,
    musteri_id INT,
    tip NVARCHAR(20), -- 'Dine-in', 'Paket'
    durum NVARCHAR(20), -- 'Hazırlanıyor', 'Kapandı'
    olusturma_tarihi DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (masa_id) REFERENCES masalar(masa_id),
    FOREIGN KEY (musteri_id) REFERENCES musteriler(musteri_id)
);
"""

class Siparis(db.Model):
    __tablename__ = 'siparisler'

    siparis_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    masa_id = db.Column(db.Integer, db.ForeignKey('masalar.masa_id'))
    musteri_id = db.Column(db.Integer, db.ForeignKey('musteriler.musteri_id'))
    tip = db.Column(db.String(20)) 
    durum = db.Column(db.String(20)) 
    olusturma_tarihi = db.Column(db.DateTime, default=datetime.now)

    
    detaylar = db.relationship('SiparisDetay', backref='siparis', lazy=True)
    odemeler = db.relationship('Odeme', backref='siparis', lazy=True)

    def to_dict(self):
        return {
            "siparis_id": self.siparis_id,
            "masa_id": self.masa_id,
            "durum": self.durum,
            "tarih": self.olusturma_tarihi.isoformat() if self.olusturma_tarihi else None
        }


"""
CREATE TABLE siparis_detaylari (
    detay_id INT IDENTITY(1,1) PRIMARY KEY,
    siparis_id INT NOT NULL,
    urun_id INT NOT NULL,
    adet DECIMAL(10, 2) DEFAULT 1,
    satis_fiyati DECIMAL(10, 2) NOT NULL,
    aciklama NVARCHAR(100),
    ikram_mi BIT DEFAULT 0,
    durum NVARCHAR(20),
    FOREIGN KEY (siparis_id) REFERENCES siparisler(siparis_id),
    FOREIGN KEY (urun_id) REFERENCES urunler(urun_id)
);
"""
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

    
    urun = db.relationship('Urun')

    def to_dict(self):
        return {
            "detay_id": self.detay_id,
            "urun_adi": self.urun.urun_adi if self.urun else "Silinmiş Ürün",
            "adet": float(self.adet),
            "fiyat": float(self.satis_fiyati)
        }


"""
CREATE TABLE odemeler (
    odeme_id INT IDENTITY(1,1) PRIMARY KEY,
    siparis_id INT NOT NULL,
    tutar DECIMAL(10, 2) NOT NULL,
    yontem NVARCHAR(20), -- 'Nakit', 'Kart'
    durum NVARCHAR(20), -- 'Ödendi'
    saglayici NVARCHAR(50),
    islem_ref NVARCHAR(100),
    olusturma_tarihi DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (siparis_id) REFERENCES siparisler(siparis_id)
);
"""
class Odeme(db.Model):
    __tablename__ = 'odemeler'

    odeme_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    siparis_id = db.Column(db.Integer, db.ForeignKey('siparisler.siparis_id'), nullable=False)
    tutar = db.Column(db.Numeric(10, 2), nullable=False)
    yontem = db.Column(db.String(20)) 
    durum = db.Column(db.String(20))   
    saglayici = db.Column(db.String(50))
    islem_ref = db.Column(db.String(100)) 
    olusturma_tarihi = db.Column(db.DateTime, default=datetime.now)
    
    def to_dict(self):
        return {
            "odeme_id": self.odeme_id,
            "tutar": float(self.tutar),
            "yontem": self.yontem
        }