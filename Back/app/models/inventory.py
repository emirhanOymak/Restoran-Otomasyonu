from app import db
from datetime import datetime

"""
CREATE TABLE malzemeler (
    malzeme_id INT IDENTITY(1,1) PRIMARY KEY,
    malzeme_adi NVARCHAR(100) NOT NULL,
    birim NVARCHAR(20) NOT NULL, 
    stok_miktar FLOAT DEFAULT 0,
    birim_maliyet DECIMAL(10, 2) DEFAULT 0
);
"""

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


"""
CREATE TABLE receteler (
    recete_id INT IDENTITY(1,1) PRIMARY KEY,
    urun_id INT NOT NULL,
    malzeme_id INT NOT NULL,
    miktar FLOAT NOT NULL, 
    FOREIGN KEY (urun_id) REFERENCES urunler(urun_id),
    FOREIGN KEY (malzeme_id) REFERENCES malzemeler(malzeme_id)
);
"""
class Recete(db.Model):
    __tablename__ = 'receteler'

    
    urun_id = db.Column(db.Integer, db.ForeignKey('urunler.urun_id'), primary_key=True)
    malzeme_id = db.Column(db.Integer, db.ForeignKey('malzemeler.malzeme_id'), primary_key=True)
    birim_tuketim = db.Column(db.Numeric(12, 3), nullable=False)

    malzeme = db.relationship('Malzeme')
    urun = db.relationship('Urun')

"""
CREATE TABLE tedarikciler (
    tedarikci_id INT IDENTITY(1,1) PRIMARY KEY,
    unvan NVARCHAR(150) NOT NULL,
    vergi_no NVARCHAR(20),
    telefon NVARCHAR(30)
);
"""
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

"""
CREATE TABLE stok_hareketleri (
    hareket_id INT IDENTITY(1,1) PRIMARY KEY,
    malzeme_id INT NOT NULL,
    tip NVARCHAR(10), -- 'Giriş', 'Çıkış'
    miktar DECIMAL(12, 3),
    birim_maliyet DECIMAL(12, 4),
    aciklama NVARCHAR(200),
    tarih DATETIME DEFAULT GETDATE(),
    ref_tablo NVARCHAR(50), -- 'siparis_detaylari', 'giderler'
    ref_id INT,
    FOREIGN KEY (malzeme_id) REFERENCES malzemeler(malzeme_id)
);
"""

class StokHareket(db.Model):
    __tablename__ = 'stok_hareketleri'

    hareket_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    malzeme_id = db.Column(db.Integer, db.ForeignKey('malzemeler.malzeme_id'), nullable=False)
    tip = db.Column(db.String(10)) 
    miktar = db.Column(db.Numeric(12, 3))
    
    birim_maliyet = db.Column(db.Numeric(12, 4))
    
    aciklama = db.Column(db.String(200))
    tarih = db.Column(db.DateTime, default=datetime.now)
    
    ref_tablo = db.Column(db.String(50)) 
    ref_id = db.Column(db.Integer)

    malzeme = db.relationship('Malzeme')

"""
CREATE TABLE giderler (
    gider_id INT IDENTITY(1,1) PRIMARY KEY,
    tedarikci_id INT,
    tur NVARCHAR(20), -- 'Satın Alma', 'Fatura'
    baslik NVARCHAR(150),
    brut_tutar DECIMAL(12, 2),
    kdv_orani DECIMAL(4, 2),
    stopaj_orani DECIMAL(4, 2),
    tarih DATE,
    FOREIGN KEY (tedarikci_id) REFERENCES tedarikciler(tedarikci_id)
);
"""
class Gider(db.Model):
    __tablename__ = 'giderler'

    gider_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tedarikci_id = db.Column(db.Integer, db.ForeignKey('tedarikciler.tedarikci_id'))
    tur = db.Column(db.String(20)) 
    baslik = db.Column(db.String(150))
    brut_tutar = db.Column(db.Numeric(12, 2))
    kdv_orani = db.Column(db.Numeric(4, 2))
    stopaj_orani = db.Column(db.Numeric(4, 2))
    tarih = db.Column(db.Date)