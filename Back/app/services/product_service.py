from app.models.products import UrunKategori, Urun
from app import db

def get_full_menu():
    # SQL: SELECT * FROM urun_kategorileri ORDER BY sira_no ASC;
    # (SQLAlchemy arka planda ürünleri ve opsiyonları çekmek için ek SELECT sorguları da atar: Lazy Loading)
    return UrunKategori.query.order_by(UrunKategori.sira_no).all()

def get_active_products():
    # SQL: SELECT * FROM urunler WHERE aktif = 1;
    return Urun.query.filter_by(aktif=True).all()

def add_new_product(data):
    kategori_id = data.get('kategori_id')
    
    yeni_urun = Urun(
        kategori_id=kategori_id,
        urun_adi=data.get('urun_adi'),
        fiyat=data.get('fiyat'),
        aciklama=data.get('aciklama', ''),
        resim_url=data.get('resim_url', ''),
        aktif=True
    )
    db.session.add(yeni_urun)
    db.session.commit()
    return yeni_urun

def update_product_price_or_details(urun_id, data):
    urun = Urun.query.get(urun_id)
    if not urun:
        raise Exception("Ürün bulunamadı")
    
    if 'fiyat' in data:
        urun.fiyat = data['fiyat']
    if 'urun_adi' in data:
        urun.urun_adi = data['urun_adi']
    if 'resim_url' in data:
        urun.resim_url = data['resim_url']
    if 'kategori_id' in data:
        urun.kategori_id = data['kategori_id']
        
    db.session.commit()
    return urun

def delete_product_soft(urun_id):
    # Ürünü tamamen silmek yerine 'aktif' durumunu pasif yapıyoruz.
    # Böylece eski sipariş raporlarında hata çıkmaz.
    urun = Urun.query.get(urun_id)
    if not urun:
        raise Exception("Ürün bulunamadı")
    
    urun.aktif = False
    db.session.commit()
    return {"mesaj": "Ürün silindi (pasife alındı)."}

def add_new_category(data):
    
    gelen_kategori_adi = data.get('kategori_adi')
    
   
    mevcut = UrunKategori.query.filter_by(kategori_adi=gelen_kategori_adi).first()
    
    if mevcut:
      
        raise Exception(f"'{gelen_kategori_adi}' isminde bir kategori zaten mevcut!")

    
    yeni_kategori = UrunKategori(
        kategori_adi=gelen_kategori_adi,
        sira_no=data.get('sira_no', 99)
    )
    db.session.add(yeni_kategori)
    db.session.commit()
    return yeni_kategori