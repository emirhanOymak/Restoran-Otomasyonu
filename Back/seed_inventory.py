from app import create_app, db
from app.models.products import Urun
from app.models.inventory import Malzeme, Recete

app = create_app()

def seed_inventory():
    with app.app_context():
        print("🥦 Stok ve Reçete verileri ekleniyor...")

        # 1. Malzemeleri Oluştur
        if Malzeme.query.count() == 0:
            malzeme1 = Malzeme(malzeme_adi="Dana Kıyma", birim="Gr", stok_miktar=10000, birim_maliyet=0.5) # 10 KG Kıyma
            malzeme2 = Malzeme(malzeme_adi="Pide", birim="Adet", stok_miktar=50, birim_maliyet=5.0)
            malzeme3 = Malzeme(malzeme_adi="Ayran (Hazır)", birim="Adet", stok_miktar=100, birim_maliyet=10.0)

            db.session.add_all([malzeme1, malzeme2, malzeme3])
            db.session.commit()
            print("✅ Malzemeler eklendi.")
        
        # 2. Reçeteleri Bağla (Ürün -> Malzeme)
        # Ürün ID'lerini veritabanından bulalım (Adana Kebap: 2, Ayran: 3 idi seed.py'ye göre)
        adana = Urun.query.filter_by(urun_adi="Adana Kebap").first()
        ayran_urun = Urun.query.filter_by(urun_adi="Ayran").first()
        
        kiym = Malzeme.query.filter_by(malzeme_adi="Dana Kıyma").first()
        pide = Malzeme.query.filter_by(malzeme_adi="Pide").first()
        ayran_stok = Malzeme.query.filter_by(malzeme_adi="Ayran (Hazır)").first()

        if adana and kiym and Recete.query.count() == 0:
            # Adana Kebap Reçetesi: 200 gr Kıyma + 1 Pide
            r1 = Recete(urun_id=adana.urun_id, malzeme_id=kiym.malzeme_id, birim_tuketim=200)
            r2 = Recete(urun_id=adana.urun_id, malzeme_id=pide.malzeme_id, birim_tuketim=1)
            
            # Ayran Reçetesi: 1 Adet Hazır Ayran
            r3 = Recete(urun_id=ayran_urun.urun_id, malzeme_id=ayran_stok.malzeme_id, birim_tuketim=1)

            db.session.add_all([r1, r2, r3])
            db.session.commit()
            print("✅ Reçeteler oluşturuldu.")
        else:
            print("ℹ️ Reçeteler zaten var veya ürünler bulunamadı.")

if __name__ == '__main__':
    seed_inventory()