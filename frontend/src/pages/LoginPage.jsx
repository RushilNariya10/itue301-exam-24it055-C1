import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/v1/auth/login`, {
        email,
        password,
      });

      const { attendee, token, role } = res.data;
      login(attendee, token, role);
      // Route to the correct dashboard based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'organizer') navigate('/organizer');
      else navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <h1 className="auth-card__title">🎫 EventHub</h1>
          <p className="auth-card__subtitle">Sign in to book event tickets</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert--error">{error}</div>
          )}

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-card__hint">
          <p><strong>Attendee:</strong> attendee@eventhub.com / password123</p>
          <p><strong>Organizer:</strong> organizer@eventhub.com / password123</p>
          <p><strong>Admin:</strong> admin@eventhub.com / password123</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
