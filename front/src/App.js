import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute'; // <-- Bekçiyi çağır

import Home from './pages/Home';
import Login from './pages/Login'; // <-- Login sayfasını çağır
import AdminDashboard from './pages/AdminDashboard';
import ClientMenu from './pages/ClientMenu';
import Reports from './pages/Reports';
import Inventory from './pages/Inventory';
import QRScanner from './pages/QRScanner';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* HERKESİN GÖREBİLECEĞİ SAYFALAR (PUBLIC) */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/qr" element={<QRScanner />} />
          <Route path="/menu/:masaId" element={<ClientMenu />} />

          {/* SADECE YÖNETİCİNİN GÖREBİLECEĞİ SAYFALAR (PRIVATE) */}
          <Route path="/admin" element={
            <PrivateRoute> <AdminDashboard /> </PrivateRoute>
          } />
          
          <Route path="/reports" element={
            <PrivateRoute> <Reports /> </PrivateRoute>
          } />
          
          <Route path="/inventory" element={
            <PrivateRoute> <Inventory /> </PrivateRoute>
          } />

        </Routes>
      </Layout>
    </Router>
  );
}

export default App;