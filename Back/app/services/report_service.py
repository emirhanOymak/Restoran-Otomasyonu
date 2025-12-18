from sqlalchemy import func, desc, cast, Date
from app import db
from app.models.sales import Odeme, Siparis, SiparisDetay
from app.models.products import Urun
from app.models.inventory import Malzeme, StokHareket # <-- StokHareket burada olmalı
from datetime import date

def get_dashboard_stats():
    bugun = date.today()

    # SQL: SELECT SUM(tutar) FROM odemeler WHERE CAST(olusturma_tarihi AS DATE) = CAST(GETDATE() AS DATE);
    gunluk_ciro = db.session.query(func.sum(Odeme.tutar))\
        .filter(func.cast(Odeme.olusturma_tarihi, Date) == bugun).scalar() or 0

    # SQL: 
    # SELECT SUM(miktar * birim_maliyet) 
    # FROM stok_hareketleri 
    # WHERE tip = 'Çıkış' AND CAST(tarih AS DATE) = CAST(GETDATE() AS DATE);
    gunluk_maliyet = db.session.query(func.sum(StokHareket.miktar * StokHareket.birim_maliyet))\
        .filter(StokHareket.tip == 'Çıkış')\
        .filter(func.cast(StokHareket.tarih, Date) == bugun).scalar() or 0

    
    net_kar = float(gunluk_ciro) - float(gunluk_maliyet)

    # Diğer istatistikler
    toplam_siparis = Siparis.query.count()
    aktif_siparis = Siparis.query.filter(Siparis.durum == "Hazırlanıyor").count()

    # SQL: 
    # SELECT TOP 5 u.urun_adi, SUM(sd.adet) as toplam_satis
    # FROM siparis_detaylari sd
    # JOIN urunler u ON sd.urun_id = u.urun_id
    # GROUP BY u.urun_adi
    # ORDER BY toplam_satis DESC;
    en_cok_satanlar = db.session.query(
        Urun.urun_adi, func.sum(SiparisDetay.adet).label('toplam_satis')
    ).join(Urun).group_by(Urun.urun_adi).order_by(desc('toplam_satis')).limit(5).all()
    
    top_products_data = [{"urun": i[0], "adet": i[1]} for i in en_cok_satanlar]

    # SQL: SELECT * FROM malzemeler WHERE stok_miktar <= kritik_seviye;
    #azalan_stoklar = Malzeme.query.filter(Malzeme.stok_miktar <= Malzeme.kritik_seviye).all()
    
    tum_malzemeler = Malzeme.query.all()
    azalan_stoklar = []

    for m in tum_malzemeler:
        # Veritabanından gelen değerleri sayıya çevir
        stok = float(m.stok_miktar) if m.stok_miktar else 0
        kritik_db = float(m.kritik_seviye) if m.kritik_seviye else 0
        
        # Eğer veritabanında kritik seviye 0 girildiyse, sistem bunu varsayılan olarak 10 kabul etsin
        limit = kritik_db if kritik_db > 0 else 10
        
        if stok <= limit:
            azalan_stoklar.append(m)
            
    low_stock_data = [{"malzeme": m.malzeme_adi, "stok": float(m.stok_miktar), "birim": m.birim} for m in azalan_stoklar]

    return {
        "gunluk_ciro": float(gunluk_ciro),
        "gunluk_maliyet": float(gunluk_maliyet),
        "net_kar": net_kar,
        "toplam_siparis": toplam_siparis,
        "aktif_siparis": aktif_siparis,
        "en_cok_satanlar": top_products_data,
        "kritik_stok": low_stock_data
    }