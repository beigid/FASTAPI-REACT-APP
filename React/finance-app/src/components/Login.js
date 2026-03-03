import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../api";

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const data = new FormData();
        data.append('username', formData.username);
        data.append('password', formData.password);

        const response = await api.post("/auth/token", data);
        onLoginSuccess(response.data.access_token);
        navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid username or password");    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          name="username"
          placeholder="Username"
          onChange={handleInputChange}
          style={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleInputChange}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>Let's Go!</button>

        <p>
          Need an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

// Simple inline styles to get you started
const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
  form: { padding: '2rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' },
  input: { width: '100%', padding: '10px', margin: '10px 0', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  toggle: { fontSize: '0.8rem', textAlign: 'center', color: '#007bff', cursor: 'pointer', marginTop: '15px' },
  error: { color: 'red', fontSize: '0.9rem' }
};

export default Login;