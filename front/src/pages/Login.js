import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserLock } from 'react-icons/fa';

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // BASİT GÜVENLİK KONTROLÜ
    // Gerçek projede bu backend'e sorulur ama proje için hardcoded yeterli.
    if (username === "admin" && password === "1234") {
      // Giriş Başarılı: Tarayıcıya "Giriş Yaptı" damgası vuruyoruz
      localStorage.setItem("isLoggedIn", "true");
      
      toast.success("Hoşgeldiniz Yönetici! 🔓");
      navigate("/admin"); // Yönetim paneline yönlendir
    } else {
      toast.error("Hatalı Kullanıcı Adı veya Şifre! ⛔");
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#f4f6f9" }}>
      <div className="card shadow border-0" style={{ width: "400px", borderRadius: "15px" }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex p-3 mb-3">
                <FaUserLock size={30} />
            </div>
            <h3 className="fw-bold">Yönetici Girişi</h3>
            <p className="text-muted small">Sadece yetkili personel erişebilir.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label fw-bold">Kullanıcı Adı</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-bold">Şifre</label>
              <input 
                type="password" 
                className="form-control" 
                placeholder="****"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm">
              Giriş Yap
            </button>
          </form>
          
          <div className="text-center mt-4">
            <a href="/" className="text-decoration-none text-muted small">← Ana Sayfaya Dön</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;