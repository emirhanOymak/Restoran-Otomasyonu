import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'; // <-- YENİ KÜTÜPHANE

function AdminDashboard() {
  const [masalar, setMasalar] = useState([]);
  const [seciliMasa, setSeciliMasa] = useState(null);
  const [adisyon, setAdisyon] = useState(null);

  const masalariGetir = () => {
    axios.get('http://127.0.0.1:5000/api/operational/masalar')
      .then(res => setMasalar(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    masalariGetir();
    const interval = setInterval(masalariGetir, 5000);
    return () => clearInterval(interval);
  }, []);

  const masaTikla = (masa) => {
    setSeciliMasa(masa);
    setAdisyon(null);

    if (masa.durum === 'Dolu') {
      axios.get(`http://127.0.0.1:5000/api/sales/hesap/${masa.masa_id}`)
        .then(res => setAdisyon(res.data))
        .catch(err => console.error("Adisyon çekilemedi", err));
    }
  };

  // --- MODERN ONAY PENCERESİ (SWEETALERT2) ---
  const hesabiKapat = (yontem) => {
    Swal.fire({
      title: 'Hesabı Kapat?',
      text: `${seciliMasa.masa_adi} için ${yontem} ile ödeme alınacak.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Evet, Onayla!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Kullanıcı "Evet" dedi, işlemi yap
        axios.post('http://127.0.0.1:5000/api/sales/odeme-yap', {
          masa_id: seciliMasa.masa_id,
          yontem: yontem 
        })
        .then(res => {
          // Başarılı olursa güzel bir onay kutusu göster
          Swal.fire(
            'İşlem Tamam!',
            `Tahsilat: ${res.data.odenen_tutar} ₺ (${yontem})`,
            'success'
          );
          setSeciliMasa(null);
          masalariGetir();
        })
        .catch(err => {
          toast.error("Hata: " + (err.response?.data?.hata || err.message));
        });
      }
    });
  };
  // --------------------------------------------

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-dark fw-bold">🖥️ Yönetici Paneli</h2>
      
      <div className="row">
        {/* SOL: MASALAR */}
        <div className="col-md-8">
          <div className="row">
            {masalar.map((masa) => (
              <div key={masa.masa_id} className="col-md-3 col-sm-4 mb-3">
                <button 
                  onClick={() => masaTikla(masa)}
                  className={`btn w-100 p-3 shadow-sm text-white fw-bold position-relative ${
                    masa.durum === 'Boş' ? 'btn-success' : 'btn-danger'
                  }`}
                  style={{ height: '100px', fontSize: '1.1rem', borderRadius: '15px' }}
                >
                  {masa.masa_adi}
                  <div className="fs-6 fw-normal mt-1 opacity-75">{masa.durum}</div>
                  {masa.durum === 'Dolu' && (
                    <span className="position-absolute top-0 start-100 translate-middle p-2 bg-warning border border-light rounded-circle">
                      <span className="visually-hidden">Dolu</span>
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SAĞ: ADİSYON */}
        <div className="col-md-4">
          {seciliMasa ? (
            <div className="card shadow border-0" style={{borderRadius: '15px'}}>
              <div className="card-header bg-dark text-white py-3" style={{borderTopLeftRadius: '15px', borderTopRightRadius: '15px'}}>
                <h5 className="m-0 fw-bold">{seciliMasa.masa_adi} İşlemleri</h5>
              </div>
              <div className="card-body">
                {seciliMasa.durum === 'Boş' ? (
                  <div className="text-center py-4 text-muted">
                    <p>Bu masa şu an boş.</p>
                    <small>Sipariş girildiğinde burada detaylar görünecek.</small>
                  </div>
                ) : (
                  <>
                    <h6 className="border-bottom pb-2 fw-bold text-primary">Adisyon Özeti:</h6>
                    {adisyon ? (
                      <ul className="list-group list-group-flush mb-4">
                        {adisyon.detaylar.map((item, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between px-0">
                            <div>
                                <span>{item.urun_adi}</span>
                                <div className="text-muted small">x{item.adet}</div>
                            </div>
                            <span className="fw-bold">{item.toplam} ₺</span>
                          </li>
                        ))}
                        <li className="list-group-item d-flex justify-content-between fw-bold bg-light mt-2 rounded">
                          <span>TOPLAM:</span>
                          <span className="text-danger fs-5">{adisyon.toplam_tutar} ₺</span>
                        </li>
                      </ul>
                    ) : (
                      <div className="text-center py-3"><div className="spinner-border text-primary"/></div>
                    )}
                    
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button onClick={() => hesabiKapat('Nakit')} className="btn btn-success flex-grow-1 py-2 fw-bold">
                            💵 Nakit
                        </button>
                        <button onClick={() => hesabiKapat('Kredi Kartı')} className="btn btn-primary flex-grow-1 py-2 fw-bold">
                            💳 Kart
                        </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-info text-center shadow-sm" style={{borderRadius: '15px'}}>
              <h5>👈 Masa Seçimi</h5>
              <p>İşlem yapmak için soldan bir masa seçiniz.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;