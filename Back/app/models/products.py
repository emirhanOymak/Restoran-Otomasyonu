from app import db

"""
CREATE TABLE urun_kategorileri (
    kategori_id INT IDENTITY(1,1) PRIMARY KEY,
    kategori_adi NVARCHAR(100) NOT NULL,
    resim_url NVARCHAR(255)
);"""

class UrunKategori(db.Model):
    __tablename__ = 'urun_kategorileri'

    kategori_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kategori_adi = db.Column(db.String(100), nullable=False)
    sira_no = db.Column(db.Integer)

    urunler = db.relationship('Urun', backref='kategori', lazy=True)

    def to_dict(self):
        return {
            "kategori_id": self.kategori_id,
            "kategori_adi": self.kategori_adi,
            "sira_no": self.sira_no
        }


"""
CREATE TABLE urunler (
    urun_id INT IDENTITY(1,1) PRIMARY KEY,
    kategori_id INT NOT NULL,
    urun_adi NVARCHAR(100) NOT NULL,
    aciklama NVARCHAR(MAX),
    fiyat DECIMAL(10, 2) NOT NULL,
    resim_url NVARCHAR(255),
    aktif_mi BIT DEFAULT 1,
    FOREIGN KEY (kategori_id) REFERENCES kategoriler(kategori_id)
);"""
class Urun(db.Model):
    __tablename__ = 'urunler'

    urun_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kategori_id = db.Column(db.Integer, db.ForeignKey('urun_kategorileri.kategori_id'))
    urun_adi = db.Column(db.String(150), nullable=False)
    barkod = db.Column(db.String(50))
    fiyat = db.Column(db.Numeric(10, 2), default=0)
    resim_url = db.Column(db.String)
    kdv_orani = db.Column(db.Numeric(4, 2), default=18)
    aktif = db.Column(db.Boolean, default=True)

    
    opsiyonlar = db.relationship('UrunOpsiyon', backref='urun', lazy=True)

    def to_dict(self):
        return {
            "urun_id": self.urun_id,
            "kategori_id": self.kategori_id,
            "urun_adi": self.urun_adi,
            "fiyat": float(self.fiyat) if self.fiyat else 0,
            "aktif": self.aktif
        }


"""
CREATE TABLE urun_opsiyonlari (
    opsiyon_id INT IDENTITY(1,1) PRIMARY KEY,
    urun_id INT NOT NULL,
    opsiyon_adi NVARCHAR(100) NOT NULL,
    fiyat_farki DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (urun_id) REFERENCES urunler(urun_id)
);
"""
class UrunOpsiyon(db.Model):
    __tablename__ = 'urun_opsiyonlari'

    opsiyon_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    urun_id = db.Column(db.Integer, db.ForeignKey('urunler.urun_id'), nullable=False)
    opsiyon_adi = db.Column(db.String(100), nullable=False)
    fiyat_farki = db.Column(db.Numeric(10, 2), default=0)

    def to_dict(self):
        return {
            "opsiyon_id": self.opsiyon_id,
            "opsiyon_adi": self.opsiyon_adi,
            "fiyat_farki": float(self.fiyat_farki) if self.fiyat_farki else 0
        }