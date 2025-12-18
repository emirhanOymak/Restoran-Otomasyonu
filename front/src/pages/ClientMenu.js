import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaMinus, FaTimes, FaShoppingCart,FaConciergeBell } from 'react-icons/fa';

function ClientMenu() {
  const { masaId } = useParams();
  const navigate = useNavigate();

  const [menu, setMenu] = useState([]);
  const [masaBilgisi, setMasaBilgisi] = useState(null);
  const [sepet, setSepet] = useState([]);
  
  // Modal State'leri
  const [secilenUrun, setSecilenUrun] = useState(null); 
  const [modalAcik, setModalAcik] = useState(false);
  const [miktar, setMiktar] = useState(1);
  const [secilenOpsiyon, setSecilenOpsiyon] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/products/menu').then(res => setMenu(res.data));
    axios.get('http://127.0.0.1:5000/api/operational/masalar').then(res => {
      const masa = res.data.find(m => m.masa_id === parseInt(masaId));
      if (masa) setMasaBilgisi(masa);
    });
  }, [masaId]);

  // --- DÜZELTME BURADA ---
  // Artık opsiyonu olsun olmasın HER ÜRÜN için modal açıyoruz.
  // Böylece kullanıcı en azından adet seçebiliyor.
  const urunTikla = (urun) => {
    setSecilenUrun(urun);
    setMiktar(1);
    setSecilenOpsiyon(null);
    setModalAcik(true); // Her türlü aç
  };
  // -----------------------

  const sepeteEkleIslemi = (urun, adet, opsiyon) => {
    const birimFiyat = opsiyon ? parseFloat(urun.fiyat) + parseFloat(opsiyon.fiyat_farki) : parseFloat(urun.fiyat);
    const urunAdi = opsiyon ? `${urun.urun_adi} (${opsiyon.opsiyon_adi})` : urun.urun_adi;

    const yeniKalem = {
      urun_id: urun.urun_id,
      urun_adi: urunAdi,
      fiyat: birimFiyat,
      adet: adet,
      aciklama: opsiyon ? opsiyon.opsiyon_adi : ""
    };

    setSepet([...sepet, yeniKalem]);
    toast.success(`${adet}x ${urun.urun_adi} sepete eklendi`);
    setModalAcik(false);
  };

  const siparisiTamamla = () => {
    if (sepet.length === 0) return toast.warning("Sepetiniz boş!");

    const payload = {
      masa_id: parseInt(masaId),
      items: sepet.map(item => ({
        urun_id: item.urun_id,
        adet: item.adet,
        aciklama: item.aciklama
      }))
    };

    axios.post('http://127.0.0.1:5000/api/sales/siparis-ver', payload)
      .then(() => {
        toast.success("🚀 Siparişiniz Mutfağa İletildi!");
        setSepet([]);
      })
      .catch(err => {
        const mesaj = err.response?.data?.hata || err.message;
        toast.error("Hata: " + mesaj);
      });
  };

  const garsonCagir = () => {
    axios.post(`http://127.0.0.1:5000/api/operational/cagir/${masaId}`)
        .then(() => {
            Swal.fire({
                title: 'Garson Çağrıldı! 🔔',
                text: 'Ekip arkadaşlarımız birazdan masanızda olacaktır.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        })
        .catch(() => toast.error("Bağlantı hatası!"));
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '120px' }}>
      
      {/* HEADER */}
      <nav className="navbar navbar-dark bg-danger sticky-top shadow px-3">
        <div className="d-flex align-items-center">
            <button onClick={() => navigate('/')} className="btn btn-sm btn-outline-light me-3 border-0">
                <FaArrowLeft size={20} />
            </button>
            <span className="navbar-brand mb-0 h1 fw-bold">Ana Sayfa</span>
        </div>
        <span className="badge bg-dark px-3 py-2">Masa: {masaBilgisi?.masa_adi}</span>
      </nav>

      <div className="container mt-4">
        <div className="row">
          {/* MENÜ LİSTESİ */}
          <div className="col-md-8">
            {menu.map(kat => (
              <div key={kat.kategori_id} className="mb-5">
                <h3 className="fw-bold text-dark border-start border-4 border-danger ps-3 mb-4">{kat.kategori_adi}</h3>
                <div className="row g-3">
                  {kat.urunler.filter(urun => urun.aktif).map(urun => (
                    <div key={urun.urun_id} className="col-6 col-lg-4">
                      <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer', borderRadius: '15px', overflow: 'hidden' }} onClick={() => urunTikla(urun)}>
                        <div style={{ height: '140px', backgroundImage: `url(${urun.resim_url || 'https://via.placeholder.com/300'})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className="fw-bold m-0 text-truncate">{urun.urun_adi}</h6>
                            <span className="badge bg-success">{urun.fiyat}₺</span>
                          </div>
                          {urun.opsiyonlar?.length > 0 && <small className="text-muted" style={{fontSize: '0.75rem'}}>+ Seçenekler</small>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* SEPET KUTUSU */}
          <div className="col-md-4">
            <div className="card shadow border-0 sticky-top" style={{ top: '80px', borderRadius: '15px' }}>
              <div className="card-header bg-dark text-white fw-bold py-3 d-flex justify-content-between">
                <span><FaShoppingCart className="me-2"/> Sepetim</span>
                {sepet.length > 0 && <span className="badge bg-danger rounded-pill">{sepet.length}</span>}
              </div>
              <div className="card-body p-0">
                {sepet.length === 0 ? <div className="text-center py-5 text-muted">Sepetiniz boş.</div> : (
                  <ul className="list-group list-group-flush">
                    {sepet.map((item, index) => (
                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <div className="fw-bold">{item.urun_adi}</div>
                                <div className="text-muted small">x{item.adet}</div>
                            </div>
                            <div className="d-flex align-items-center">
                                <span className="fw-bold me-3">{(item.fiyat * item.adet).toFixed(2)} ₺</span>
                                <button onClick={() => {const s=[...sepet]; s.splice(index,1); setSepet(s)}} className="btn btn-sm text-danger"><FaTimes/></button>
                            </div>
                        </li>
                    ))}
                  </ul>
                )}
                {sepet.length > 0 && (
                  <div className="p-3 bg-light border-top">
                    <div className="d-flex justify-content-between fs-5 fw-bold mb-3">
                        <span>TOPLAM:</span>
                        <span className="text-danger">{sepet.reduce((acc, i) => acc + (i.fiyat * i.adet), 0).toFixed(2)} ₺</span>
                    </div>
                    <button onClick={siparisiTamamla} className="btn btn-success w-100 py-3 rounded-pill fw-bold shadow">✅ SİPARİŞİ ONAYLA</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* OPSİYON ve DETAY MODALI (Her Ürün İçin Açılır) */}
      {modalAcik && secilenUrun && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow border-0">
              
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold fs-4">{secilenUrun.urun_adi}</h5>
                <button type="button" className="btn-close" onClick={() => setModalAcik(false)}></button>
              </div>
              
              <div className="modal-body pt-2">
                <p className="text-muted small mb-4">Ürün adedi ve özelliklerini seçiniz.</p>

                {/* --- SADECE OPSİYON VARSA GÖSTERİLECEK KISIM --- */}
                {secilenUrun.opsiyonlar && secilenUrun.opsiyonlar.length > 0 && (
                    <div className="mb-4">
                        <label className="fw-bold mb-2 d-block text-dark">Seçenekler:</label>
                        <div className="d-flex flex-wrap gap-2">
                            <button 
                                className={`btn btn-sm rounded-pill px-3 py-2 ${secilenOpsiyon === null ? 'btn-danger text-white' : 'btn-outline-secondary'}`} 
                                onClick={() => setSecilenOpsiyon(null)}
                            >
                                Standart
                            </button>
                            {secilenUrun.opsiyonlar.map(ops => (
                                <button 
                                    key={ops.opsiyon_id} 
                                    className={`btn btn-sm rounded-pill px-3 py-2 ${secilenOpsiyon?.opsiyon_id === ops.opsiyon_id ? 'btn-danger text-white' : 'btn-outline-secondary'}`} 
                                    onClick={() => setSecilenOpsiyon(ops)}
                                >
                                    {ops.opsiyon_adi} 
                                    {ops.fiyat_farki > 0 && <span className="ms-1 opacity-75">(+{ops.fiyat_farki}₺)</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {/* ------------------------------------------------ */}

                {/* Miktar Seçimi (Her Ürün İçin Var) */}
                <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-3 mt-3">
                    <span className="fw-bold text-dark">Adet:</span>
                    <div className="d-flex align-items-center bg-white rounded-pill shadow-sm px-1 py-1">
                        <button className="btn btn-light rounded-circle text-primary" style={{width: '40px', height: '40px'}} onClick={() => setMiktar(m => Math.max(1, m-1))}>
                            <FaMinus size={12}/>
                        </button>
                        <span className="mx-3 fw-bold fs-5" style={{minWidth: '20px', textAlign: 'center'}}>{miktar}</span>
                        <button className="btn btn-light rounded-circle text-primary" style={{width: '40px', height: '40px'}} onClick={() => setMiktar(m => m+1)}>
                            <FaPlus size={12}/>
                        </button>
                    </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button 
                    className="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-sm" 
                    onClick={() => sepeteEkleIslemi(secilenUrun, miktar, secilenOpsiyon)}
                >
                    <span className="me-2">Sepete Ekle</span> • 
                    <span className="ms-2">
                        {((parseFloat(secilenUrun.fiyat) + (secilenOpsiyon ? parseFloat(secilenOpsiyon.fiyat_farki) : 0)) * miktar).toFixed(2)} ₺
                    </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
          onClick={garsonCagir}
          className="btn btn-warning rounded-circle shadow-lg d-flex align-items-center justify-content-center"
          style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              width: '70px',
              height: '70px',
              zIndex: 1000,
              border: '4px solid white'
          }}
      >
          <FaConciergeBell size={30} className="text-dark"/>
      </button>

    </div>
  );
}

export default ClientMenu;