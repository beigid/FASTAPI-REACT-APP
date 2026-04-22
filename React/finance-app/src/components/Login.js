import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../api";
import '../Login.css';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('password', formData.password);
      const response = await api.post("/auth/token", data);
      onLoginSuccess(response.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    symbol: ['$', '%', '↑', '↗', '◆', '▲', '$', '€', '¥', '↑', '%', '$', '◆', '▲', '↗', '$', '%', '◆'][i],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 10 + Math.random() * 14,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 8,
    opacity: 0.04 + Math.random() * 0.08,
  }));

  return (
    <div className="login-root">
      <div className="login-left">
        {particles.map(p => (
          <span key={p.id} className="particle" style={{
            left: `${p.x}%`, top: `${p.y}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}>{p.symbol}</span>
        ))}

        <svg className="chart-svg" viewBox="0 0 500 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            className="chart-path"
            d="M0 70 L40 55 L90 60 L140 40 L190 45 L240 20 L290 30 L340 10 L390 18 L440 5 L500 12"
            stroke="#a78bfa" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
          />
          <path
            d="M0 70 L40 55 L90 60 L140 40 L190 45 L240 20 L290 30 L340 10 L390 18 L440 5 L500 12 L500 80 L0 80 Z"
            fill="url(#chartGrad)" opacity="0.4"
          />
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
            </linearGradient>
          </defs>
        </svg>

        <div className="brand">
          <div className="brand-icon">💰</div>
          <span className="brand-name">FinanceApp</span>
        </div>

        <div className="left-hero">
          <h1>Your money,<br /><em>finally</em> in focus.</h1>
          <p>Track every dollar, see every pattern. Take control of your financial story with clarity and confidence.</p>
        </div>
      </div>

      <div className="login-right">
        <div className="form-header">
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to<br />your account</h2>
          <span>Pick up right where you left off.</span>
        </div>

        {error && <div className="error-box">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Username</label>
            <input
              name="username"
              className="field-input"
              placeholder="your_username"
              onChange={handleInputChange}
              value={formData.username}
              autoComplete="username"
              required
            />
          </div>

          <div className="field-group">
            <label>Password</label>
            <input
              name="password"
              type="password"
              className="field-input"
              placeholder="••••••••"
              onChange={handleInputChange}
              value={formData.password}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="spinner" />Signing in...</>
            ) : (
              "Sign in →"
            )}
          </button>
        </form>

        <div className="form-footer">
          Don't have an account?{' '}
          <Link to="/register">Create one free</Link>
        </div>

        <p className="copyright">© {new Date().getFullYear()} Your Personal Finance App</p>
      </div>
    </div>
  );
};

export default Login;