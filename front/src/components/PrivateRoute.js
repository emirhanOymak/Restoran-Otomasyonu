import React from 'react';
import { Navigate } from 'react-router-dom';

// Bu bileşen, içine aldığı sayfayı korur.
function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  // Eğer giriş yapmamışsa Login sayfasına at
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Giriş yapmışsa sayfayı göster
  return children;
}

export default PrivateRoute;