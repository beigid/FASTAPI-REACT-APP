import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from "../api";

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

  return (
    <div className="min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            <div className="card shadow-lg border-0 login-card">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h2 className="h4 mb-1">Welcome back</h2>
                  <p className="text-muted mb-0">Log in to continue</p>
                </div>

                {error && (
                  <div className="alert alert-danger py-2" role="alert">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      name="username"
                      className="form-control"
                      placeholder="Enter your username"
                      onChange={handleInputChange}
                      value={formData.username}
                      autoComplete="username"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      name="password"
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      onChange={handleInputChange}
                      value={formData.password}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 fw-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                        Logging in...
                      </>
                    ) : (
                      "Let's Go!"
                    )}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <span className="text-muted">Need an account?</span>{" "}
                  <Link to="/register" className="link-primary text-decoration-none">
                    Register here
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-center text-muted small mt-3 mb-0">
              © {new Date().getFullYear()} Your Personal Finance App
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;