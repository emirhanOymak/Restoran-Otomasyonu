from app.models.products import UrunKategori, Urun
from app import db

def get_full_menu():
    # SQL: SELECT * FROM urun_kategorileri ORDER BY sira_no ASC;
    # (SQLAlchemy arka planda ürünleri ve opsiyonları çekmek için ek SELECT sorguları da atar: Lazy Loading)
    return UrunKategori.query.order_by(UrunKategori.sira_no).all()

def get_active_products():
    # SQL: SELECT * FROM urunler WHERE aktif = 1;
    return Urun.query.filter_by(aktif=True).all()