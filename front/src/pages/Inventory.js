import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBoxOpen, FaPlusCircle, FaExclamationTriangle, FaTags } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Inventory() {
  const [malzemeler, setMalzemeler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  
  // Form State
  const [seciliMalzeme, setSeciliMalzeme] = useState("");
  const [seciliTedarikci, setSeciliTedarikci] = useState("");
  const [miktar, setMiktar] = useState("");
  const [fiyat, setFiyat] = useState("");
  const [yeniMalzemeModalAcik, setYeniMalzemeModalAcik] = useState(false);

  const veriGetir = () => {
    axios.get('http://127.0.0.1:5000/api/inventory/materials')
      .then(res => {
        setMalzemeler(res.data.malzemeler);
        setYukleniyor(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Veriler çekilemedi!");
        setYukleniyor(false);
      });
  };

  useEffect(() => {
    veriGetir();
  }, []);

  // --- YENİ ÖZELLİK: Malzeme seçilince kayıtlı fiyatı otomatik getir ---
  useEffect(() => {
    if (seciliMalzeme) {
      const malzeme = malzemeler.find(m => m.id === parseInt(seciliMalzeme));
      if (malzeme) {
        setFiyat(malzeme.birim_maliyet); // Sabit fiyatı kutuya yaz
      }
    }
  }, [seciliMalzeme, malzemeler]);
  // -------------------------------------------------------------------

  const stokEkle = (e) => {
    e.preventDefault();
    const payload = {
      malzeme_id: seciliMalzeme,
      miktar: miktar,
      birim_fiyat: fiyat,
      aciklama: "Web Panel Girişi"
    };

    axios.post('http://127.0.0.1:5000/api/inventory/stock-entry', payload)
      .then(res => {
        toast.success("✅ " + res.data.mesaj);
        veriGetir();
        setMiktar("");
        // Fiyatı sıfırlamıyoruz, aynı üründen girmeye devam edebiliriz
        setSeciliMalzeme(""); 
      })
      .catch(err => toast.error("Hata: " + (err.response?.data?.hata || err.message)));
  };

  const yeniMalzemeKaydet = (e) => {
    e.preventDefault();
    axios.post('http://127.0.0.1:5000/api/inventory/material/add', yeniMalzemeForm)
        .then(() => {
            toast.success("Yeni Malzeme Tanımlandı! 🎉");
            setYeniMalzemeModalAcik(false);
            setYeniMalzemeForm({ malzeme_adi: "", birim: "Adet", kritik_seviye: 10 }); // Formu temizle
            veriGetir(); // Listeyi yenile ki yeni malzeme dropdown'a gelsin
        })
        .catch(err => toast.error("Hata: " + (err.response?.data?.hata || err.message)));
  };

  const [yeniMalzemeForm, setYeniMalzemeForm] = useState({
    malzeme_adi: "",
    birim: "Adet",
    kritik_seviye: 10
  });

  if (yukleniyor) return <div className="text-center mt-5"><div className="spinner-border text-primary"/> Yükleniyor...</div>;

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark"><FaBoxOpen className="me-2"/> Stok Yönetimi</h2>
        <button className="btn btn-primary me-2" onClick={() => setYeniMalzemeModalAcik(true)}>
            <FaTags className="me-2"/> Yeni Malzeme Tanımla
        </button>
        <Link to="/" className="btn btn-outline-dark">🏠 Ana Menü</Link>
      </div>

      <div className="row">
        {/* SOL: MAL KABUL FORMU */}
        <div className="col-md-4 mb-4">
          <div className="card shadow border-0 h-100">
            <div className="card-header bg-primary text-white fw-bold py-3">
              <FaPlusCircle className="me-2"/> Hızlı Mal Girişi
            </div>
            <div className="card-body">
              <form onSubmit={stokEkle}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Malzeme</label>
                  <select className="form-select" required value={seciliMalzeme} onChange={e => setSeciliMalzeme(e.target.value)}>
                    <option value="">Ürün Seçiniz...</option>
                    {malzemeler.map(m => (
                      <option key={m.id} value={m.id}>{m.adi}</option>
                    ))}
                  </select>
                </div>
                
                <div className="row">
                    <div className="col-6 mb-3">
                        <label className="form-label fw-bold">Miktar ({seciliMalzeme && malzemeler.find(m=>m.id==seciliMalzeme)?.birim})</label>
                        <input type="number" className="form-control" required 
                            placeholder="0" 
                            value={miktar} onChange={e => setMiktar(e.target.value)} />
                    </div>
                    <div className="col-6 mb-3">
                        <label className="form-label fw-bold">Birim Maliyet</label>
                        <div className="input-group">
                            <input type="number" className="form-control" required 
                                placeholder="0.00" step="0.01"
                                value={fiyat} onChange={e => setFiyat(e.target.value)} />
                            <span className="input-group-text">₺</span>
                        </div>
                    </div>
                </div>

              

                <button type="submit" className="btn btn-success w-100 py-2 fw-bold shadow-sm">
                    Stok Ekle
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* SAĞ: LİSTE */}
        <div className="col-md-8">
          <div className="card shadow border-0">
            <div className="card-body p-0">
              <table className="table table-hover table-striped mb-0 align-middle">
                    <thead className="table-light">
                    <tr>
                        <th>Malzeme</th>
                        <th className="text-center">Stok</th>
                        <th className="text-end">Maliyet</th>
                        <th className="text-center">Durum</th>
                    </tr>
                    </thead>
                    <tbody>
                    {malzemeler.map(m => (
                        <tr key={m.id}>
                            <td className="fw-bold">{m.adi}</td>
                            <td className="text-center">{m.stok} {m.birim}</td>
                            <td className="text-end">{m.birim_maliyet.toFixed(2)} ₺</td>
                            <td className="text-center">
                                {m.stok <= 10 ? <span className="badge bg-danger">KRİTİK</span> : <span className="badge bg-success">İYİ</span>}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
      {yeniMalzemeModalAcik && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">Yeni Malzeme Tanımla</h5>
                        <button type="button" className="btn-close" onClick={() => setYeniMalzemeModalAcik(false)}></button>
                    </div>
                    <form onSubmit={yeniMalzemeKaydet}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Malzeme Adı</label>
                                <input type="text" className="form-control" required placeholder="Örn: Zeytinyağı"
                                    value={yeniMalzemeForm.malzeme_adi} 
                                    onChange={e => setYeniMalzemeForm({...yeniMalzemeForm, malzeme_adi: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Birim</label>
                                <select className="form-select" value={yeniMalzemeForm.birim} 
                                        onChange={e => setYeniMalzemeForm({...yeniMalzemeForm, birim: e.target.value})}>
                                    <option value="Adet">Adet</option>
                                    <option value="Kg">Kg</option>
                                    <option value="Gr">Gr</option>
                                    <option value="Lt">Lt</option>
                                    <option value="Porsiyon">Porsiyon</option>
                                    <option value="Paket">Paket</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Kritik Stok Seviyesi</label>
                                <input type="number" className="form-control" 
                                    value={yeniMalzemeForm.kritik_seviye} 
                                    onChange={e => setYeniMalzemeForm({...yeniMalzemeForm, kritik_seviye: e.target.value})} />
                                <small className="text-muted">Stok bu seviyenin altına düşerse uyarı verilir.</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setYeniMalzemeModalAcik(false)}>İptal</button>
                            <button type="submit" className="btn btn-primary">Kaydet</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
      )}
      
    </div>
    
  );
}

export default Inventory;