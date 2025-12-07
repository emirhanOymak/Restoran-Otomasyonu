from app.models.products import UrunKategori, Urun
from app import db

def get_full_menu():
    # Kategorileri sıra numarasına (sira_no) göre getir
    # İlişkili ürünler ve opsiyonlar SQL Alchemy sayesinde otomatik gelecek
    return UrunKategori.query.order_by(UrunKategori.sira_no).all()

def get_active_products():
    # Sadece aktif ürünleri getir (Örn: Arama yapmak için)
    return Urun.query.filter_by(aktif=True).all()