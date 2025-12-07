from app import db
from app.models.inventory import Malzeme, StokHareket, Tedarikci, Gider

def get_all_materials():
    malzemeler = Malzeme.query.all()
    tedarikciler = Tedarikci.query.all()
    
    return {
        "malzemeler": [m.to_dict() for m in malzemeler],
        "tedarikciler": [{"id": t.tedarikci_id, "unvan": t.unvan} for t in tedarikciler]
    }

def add_stock_entry(data):
    malzeme_id = data.get('malzeme_id')
    miktar = float(data.get('miktar'))
    
    # --- DÜZELTME BURADA ---
    # Frontend'den boş string ("") gelirse bunu None (NULL) yapıyoruz
    # Böylece veritabanı hata vermiyor.
    tedarikci_id = data.get('tedarikci_id') or None 
    # -----------------------

    birim_fiyat = float(data.get('birim_fiyat'))
    aciklama = data.get('aciklama')

    # 1. Malzemeyi Bul ve Stoğu Artır
    malzeme = Malzeme.query.get(malzeme_id)
    if not malzeme:
        raise Exception("Malzeme bulunamadı")
    
    eski_stok = float(malzeme.stok_miktar) if malzeme.stok_miktar else 0
    malzeme.stok_miktar = eski_stok + miktar
    
    # Güncel maliyeti güncelle
    malzeme.birim_maliyet = birim_fiyat

    db.session.add(malzeme)
    db.session.flush()

    # 2. Stok Hareket Kaydı
    toplam_tutar = miktar * birim_fiyat
    
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

    # 3. Gider Kaydı
    yeni_gider = Gider(
        tedarikci_id=tedarikci_id, # Artık burası ya ID ya da None olacak
        tur="Satın Alma",
        baslik=f"{malzeme.malzeme_adi} Alımı",
        brut_tutar=toplam_tutar,
        kdv_orani=18,
        tarih=db.func.current_date() # SQL Server'ın tarih fonksiyonu
    )
    db.session.add(yeni_gider)
    db.session.flush()

    # Hareketin ref_id'sini güncelle
    hareket.ref_id = yeni_gider.gider_id

    db.session.commit()

    return {"mesaj": "Stok girişi ve gider kaydı başarıyla yapıldı."}