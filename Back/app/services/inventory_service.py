from app import db
from app.models.inventory import Malzeme, StokHareket, Gider, Recete

def get_all_materials():
    malzemeler = Malzeme.query.all()
    
    
    return {
        "malzemeler": [m.to_dict() for m in malzemeler],
        
    }

def add_stock_entry(data):
    malzeme_id = data.get('malzeme_id')
    miktar = float(data.get('miktar'))
    
 
    

    birim_fiyat = float(data.get('birim_fiyat'))
    aciklama = data.get('aciklama')

    # SQL: SELECT * FROM malzemeler WHERE malzeme_id = ...;
    malzeme = Malzeme.query.get(malzeme_id)
    if not malzeme:
        raise Exception("Malzeme bulunamadı")
    
    eski_stok = float(malzeme.stok_miktar) if malzeme.stok_miktar else 0
    # SQL: UPDATE malzemeler SET stok_miktar = ..., birim_maliyet = ... WHERE malzeme_id = ...;
    malzeme.stok_miktar = eski_stok + miktar
    
    
    malzeme.birim_maliyet = birim_fiyat

    db.session.add(malzeme)
    db.session.flush()

    
    toplam_tutar = miktar * birim_fiyat
    # SQL: INSERT INTO stok_hareketleri (malzeme_id, tip, miktar, ref_tablo) VALUES (..., 'Giriş', ..., 'giderler');
    hareket = StokHareket(
        malzeme_id=malzeme_id,
        tip="Giriş",
        miktar=miktar,
        birim_maliyet=birim_fiyat,
        aciklama=f"Satın Alma - {aciklama}",
        ref_tablo="giderler",
        ref_id=0,
        tarih=db.func.now()
    )
    db.session.add(hareket)
    db.session.flush()

    # SQL: INSERT INTO giderler ( tur, baslik, brut_tutar, tarih) VALUES (..., 'Satın Alma', ..., ..., GETDATE());
    yeni_gider = Gider(
        tur="Satın Alma",
        baslik=f"{malzeme.malzeme_adi} Alımı",
        brut_tutar=toplam_tutar,
        kdv_orani=18,
        tarih=db.func.current_date() 
    )
    db.session.add(yeni_gider)
    db.session.flush()

    # SQL: UPDATE stok_hareketleri SET ref_id = (Yeni Gider ID) WHERE hareket_id = ...;
    hareket.ref_id = yeni_gider.gider_id
    # SQL: COMMIT TRANSACTION;
    db.session.commit()

    return {"mesaj": "Stok girişi ve gider kaydı başarıyla yapıldı."}

def get_recipe_by_product(urun_id):
    # Bir ürünün reçetesindeki malzemeleri listeler
    receteler = Recete.query.filter_by(urun_id=urun_id).all()
    sonuc = []
    for r in receteler:
        malzeme = Malzeme.query.get(r.malzeme_id)
        if malzeme:
            sonuc.append({
                "malzeme_id": r.malzeme_id,
                "malzeme_adi": malzeme.malzeme_adi,
                "birim": malzeme.birim,
                "miktar": float(r.birim_tuketim)
            })
    return sonuc

def update_product_recipe(urun_id, items):
    # Önce eski reçeteyi temizle (En temiz yöntem silip yeniden eklemektir)
    Recete.query.filter_by(urun_id=urun_id).delete()
    
    # Yeni malzemeleri ekle
    yeni_kayitlar = []
    for item in items:
        yeni_recete = Recete(
            urun_id=urun_id,
            malzeme_id=item['malzeme_id'],
            birim_tuketim=item['miktar']
        )
        yeni_kayitlar.append(yeni_recete)
    
    db.session.add_all(yeni_kayitlar)
    db.session.commit()
    return {"mesaj": "Reçete güncellendi."}

def create_new_material(data):
    # Aynı isimde malzeme var mı kontrol et
    mevcut = Malzeme.query.filter_by(malzeme_adi=data.get('malzeme_adi')).first()
    if mevcut:
        raise Exception("Bu isimde bir malzeme zaten var.")

    yeni_malzeme = Malzeme(
        malzeme_adi=data.get('malzeme_adi'),
        birim=data.get('birim'), # 'Kg', 'Lt', 'Adet' vb.
        kritik_seviye=data.get('kritik_seviye', 10),
        stok_miktar=0, # İlk oluşturulduğunda stok 0 olsun
        birim_maliyet=0
    )
    
    db.session.add(yeni_malzeme)
    db.session.commit()
    return yeni_malzeme