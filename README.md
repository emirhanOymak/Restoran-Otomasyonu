🍽️ Restoran Otomasyon Sistemi
Bu proje; restoranlar için geliştirilmiş, masa yönetimi, QR menü, stok takibi, reçete bazlı maliyet hesaplama ve kar/zarar analizi yapabilen tam kapsamlı bir Full-Stack web uygulamasıdır.

🚀 Kullanılan Teknolojiler
Backend: Python, Flask, SQLAlchemy, Flask-Migrate

Database: SQL Server (MSSQL)

Frontend: React, Bootswatch (Zephyr), Toastify, Chart.js, SweetAlert2

🛠️ Kurulum Rehberi
Projeyi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayın.

1. Ön Hazırlıklar
Bilgisayarınızda şunların kurulu olduğundan emin olun:

Python (3.x sürümü)

Node.js

SQL Server (Express veya Developer sürümü)

ODBC Driver 17 for SQL Server (Backend bağlantısı için şarttır)

2. Projeyi Klonlama
Terminali açın ve projeyi indirin:

Bash

git clone <PROJE_GITHUB_LINKI>
cd RestoranOtomasyon
3. Veritabanı Kurulumu (SQL Server)
SQL Server Management Studio (SSMS) uygulamasını açın.

Databases klasörüne sağ tıklayıp New Database diyerek RestoranDB adında BOŞ bir veritabanı oluşturun. (Tablo oluşturmanıza gerek yok, kodlar halledecek).

4. Backend Kurulumu (Python & Flask)
Terminalde Back klasörüne gidin:

Bash

cd Back
Sanal Ortamı Kurun ve Aktif Edin:

Bash

# Windows için:
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux için:
# python3 -m venv venv
# source venv/bin/activate
Kütüphaneleri Yükleyin:

Bash

pip install -r requirements.txt
Veritabanı Ayarlarını Yapın (.env): Back klasörü içinde .env adında bir dosya oluşturun ve içine şunları yazın (Kendi SQL Server adınızı yazın):

Ini, TOML

DB_SERVER=DESKTOP-BILGISAYAR-ADI\SQLEXPRESS
DB_NAME=RestoranDB
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_TRUSTED_CONNECTION=yes
Tabloları ve Verileri Oluşturun (Migration & Seed): Bu komutlar tabloları otomatik yaratacak ve başlangıç verilerini (Menü, Masalar, Reçeteler) ekleyecektir.

Bash

# 1. Tabloları veritabanına aktar
flask db upgrade

# 2. Temel verileri (Masalar, Ürünler) ekle
python seed.py

# 3. Stok ve Reçete verilerini ekle
python seed_inventory.py
Backend Sunucusunu Başlatın:

Bash

python run.py
(Terminalde "Running on http://127.0.0.1:5000" yazısını görmelisiniz)

5. Frontend Kurulumu (React)
Yeni bir terminal açın ve proje ana dizininden front klasörüne gidin:

Bash

cd front
Paketleri Yükleyin:

Bash

npm install
Uygulamayı Başlatın:

Bash

npm start
(Tarayıcınız otomatik olarak http://localhost:3000 adresine gidecektir)

🔑 Kullanım Bilgileri
Uygulama açıldığında Müşteri ve Personel olarak ikiye ayrılır.

Yönetim Paneli Giriş Bilgileri:

Kullanıcı Adı: admin

Şifre: 1234

Özellikler & İpuçları
QR Menü: Ana sayfadan "Müşteri / QR Menü"ye girip bir masa seçerek (Simülasyon) menüyü görüntüleyebilir ve sipariş verebilirsiniz.

Yönetim Paneli: Gelen siparişleri buradan görebilir, "Nakit" veya "Kart" ile hesabı kapatabilirsiniz.

Stok Düşümü: Satılan ürünlerin reçetesindeki malzemeler (Örn: Adana için Kıyma) stoktan otomatik düşer.

Raporlar: Günlük Ciro, Kar/Zarar ve Stok durumunu grafiklerle görebilirsiniz.

Resimler: Yemek resimleri proje klasörü içinden (front/public/yemekler) yüklenir, internet gerektirmez.

⚠️ Olası Hatalar
Veritabanı Bağlantı Hatası: .env dosyasındaki DB_SERVER adının SSMS'teki "Server Name" ile birebir aynı olduğundan emin olun.

Migration Hatası: Eğer tablolar zaten varsa flask db stamp head komutunu deneyin.

Resimler Görünmüyorsa: front/public/yemekler klasörünün içinde .jpg dosyalarının olduğundan emin olun.
