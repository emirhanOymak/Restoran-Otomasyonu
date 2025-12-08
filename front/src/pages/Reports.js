import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Reports() {
  const [stats, setStats] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/report/dashboard')
      .then(res => {
        setStats(res.data);
        setYukleniyor(false);
      })
      .catch(err => {
        console.error(err);
        setYukleniyor(false);
      });
  }, []);

  if (yukleniyor) return <div className="text-center mt-5"><div className="spinner-border text-primary"/> Veriler Yükleniyor...</div>;

  if (!stats) {
    return (
        <div className="container mt-5 text-center">
            <h3 className="text-danger">Veriler alınamadı!</h3>
            <p>Backend sunucusu çalışmıyor veya bir hata oluştu.</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Tekrar Dene</button>
        </div>
    );
  }

  // Grafik Verisi
  const pieData = {
    labels: stats.en_cok_satanlar.map(item => item.urun),
    datasets: [
      {
        label: 'Satış Adedi',
        data: stats.en_cok_satanlar.map(item => item.adet),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">📊 Finansal & Operasyonel Rapor</h2>
        <Link to="/" className="btn btn-outline-dark">🏠 Ana Menü</Link>
      </div>

      {/* --- 1. SATIR: FİNANSAL DURUM --- */}
      <h5 className="text-muted mb-3">💰 Günlük Finansal Durum</h5>
      <div className="row mb-4">
        {/* Ciro */}
        <div className="col-md-4">
          <div className="card text-white bg-success shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title opacity-75">Bugünkü Ciro</h5>
              <h2 className="display-5 fw-bold">{stats.gunluk_ciro} ₺</h2>
              <small>Kasa Girişi</small>
            </div>
          </div>
        </div>

        {/* Maliyet (Gider) */}
        <div className="col-md-4">
          <div className="card text-white bg-danger shadow h-100">
            <div className="card-body text-center">
              <h5 className="card-title opacity-75">Günlük Maliyet</h5>
              <h2 className="display-5 fw-bold">{stats.gunluk_maliyet} ₺</h2>
              <small>Satılan ürünlerin hammadde maliyeti</small>
            </div>
          </div>
        </div>

        {/* Net Kar */}
        <div className="col-md-4">
          <div className={`card text-white shadow h-100 ${stats.net_kar >= 0 ? 'bg-primary' : 'bg-secondary'}`}>
            <div className="card-body text-center">
              <h5 className="card-title opacity-75">Tahmini Net Kar</h5>
              <h2 className="display-5 fw-bold">
                {stats.net_kar > 0 ? '+' : ''}{stats.net_kar} ₺
              </h2>
              <small>{stats.net_kar >= 0 ? 'Kar' : 'Zarar'} Durumu</small>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. SATIR: OPERASYONEL DURUM --- */}
      <h5 className="text-muted mb-3">⚡ Operasyonel Durum</h5>
      <div className="row mb-4">
         <div className="col-md-6">
          <div className="card bg-info text-white shadow h-100">
            <div className="card-body d-flex justify-content-between align-items-center px-5">
                <div>
                    <h2 className="fw-bold display-4">{stats.aktif_siparis}</h2>
                    <span>Aktif Masa</span>
                </div>
                <i className="bi bi-people-fill fs-1"></i> {/* İkon eklenebilir */}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card bg-warning text-white shadow h-100">
            <div className="card-body d-flex justify-content-between align-items-center px-5">
                <div>
                    <h2 className="fw-bold display-4">{stats.toplam_siparis}</h2>
                    <span>Toplam Sipariş</span>
                </div>
                <i className="bi bi-receipt fs-1"></i>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. SATIR: GRAFİK VE STOK --- */}
      <div className="row">
        {/* Grafik */}
        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-white fw-bold">
              🏆 En Çok Satan Ürünler (Dağılım)
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <div style={{ width: '300px', height: '300px' }}>
                {stats.en_cok_satanlar.length > 0 ? (
                    <Doughnut data={pieData} />
                ) : (
                    <p className="text-muted">Grafik için yeterli veri yok.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kritik Stok */}
        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-header bg-danger text-white fw-bold">
              ⚠️ Kritik Stok Uyarısı
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Malzeme</th>
                    <th>Kalan</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.kritik_stok.map((malzeme, index) => (
                    <tr key={index}>
                      <td>{malzeme.malzeme}</td>
                      <td className="fw-bold text-danger">{malzeme.stok} {malzeme.birim}</td>
                      <td><span className="badge bg-danger rounded-pill">ACİL</span></td>
                    </tr>
                  ))}
                  {stats.kritik_stok.length === 0 && (
                    <tr><td colSpan="3" className="text-center text-success p-4">✅ Stoklar gayet iyi durumda!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;