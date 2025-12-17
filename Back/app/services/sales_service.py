from app import db
from app.models.sales import Siparis, SiparisDetay
from app.models.products import Urun
from app.models.inventory import Recete, Malzeme, StokHareket
from app.models.operational import Masa 
from app.models.sales import Siparis, SiparisDetay, Odeme

def create_siparis(data):
    masa_id = data.get('masa_id')
    items = data.get('items')

    # SQL: INSERT INTO siparisler (masa_id, durum, tip, olusturma_tarihi) VALUES (..., 'Hazırlanıyor', 'Dine-in', GETDATE());
    yeni_siparis = Siparis(
        masa_id=masa_id,
        durum="Hazırlanıyor",
        tip="Dine-in"
    )
    
    db.session.add(yeni_siparis)
    db.session.flush() 

    # SQL: UPDATE masalar SET durum = 'Dolu' WHERE masa_id = ...;
    ilgili_masa = Masa.query.get(masa_id)
    if ilgili_masa:
        ilgili_masa.durum = "Dolu"
        db.session.add(ilgili_masa)

    toplam_tutar = 0
    
    for item in items:
        urun_id = item.get('urun_id')
        adet = float(item.get('adet'))
        aciklama = item.get('aciklama')

        urun = Urun.query.get(urun_id)
        if not urun:
            continue

        satis_fiyati = urun.fiyat 

        # SQL: INSERT INTO siparis_detaylari (siparis_id, urun_id, adet, satis_fiyati...) VALUES (...);
        detay = SiparisDetay(
            siparis_id=yeni_siparis.siparis_id,
            urun_id=urun_id,
            adet=adet,
            satis_fiyati=satis_fiyati,
            aciklama=aciklama,
            durum="Bekliyor"
        )
        db.session.add(detay)
        db.session.flush() 

        toplam_tutar += (float(satis_fiyati) * adet)

        
        recete_listesi = Recete.query.filter_by(urun_id=urun_id).all()
        
        for r in recete_listesi:
            malzeme = Malzeme.query.get(r.malzeme_id)
            if malzeme:
                dusulecek_miktar = float(r.birim_tuketim) * adet
                
                
                mevcut_stok = float(malzeme.stok_miktar) if malzeme.stok_miktar else 0.0
                # SQL: SELECT * FROM receteler WHERE urun_id = ...;
                # SQL: UPDATE malzemeler SET stok_miktar = stok_miktar - ... WHERE malzeme_id = ...;
                malzeme.stok_miktar = mevcut_stok - dusulecek_miktar
                # SQL: INSERT INTO stok_hareketleri (malzeme_id, tip, miktar, ref_tablo...) VALUES (..., 'Çıkış', ..., 'siparis_detaylari');
                hareket = StokHareket(
                    malzeme_id=malzeme.malzeme_id,
                    tip="Çıkış",
                    miktar=dusulecek_miktar,
                    ref_tablo="siparis_detaylari",
                    ref_id=detay.detay_id,
                    aciklama=f"Sipariş Satışı: {urun.urun_adi}",
                    birim_maliyet=malzeme.birim_maliyet
                )
                db.session.add(hareket)
    # SQL: COMMIT TRANSACTION;
    db.session.commit()
    
    return {
        "siparis_id": yeni_siparis.siparis_id,
        "mesaj": "Sipariş alındı, stoklar düştü ve masa doldu.",
        "toplam_tutar": toplam_tutar
    }
    
def get_masa_hesabi(masa_id):
    
    # SELECT s.siparis_id, s.masa_id, d.urun_adi, d.adet, d.satis_fiyati
    # FROM siparisler s
    # JOIN siparis_detaylari d ON s.siparis_id = d.siparis_id
    # JOIN urunler u ON d.urun_id = u.urun_id
    # WHERE s.masa_id = ... AND s.durum = 'Hazırlanıyor';
    
    aktif_siparis = Siparis.query.filter_by(masa_id=masa_id, durum="Hazırlanıyor").first()
    
    if not aktif_siparis:
        return None

    
    detaylar = []
    toplam = 0
    for detay in aktif_siparis.detaylar:
        tutar = float(detay.satis_fiyati) * float(detay.adet)
        toplam += tutar
        detaylar.append({
            "urun_adi": detay.urun.urun_adi,
            "adet": detay.adet,
            "fiyat": detay.satis_fiyati,
            "toplam": tutar
        })

    return {
        "siparis_id": aktif_siparis.siparis_id,
        "detaylar": detaylar,
        "toplam_tutar": toplam
    }

def odeme_yap_ve_kapat(data):
    masa_id = data.get('masa_id')
    yontem = data.get('yontem') 
    
    
    siparis = Siparis.query.filter_by(masa_id=masa_id, durum="Hazırlanıyor").first()
    if not siparis:
        raise Exception("Bu masada aktif bir sipariş bulunamadı.")
    
    
    hesap_bilgisi = get_masa_hesabi(masa_id)
    tutar = hesap_bilgisi['toplam_tutar']

    # SQL: INSERT INTO odemeler (siparis_id, tutar, yontem, durum) VALUES (..., ..., 'Nakit', 'Ödendi');
    yeni_odeme = Odeme(
        siparis_id=siparis.siparis_id,
        tutar=tutar,
        yontem=yontem,
        durum="Ödendi"
    )
    db.session.add(yeni_odeme)
    
    # SQL: UPDATE siparisler SET durum = 'Kapandı' WHERE siparis_id = ...;
    siparis.durum = "Kapandı"
    
    
    masa = Masa.query.get(masa_id)
    masa.durum = "Boş"
    # SQL: COMMIT TRANSACTION;
    db.session.commit()
    
    return {"mesaj": "Hesap ödendi, masa kapatıldı.", "odenen_tutar": tutar}    