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
    
 
    tedarikci_id = data.get('tedarikci_id') or None 
    

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

    # SQL: INSERT INTO giderler (tedarikci_id, tur, baslik, brut_tutar, tarih) VALUES (..., 'Satın Alma', ..., ..., GETDATE());
    yeni_gider = Gider(
        tedarikci_id=tedarikci_id, 
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