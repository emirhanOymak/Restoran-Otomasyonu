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
    servis_istiyor = db.Column(db.Boolean, default=False)


    def to_dict(self):
        return {
            "masa_id": self.masa_id,
            "masa_adi": self.masa_adi,
            "masa_kodu": str(self.masa_kodu), 
            "durum": self.durum,
            "kisi_sayisi": self.kisi_sayisi,
            "servis_istiyor": self.servis_istiyor
        }
        
        

