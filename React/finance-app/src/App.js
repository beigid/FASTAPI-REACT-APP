import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Transactions from './components/Transactions';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from "./components/Navbar";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <Router>
      <Navbar token={token} onLogout={handleLogout} />
      <Routes>
        <Route path="/login"
        element={!token ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
        />

        <Route path="/register"
        element={!token ? <Register onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />}
        />

        <Route path="/"
         element={token ? <Transactions token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
