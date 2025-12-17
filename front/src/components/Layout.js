import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import { FaHome, FaUtensils, FaChartLine, FaBoxOpen, FaQrcode } from 'react-icons/fa';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); // Giriş anahtarını sil
    navigate("/login"); // Login'e at
  };

  // --- MÜŞTERİ EKRANLARI (SIDEBAR YOK) ---
  if (location.pathname.startsWith('/menu') || location.pathname === '/qr') {
    return (
        <>
            {/* DÜZELTME BURADA: Buraya da zIndex ekledik */}
            <ToastContainer position="top-right" autoClose={3000} theme="colored" style={{ zIndex: 99999 }} />
            {children}
        </>
    );
  }

  // --- YÖNETİCİ EKRANLARI (SIDEBAR VAR) ---
  const menuItems = [
    { path: '/', name: 'Ana Sayfa', icon: <FaHome /> },
    { path: '/admin', name: 'Yönetim Paneli', icon: <FaUtensils /> },
    { path: '/inventory', name: 'Stok Yönetimi', icon: <FaBoxOpen /> },
    { path: '/reports', name: 'Raporlar', icon: <FaChartLine /> },
    { path: '/qr', name: 'QR Kod Üret', icon: <FaQrcode /> },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f4f6f9' }}>
      
      {/* Burası zaten ekliydi */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" style={{ zIndex: 99999 }} />
      
      {/* SIDEBAR */}
      <div className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark" style={{ width: '280px' }}>
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <span className="fs-4 fw-bold">İşlemler</span>
        </a>
        <hr />
        <ul className="nav nav-pills flex-column mb-auto">
          {menuItems.map((item) => (
            <li className="nav-item" key={item.path}>
              <Link 
                to={item.path} 
                className={`nav-link text-white mb-2 d-flex align-items-center ${location.pathname === item.path ? 'active bg-primary' : ''}`}
              >
                <span className="me-3">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        <hr />

        <button 
            onClick={handleLogout} 
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
        >
            <FaSignOutAlt /> Çıkış Yap
        </button>
        
        <div className="text-small text-muted">
          v1.0.0 - Admin Paneli
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        <div className="container-fluid bg-white p-4 rounded shadow-sm" style={{ minHeight: '90vh' }}>
            {children}
        </div>
      </div>
    </div>
  );
}

export default Layout;