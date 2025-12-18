import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaUtensils, FaScroll, FaSave, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';

function AdminMenu() {
  const [menu, setMenu] = useState([]);
  const [kategoriler, setKategoriler] = useState([]); // Dropdown için düz liste

  const [stokListesi, setStokListesi] = useState([]);
  
  // Form State
  const [modalAcik, setModalAcik] = useState(false);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [aktifUrunId, setAktifUrunId] = useState(null);

  const [formData, setFormData] = useState({
    urun_adi: '',
    fiyat: '',
    kategori_id: '',
    resim_url: '',
    aciklama: ''
  });

  const [receteModalAcik, setReceteModalAcik] = useState(false);
  const [seciliUrunAdi, setSeciliUrunAdi] = useState("");
  const [receteListesi, setReceteListesi] = useState([]); // O anki ürünün reçetesi
  const [secilenMalzeme, setSecilenMalzeme] = useState("");
  const [secilenMiktar, setSecilenMiktar] = useState("");

  const veriGetir = () => {
    axios.get('http://127.0.0.1:5000/api/products/menu')
      .then(res => {
        setMenu(res.data);
        // Kategorileri düzleştirip alalım (Dropdown için)
        const katList = res.data.map(k => ({ id: k.kategori_id, adi: k.kategori_adi }));
        setKategoriler(katList);
      })
      .catch(err => console.error(err));

    axios.get('http://127.0.0.1:5000/api/inventory/materials')
      .then(res => {
         setStokListesi(res.data.malzemeler);
      });  
  };

  useEffect(() => {
    veriGetir();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const modalAc = (urun = null) => {
    if (urun) {
      setDuzenlemeModu(true);
      setAktifUrunId(urun.urun_id);
      setFormData({
        urun_adi: urun.urun_adi,
        fiyat: urun.fiyat,
        kategori_id: urun.kategori_id, // Burası önemli, backend'den dönmeli
        resim_url: urun.resim_url || '',
        aciklama: urun.aciklama || ''
      });
    } else {
      setDuzenlemeModu(false);
      setFormData({ urun_adi: '', fiyat: '', kategori_id: '', resim_url: '', aciklama: '' });
    }
    setModalAcik(true);
  };

  const kaydet = (e) => {
    e.preventDefault();

    const payload = {
        ...formData,
        kategori_id: parseInt(formData.kategori_id), // Metni tamsayıya çevir
        fiyat: parseFloat(formData.fiyat)            // Metni ondalıklı sayıya çevir
    };
    
    if (duzenlemeModu) {
      // GÜNCELLEME
      axios.put(`http://127.0.0.1:5000/api/products/update/${aktifUrunId}`, formData)
        .then(() => {
          toast.success("Ürün güncellendi!");
          setModalAcik(false);
          veriGetir();
        })
        .catch(err => {
            // 2. Gerçek hatayı ekrana basma (Debug için çok önemli)
            const mesaj = err.response?.data?.hata || err.message;
            toast.error("Hata: " + mesaj);
        });
    } else {
      // YENİ EKLEME
      axios.post(`http://127.0.0.1:5000/api/products/add`, formData)
        .then(() => {
          toast.success("Yeni ürün eklendi!");
          setModalAcik(false);
          veriGetir();
        })
        .catch(err => {
            // 2. Gerçek hatayı ekrana basma
            const mesaj = err.response?.data?.hata || err.message;
            toast.error("Hata: " + mesaj);
        });
    }
  };

  const sil = (urun) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: `${urun.urun_adi} silinecek!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://127.0.0.1:5000/api/products/delete/${urun.urun_id}`)
          .then(() => {
            Swal.fire('Silindi!', '', 'success');
            veriGetir();
          })
          .catch(() => toast.error("Silinemedi!"));
      }
    });
  };

  const kategoriEkle = async () => {
    // 1. Kullanıcıdan kategori ismini al
    const { value: text } = await Swal.fire({
        input: 'text',
        inputLabel: 'Yeni Kategori Adı',
        inputPlaceholder: 'Örn: Tatlılar',
        showCancelButton: true,
        confirmButtonText: 'Ekle',
        cancelButtonText: 'İptal',
        inputValidator: (value) => {
            if (!value) {
                return 'Kategori adı boş olamaz!'
            }
        }
    });

    // 2. Eğer bir isim girdiyse Backend'e gönder
    if (text) {
        axios.post('http://127.0.0.1:5000/api/products/category/add', { kategori_adi: text })
            .then(() => {
                // BAŞARILI OLURSA
                Swal.fire({
                    title: 'Başarılı!',
                    text: `${text} kategorisi eklendi.`,
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                veriGetir(); // Listeyi yenile
            })
            .catch(err => {
                // --- HATA OLURSA (BURASI ÇÖKMEYİ ENGELLER) ---
                
                // Backend'den gelen özel hata mesajını al (Örn: "İçecekler zaten var")
                const sunucuMesaji = err.response?.data?.hata;
                const genelMesaj = err.message;

                Swal.fire({
                    title: 'Eklenemedi!',
                    text: sunucuMesaji || "Sunucu hatası: " + genelMesaj,
                    icon: 'warning', // 'error' yerine 'warning' daha yumuşak durur
                    confirmButtonText: 'Tamam'
                });
            });
    }
  };

  const receteModalAc = (urun) => {
      setAktifUrunId(urun.urun_id);
      setSeciliUrunAdi(urun.urun_adi);
      setReceteModalAcik(true);
      setReceteListesi([]); // Önce temizle
      
      // Backend'den mevcut reçeteyi çekiyoruz (Senin tablonu kullanıyor)
      axios.get(`http://127.0.0.1:5000/api/inventory/recipe/${urun.urun_id}`)
          .then(res => setReceteListesi(res.data))
          .catch(err => console.error(err));
  };

  const receteyeEkle = () => {
      if (!secilenMalzeme || !secilenMiktar) return toast.warning("Malzeme ve miktar seçmelisin");
      
      const malzemeDetay = stokListesi.find(m => m.id === parseInt(secilenMalzeme));
      
      const yeniKalem = {
          malzeme_id: parseInt(secilenMalzeme),
          malzeme_adi: malzemeDetay.adi,
          birim: malzemeDetay.birim,
          miktar: parseFloat(secilenMiktar)
      };

      setReceteListesi([...receteListesi, yeniKalem]);
      setSecilenMalzeme("");
      setSecilenMiktar("");
  };

  const recetedenCikar = (index) => {
      const yeniListe = [...receteListesi];
      yeniListe.splice(index, 1);
      setReceteListesi(yeniListe);
  };

  const receteKaydet = () => {
      axios.post(`http://127.0.0.1:5000/api/inventory/recipe/${aktifUrunId}`, { items: receteListesi })
        .then(() => {
            toast.success("Reçete Kaydedildi! ✅");
            setReceteModalAcik(false);
        })
        .catch(err => toast.error("Hata: " + err.message));
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold"><FaUtensils className="me-2"/> Menü Yönetimi</h2>
        <div>
            <button className="btn btn-outline-primary me-2" onClick={kategoriEkle}>
                <FaPlus /> Kategori Ekle
            </button>
            <button className="btn btn-success" onClick={() => modalAc(null)}>
                <FaPlus /> Yeni Ürün Ekle
            </button>
        </div>
      </div>

      {menu.map(kat => (
        <div key={kat.kategori_id} className="card mb-4 shadow-sm border-0">
          <div className="card-header bg-dark text-white fw-bold">
            {kat.kategori_adi}
          </div>
          <div className="card-body p-0">
            <table className="table table-hover mb-0 align-middle">
                <thead>
                    <tr>
                        <th width="50">Resim</th>
                        <th>Ürün Adı</th>
                        <th>Fiyat</th>
                        <th className="text-end">İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                {kat.urunler.filter(u => u.aktif).map(urun => (
                    <tr key={urun.urun_id}>
                        <td>
                            <img src={urun.resim_url || 'https://via.placeholder.com/50'} 
                                 alt="urun" className="rounded" width="40" height="40" style={{objectFit: 'cover'}}/>
                        </td>
                        <td className="fw-bold">{urun.urun_adi}</td>
                        <td>{urun.fiyat} ₺</td>
                        <td className="text-end">
                            <button className="btn btn-sm btn-info me-2 text-white" onClick={() => receteModalAc(urun)} title="Tarif/Reçete">
                                <FaScroll /> Reçete
                            </button>
                            <button className="btn btn-sm btn-warning me-2 text-white" onClick={() => modalAc(urun)}>
                                <FaEdit />
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => sil(urun)}>
                                <FaTrash />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* MODAL (FORM) */}
      {modalAcik && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{duzenlemeModu ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h5>
                <button type="button" className="btn-close" onClick={() => setModalAcik(false)}></button>
              </div>
              <form onSubmit={kaydet}>
                <div className="modal-body">
                    
                    <div className="mb-3">
                        <label className="form-label">Ürün Adı</label>
                        <input type="text" className="form-control" name="urun_adi" required 
                               value={formData.urun_adi} onChange={handleInputChange} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Kategori</label>
                        <select className="form-select" name="kategori_id" required
                                value={formData.kategori_id} onChange={handleInputChange}>
                            <option value="">Seçiniz...</option>
                            {kategoriler.map(k => (
                                <option key={k.id} value={k.id}>{k.adi}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Fiyat (₺)</label>
                        <input type="number" className="form-control" name="fiyat" required step="0.01"
                               value={formData.fiyat} onChange={handleInputChange} />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Resim URL (Opsiyonel)</label>
                        <input type="text" className="form-control" name="resim_url" placeholder="https://..."
                               value={formData.resim_url} onChange={handleInputChange} />
                    </div>

                </div>
                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setModalAcik(false)}>İptal</button>
                    <button type="submit" className="btn btn-primary">Kaydet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {receteModalAcik && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-info text-white">
                        <h5 className="modal-title"><FaScroll className="me-2"/> {seciliUrunAdi} - Reçete/Tarif</h5>
                        <button type="button" className="btn-close" onClick={() => setReceteModalAcik(false)}></button>
                    </div>
                    <div className="modal-body">
                        
                        {/* Malzeme Seçimi */}
                        <div className="row g-2 align-items-end mb-4 border-bottom pb-3">
                            <div className="col-md-6">
                                <label className="small fw-bold">Malzeme Seç</label>
                                <select className="form-select" value={secilenMalzeme} onChange={e => setSecilenMalzeme(e.target.value)}>
                                    <option value="">Seçiniz...</option>
                                    {stokListesi.map(s => (
                                        <option key={s.id} value={s.id}>{s.adi} (Stok: {s.stok} {s.birim})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold">Kullanım Miktarı</label>
                                <input type="number" step="0.01" className="form-control" placeholder="0" 
                                       value={secilenMiktar} onChange={e => setSecilenMiktar(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <button className="btn btn-primary w-100" onClick={receteyeEkle}>
                                    <FaPlus /> Listeye Ekle
                                </button>
                            </div>
                        </div>

                        {/* Malzeme Listesi Tablosu */}
                        <h6 className="fw-bold text-muted">Kullanılacak Malzemeler</h6>
                        {receteListesi.length === 0 ? (
                            <div className="alert alert-warning">Bu ürün için henüz tarif oluşturulmamış.</div>
                        ) : (
                            <table className="table table-sm table-striped">
                                <thead>
                                    <tr>
                                        <th>Malzeme</th>
                                        <th>Miktar</th>
                                        <th>Birim</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receteListesi.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.malzeme_adi}</td>
                                            <td className="fw-bold text-danger">{item.miktar}</td>
                                            <td>{item.birim}</td>
                                            <td className="text-end">
                                                <button className="btn btn-sm btn-outline-danger border-0" onClick={() => recetedenCikar(index)}>
                                                    <FaTimes />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={() => setReceteModalAcik(false)}>Kapat</button>
                        <button type="button" className="btn btn-success" onClick={receteKaydet}>
                            <FaSave className="me-2"/> Reçeteyi Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

export default AdminMenu;