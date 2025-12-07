from app import db

class UrunKategori(db.Model):
    __tablename__ = 'urun_kategorileri'

    kategori_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    kategori_adi = db.Column(db.String(100), nullable=False)
    sira_no = db.Column(db.Integer)

    # İlişki: Bir kategorinin birden çok ürünü olabilir
    urunler = db.relationship('Urun', backref='kategori', lazy=True)

    def to_dict(self):
        return {
            "kategori_id": self.kategori_id,
            "kategori_adi": self.kategori_adi,
            "sira_no": self.sira_no
        }

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

    # İlişki: Bir ürünün birden çok opsiyonu olabilir (Acılı, Büyük Boy vb.)
    opsiyonlar = db.relationship('UrunOpsiyon', backref='urun', lazy=True)

    def to_dict(self):
        return {
            "urun_id": self.urun_id,
            "kategori_id": self.kategori_id,
            "urun_adi": self.urun_adi,
            "fiyat": float(self.fiyat) if self.fiyat else 0, # Decimal'i float'a çeviriyoruz JSON için
            "aktif": self.aktif
        }

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