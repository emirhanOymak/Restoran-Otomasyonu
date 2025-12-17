import React from 'react';
import { Link } from 'react-router-dom';
import { FaQrcode, FaArrowRight, FaUserShield } from 'react-icons/fa';

function Home() {
  return (
    <div className="container-fluid p-0 position-relative" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      
      {/* GİZLİ YÖNETİCİ GİRİŞİ (Sağ Üst) */}
      <div className="position-absolute top-0 end-0 m-4">
        <Link to="/login" className="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 border-0">
            <FaUserShield /> Personel Girişi
        </Link>
      </div>

      {/* ORTA ALAN: SADECE MÜŞTERİ ODAKLI */}
      <div className="d-flex flex-column align-items-center justify-content-center text-center" 
           style={{ height: '100vh', backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200")', backgroundSize: 'cover' }}>
        
        <h1 className="display-3 fw-bold text-dark mb-3"> Restoran Otomasyon Sistemi</h1>
        <p className="lead text-muted mb-5">Hoşgeldiniz, sipariş vermek için lütfen masanızı seçin.</p>

        <Link to="/qr" className="btn btn-warning btn-lg px-5 py-3 rounded-pill shadow fw-bold d-flex align-items-center gap-3 hover-scale">
            <FaQrcode size={24} />
            <span>Sipariş Vermeye Başla</span>
            <FaArrowRight />
        </Link>

        <p className="mt-5 text-muted small">© 2025 Restoran Otomasyon Sistemi</p>
      </div>

      <style>{`
        .hover-scale:hover { transform: scale(1.05); transition: transform 0.2s; }
      `}</style>
    </div>
  );
}

export default Home;