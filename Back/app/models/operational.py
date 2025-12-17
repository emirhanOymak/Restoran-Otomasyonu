from app import db
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy import text 

"""
CREATE TABLE masalar (
    masa_id INT IDENTITY(1,1) PRIMARY KEY,
    masa_adi NVARCHAR(50) NOT NULL,
    durum NVARCHAR(20) DEFAULT 'Boş' 
);"""

class Masa(db.Model):
    __tablename__ = 'masalar'

    masa_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    masa_adi = db.Column(db.String(50), nullable=False)
    masa_kodu = db.Column(UNIQUEIDENTIFIER, server_default=text("NEWID()"), nullable=False)
    durum = db.Column(db.String(20), default='Boş')
    kisi_sayisi = db.Column(db.Integer, default=0)



    def to_dict(self):
        return {
            "masa_id": self.masa_id,
            "masa_adi": self.masa_adi,
            "masa_kodu": str(self.masa_kodu), 
            "durum": self.durum,
            "kisi_sayisi": self.kisi_sayisi
        }
        
        

class Musteri(db.Model):
    __tablename__ = 'musteriler'

    musteri_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ad_soyad = db.Column(db.String(150))
    telefon = db.Column(db.String(30))

    def to_dict(self):
        return {
            "musteri_id": self.musteri_id,
            "ad_soyad": self.ad_soyad,
            "telefon": self.telefon
        }