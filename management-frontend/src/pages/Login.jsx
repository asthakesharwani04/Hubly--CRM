import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-section">
          <div className="auth-logo">
            <img src="/hubly-logo.png" alt="Hubly" />
            <span>Hubly</span>
          </div>

          <div className="auth-form-wrapper">
            <h1 className="auth-title">Sign in to your Plexify</h1>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-form-group">
                <label>Username</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>

              <div className="auth-form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=""
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button 
                type="submit" 
                className="auth-submit-btn"
                disabled={!isFormValid || loading}
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>

            <p className="auth-recaptcha">
              This site is protected by reCAPTCHA and the <a href="#">Google Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
            </p>
          </div>
        </div>

        <div className="auth-image-section">
          <img src="/auth-image.png" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Login;