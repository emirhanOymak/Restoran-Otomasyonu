import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { FaQrcode, FaCamera, FaCheckCircle, FaBan, FaArrowLeft, FaTimes } from 'react-icons/fa';

function QRScanner() {
  const navigate = useNavigate();
  const [taraniyor, setTaraniyor] = useState(false);
  const [masalar, setMasalar] = useState([]);
  const [secilenMasa, setSecilenMasa] = useState(null);

  useEffect(() => {
    // Masaları çek
    axios.get('http://127.0.0.1:5000/api/operational/masalar')
      .then(res => setMasalar(res.data))
      .catch(err => console.error(err));
  }, []);

  const masaSecVeTara = (masa) => {
    setSecilenMasa(masa);
    setTaraniyor(true);
    
    // 2.5 Saniye sonra menüye yönlendir
    setTimeout(() => {
      // Eğer kullanıcı iptal etmediyse yönlendir
      setTaraniyor((prev) => {
        if (prev) navigate(`/menu/${masa.masa_id}`);
        return prev;
      });
    }, 2500);
  };

  return (
    <div className="container-fluid p-0" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      
      {/* TARAMA EKRANI (KAMERA SİMÜLASYONU) */}
      {taraniyor ? (
        <div className="d-flex flex-column align-items-center justify-content-center text-white" 
             style={{ height: '100vh', backgroundColor: '#000', position: 'relative' }}>
          
          {/* İPTAL BUTONU (Sağ Üst) */}
          <button 
            onClick={() => setTaraniyor(false)} 
            className="btn btn-dark bg-opacity-50 position-absolute top-0 end-0 m-4 rounded-circle p-3 d-flex align-items-center justify-content-center"
            style={{ width: '50px', height: '50px', backdropFilter: 'blur(5px)', zIndex: 1050 }}
          >
            <FaTimes size={24} color="white" />
          </button>

          {/* Kamera Vizörü Efekti */}
          <div style={{
              width: '280px', height: '280px', 
              border: '4px solid rgba(255,255,255,0.3)', 
              borderRadius: '20px', 
              position: 'relative',
              boxShadow: '0 0 0 100vh rgba(0,0,0,0.8)', // Çerçeve dışını daha koyu karartır
              display: 'flex',            // İçeriği esnek kutu yap
              alignItems: 'center',       // Dikeyde ortala
              justifyContent: 'center',   // Yatayda ortala
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}>

            <div style={{ opacity: 0.8 }}> {/* Biraz şeffaflık verelim ki kamera görüntüsü gibi dursun */}
                <QRCodeSVG 
                    value={`http://localhost:3000/menu/${secilenMasa?.masa_id}`} 
                    size={200} 
                    fgColor="#ffffff" // QR Beyaz olsun (Siyah zemin üzerinde)
                    bgColor="transparent" 
                />
            </div>
            {/* Köşelerdeki Hareketli Çizgiler */}
            <div className="position-absolute top-0 start-0 border-top border-start border-success" style={{width: '40px', height: '40px', borderWidth: '5px!important'}}></div>
            <div className="position-absolute top-0 end-0 border-top border-end border-success" style={{width: '40px', height: '40px', borderWidth: '5px!important'}}></div>
            <div className="position-absolute bottom-0 start-0 border-bottom border-start border-success" style={{width: '40px', height: '40px', borderWidth: '5px!important'}}></div>
            <div className="position-absolute bottom-0 end-0 border-bottom border-end border-success" style={{width: '40px', height: '40px', borderWidth: '5px!important'}}></div>
            
            {/* Tarama Çizgisi Animasyonu */}
            <div className="scan-line"></div>
          </div>

          <div className="mt-5 text-center z-index-1" style={{ zIndex: 100 }}>
            <h3 className="fw-bold mb-2">QR Kod Okunuyor...</h3>
            <p className="text-white-50">Masa: {secilenMasa?.masa_adi}</p>
            <div className="spinner-border text-success mt-3" role="status"></div>
          </div>

          <style>{`
            .scan-line {
              width: 100%;
              height: 2px;
              background: #0f0;
              box-shadow: 0 0 4px #0f0;
              position: absolute;
              top: 0;
              z-index: 10;
              animation: scan 2s infinite linear;
            }
            @keyframes scan {
              0% { top: 0; opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
          `}</style>
        </div>
      ) : (
        /* SEÇİM EKRANI (LİSTE) */
        <div className="container py-5 position-relative">
          
          {/* GERİ DÖNÜŞ BUTONU (Sol Üst) */}
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-outline-dark position-absolute top-0 start-0 m-4 d-flex align-items-center gap-2 bg-white shadow-sm border-0 px-3 py-2 rounded-pill fw-bold"
            style={{ zIndex: 100 }}
          >
            <FaArrowLeft /> Ana Sayfa
          </button>

          <div className="text-center mb-5 mt-5">
            <div className="d-inline-flex align-items-center justify-content-center bg-white p-3 rounded-circle shadow-sm mb-3">
                <FaCamera size={40} className="text-primary" />
            </div>
            <h2 className="fw-bold text-dark">Masa Seçimi</h2>
            <p className="text-muted">Lütfen oturmak istediğiniz masanın QR kodunu simüle etmek için seçiniz.</p>
          </div>
          
          <div className="row g-4 justify-content-center">
            {masalar.map(masa => (
              <div key={masa.masa_id} className="col-6 col-md-4 col-lg-3">
                <button 
                  onClick={() => masaSecVeTara(masa)}
                  disabled={masa.durum !== 'Boş'}
                  className={`btn h-100 w-100 p-0 border-0 shadow-sm card-hover-effect text-start ${masa.durum === 'Boş' ? 'bg-white' : 'bg-light'}`}
                  style={{ 
                      borderRadius: '15px', 
                      opacity: masa.durum !== 'Boş' ? 0.7 : 1,
                      cursor: masa.durum !== 'Boş' ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.2s'
                  }}
                >
                  <div className="card-body p-4 d-flex flex-column align-items-center justify-content-center text-center" style={{minHeight: '180px'}}>
                    
                    <div className={`mb-3 p-3 rounded-circle ${masa.durum === 'Boş' ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                        {masa.durum === 'Boş' ? <FaQrcode size={32} /> : <FaBan size={32} />}
                    </div>

                    <h5 className="fw-bold m-0 text-dark">{masa.masa_adi}</h5>
                    
                    <div className="mt-3">
                        {masa.durum === 'Boş' ? (
                            <span className="badge bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill">
                                <FaCheckCircle className="me-1"/> Müsait
                            </span>
                        ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger px-3 py-2 rounded-pill">
                                Dolu
                            </span>
                        )}
                    </div>

                  </div>
                  <div className={`w-100 py-1 ${masa.durum === 'Boş' ? 'bg-primary' : 'bg-secondary'}`} style={{borderBottomLeftRadius: '15px', borderBottomRightRadius: '15px'}}></div>
                </button>
              </div>
            ))}
          </div>
          
          <style>{`
            .card-hover-effect:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
            }
          `}</style>
        </div>
      )}
    </div>
  );
}

export default QRScanner;