from app import create_app, db
from app.models import Masa, UrunKategori, Urun, UrunOpsiyon

app = create_app()

def seed_database():
    with app.app_context():
        print("🌱 Veri ekleme işlemi başlıyor...")

        # 1. Önce Masaları Ekle (Eğer yoksa)
        if Masa.query.count() == 0:
            masa1 = Masa(masa_adi="Bahçe - 1", durum="Boş")
            masa2 = Masa(masa_adi="Bahçe - 2", durum="Boş")
            masa3 = Masa(masa_adi="Salon - 1", durum="Boş")
            
            db.session.add_all([masa1, masa2, masa3])
            print("✅ Masalar eklendi.")
        else:
            print("ℹ️ Masalar zaten var.")

        # 2. Kategorileri Ekle
        if UrunKategori.query.count() == 0:
            kat1 = UrunKategori(kategori_adi="Çorbalar", sira_no=1)
            kat2 = UrunKategori(kategori_adi="Ana Yemekler", sira_no=2)
            kat3 = UrunKategori(kategori_adi="İçecekler", sira_no=3)

            db.session.add_all([kat1, kat2, kat3])
            db.session.commit() # ID'lerin oluşması için commit gerekebilir
            print("✅ Kategoriler eklendi.")
            
            # 3. Ürünleri Ekle (Kategoriler oluştuktan sonra)
            # Not: create_app içindeki session devam ettiği için kat1 objesini kullanabiliriz
            urun1 = Urun(kategori_id=kat1.kategori_id, urun_adi="Mercimek Çorbası", fiyat=50.00)
            urun2 = Urun(kategori_id=kat2.kategori_id, urun_adi="Adana Kebap", fiyat=250.00)
            urun3 = Urun(kategori_id=kat3.kategori_id, urun_adi="Ayran", fiyat=30.00)
            
            db.session.add_all([urun1, urun2, urun3])
            db.session.commit()
            print("✅ Ürünler eklendi.")

            # 4. Opsiyonları Ekle
            opt1 = Urun(kategori_id=kat2.kategori_id, urun_adi="Urfa Kebap", fiyat=240.00)
            db.session.add(opt1)
            db.session.commit()
            
            opsiyon1 = UrunOpsiyon(urun_id=urun2.urun_id, opsiyon_adi="1.5 Porsiyon", fiyat_farki=100.00)
            opsiyon2 = UrunOpsiyon(urun_id=urun2.urun_id, opsiyon_adi="Acılı", fiyat_farki=0)
            
            db.session.add_all([opsiyon1, opsiyon2])
            print("✅ Opsiyonlar eklendi.")

        else:
            print("ℹ️ Ürün verileri zaten var.")

        db.session.commit()
        print("🚀 Seed işlemi başarıyla tamamlandı!")

if __name__ == '__main__':
    seed_database()