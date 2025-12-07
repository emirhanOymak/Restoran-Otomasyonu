from sqlalchemy import func, desc, cast, Date
from app import db
from app.models.sales import Odeme, Siparis, SiparisDetay
from app.models.products import Urun
from app.models.inventory import Malzeme, StokHareket # <-- StokHareket burada olmalı
from datetime import date

def get_dashboard_stats():
    bugun = date.today()

    # 1. Ciro (Revenue)
    gunluk_ciro = db.session.query(func.sum(Odeme.tutar))\
        .filter(func.cast(Odeme.olusturma_tarihi, Date) == bugun).scalar() or 0

    # 2. Maliyet (Cost)
    gunluk_maliyet = db.session.query(func.sum(StokHareket.miktar * StokHareket.birim_maliyet))\
        .filter(StokHareket.tip == 'Çıkış')\
        .filter(func.cast(StokHareket.tarih, Date) == bugun).scalar() or 0

    # 3. Net Kar
    net_kar = float(gunluk_ciro) - float(gunluk_maliyet)

    # Diğer istatistikler
    toplam_siparis = Siparis.query.count()
    aktif_siparis = Siparis.query.filter(Siparis.durum == "Hazırlanıyor").count()

    # En çok satanlar
    en_cok_satanlar = db.session.query(
        Urun.urun_adi, func.sum(SiparisDetay.adet).label('toplam_satis')
    ).join(Urun).group_by(Urun.urun_adi).order_by(desc('toplam_satis')).limit(5).all()
    
    top_products_data = [{"urun": i[0], "adet": i[1]} for i in en_cok_satanlar]

    # Kritik Stok
    azalan_stoklar = Malzeme.query.filter(Malzeme.stok_miktar <= Malzeme.kritik_seviye).all()
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