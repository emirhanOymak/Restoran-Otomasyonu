import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUtensils, FaSearch, FaPrint, FaScroll } from 'react-icons/fa';

function RecipeBook() {
  const [products, setProducts] = useState([]); // Tüm ürünler
  const [filteredProducts, setFilteredProducts] = useState([]); // Arama sonucu
  const [selectedProduct, setSelectedProduct] = useState(null); // Seçilen ürün
  const [recipe, setRecipe] = useState([]); // Seçilen ürünün reçetesi
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingRecipe, setLoadingRecipe] = useState(false);

  // 1. Tüm Ürünleri Çek
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/api/products/menu')
      .then(res => {
        // Kategorilere göre gelen veriyi düz bir ürün listesine çevirelim
        const allProducts = [];
        res.data.forEach(cat => {
            cat.urunler.forEach(u => {
                if(u.aktif) allProducts.push({...u, kategori_adi: cat.kategori_adi});
            });
        });
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      })
      .catch(err => console.error(err));
  }, []);

  // 2. Arama Filtresi
  useEffect(() => {
    const results = products.filter(p =>
      p.urun_adi.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchTerm, products]);

  // 3. Ürün Seçilince Reçeteyi Çek
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setLoadingRecipe(true);
    setRecipe([]); // Önce temizle

    axios.get(`http://127.0.0.1:5000/api/inventory/recipe/${product.urun_id}`)
      .then(res => {
        setRecipe(res.data);
        setLoadingRecipe(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingRecipe(false);
      });
  };

  return (
    <div className="container mt-4" style={{minHeight: '85vh'}}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark"><FaScroll className="me-2"/> Tarif Defteri</h2>
      </div>

      <div className="row h-100">
        
        {/* SOL: ÜRÜN LİSTESİ */}
        <div className="col-md-4 mb-4">
            <div className="card shadow-sm h-100" style={{maxHeight: '75vh'}}>
                <div className="card-header bg-white p-3">
                    <div className="input-group">
                        <span className="input-group-text bg-light border-end-0"><FaSearch className="text-muted"/></span>
                        <input 
                            type="text" 
                            className="form-control border-start-0 bg-light" 
                            placeholder="Ürün Ara..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="card-body p-0" style={{overflowY: 'auto'}}>
                    <div className="list-group list-group-flush">
                        {filteredProducts.map(p => (
                            <button 
                                key={p.urun_id}
                                onClick={() => handleSelectProduct(p)}
                                className={`list-group-item list-group-item-action d-flex align-items-center p-3 border-bottom ${selectedProduct?.urun_id === p.urun_id ? 'active' : ''}`}
                            >
                                <img src={p.resim_url || 'https://via.placeholder.com/40'} 
                                     className="rounded-circle me-3 border" width="40" height="40" alt="" style={{objectFit: 'cover'}}/>
                                <div>
                                    <div className="fw-bold">{p.urun_adi}</div>
                                    <small className={selectedProduct?.urun_id === p.urun_id ? 'text-light opacity-75' : 'text-muted'}>{p.kategori_adi}</small>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* SAĞ: REÇETE DETAYI */}
        <div className="col-md-8">
            {selectedProduct ? (
                <div className="card shadow border-0 h-100">
                    <div className="card-header bg-warning text-dark fw-bold d-flex justify-content-between align-items-center py-3">
                        <span className="fs-5">{selectedProduct.urun_adi} Reçetesi</span>
                        <button className="btn btn-sm btn-dark" onClick={() => window.print()}>
                            <FaPrint className="me-2"/> Yazdır
                        </button>
                    </div>
                    <div className="card-body p-4">
                        
                        <div className="d-flex align-items-start mb-4">
                            <img src={selectedProduct.resim_url || 'https://via.placeholder.com/150'} 
                                 className="rounded shadow-sm me-4" width="120" height="120" style={{objectFit: 'cover'}} alt=""/>
                            <div>
                                <h4 className="fw-bold">{selectedProduct.urun_adi}</h4>
                                <span className="badge bg-secondary me-2">{selectedProduct.kategori_adi}</span>
                                <span className="badge bg-success">{selectedProduct.fiyat} ₺</span>
                                <p className="text-muted mt-2 small">{selectedProduct.aciklama || "Açıklama bulunmuyor."}</p>
                            </div>
                        </div>

                        <hr />

                        <h5 className="fw-bold mb-3 text-primary"><FaUtensils className="me-2"/> Hazırlanış Malzemeleri</h5>
                        
                        {loadingRecipe ? (
                            <div className="text-center py-4"><div className="spinner-border text-warning"/></div>
                        ) : recipe.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Malzeme Adı</th>
                                            <th className="text-center">Kullanılan Miktar</th>
                                            <th className="text-center">Birim</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recipe.map((item, index) => (
                                            <tr key={index}>
                                                <td className="fw-bold">{item.malzeme_adi}</td>
                                                <td className="text-center fs-5 text-dark">{item.miktar}</td>
                                                <td className="text-center badge bg-light text-dark border mt-2">{item.birim}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="alert alert-info text-center">
                                Bu ürün için henüz reçete (malzeme bağlantısı) oluşturulmamış.
                            </div>
                        )}

                    </div>
                </div>
            ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted border rounded bg-light" style={{minHeight: '400px'}}>
                    <FaScroll size={60} className="mb-3 opacity-25"/>
                    <h4>Tarifini görmek için soldan bir ürün seçin.</h4>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

export default RecipeBook;