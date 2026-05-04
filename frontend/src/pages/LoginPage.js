import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

function LoginPage({ setLoggedInUser, addToast }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // We only need email because the backend loginUser only checks email currently
  // But let's add password for UI completeness
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email });
      if (res.success) {
        localStorage.setItem('user', JSON.stringify(res.data));
        setLoggedInUser(res.data);
        addToast(`Welcome back, ${res.data.full_name}!`);
      }
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="content-card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
        <div style={{ textAlign: 'center', padding: '30px 20px 10px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '60px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Insaniyat Ghar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to continue</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <FiMail style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  className="form-control" 
                  style={{ paddingLeft: '38px' }}
                  placeholder="admin@insaniyat.pk" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <FiLock style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  className="form-control" 
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'} <FiArrowRight />
            </button>
          </form>
          <div style={{ marginTop: '20px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <p style={{ textAlign: 'center', marginBottom: '8px', fontWeight: 600 }}>Quick Login:</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {[
                { email: 'admin@insaniyat.pk', label: 'Admin' },
                { email: 'manager@insaniyat.pk', label: 'Manager' },
                { email: 'tariq@donor.pk', label: 'Donor' },
                { email: 'usman@need.pk', label: 'Beneficiary' },
                { email: 'bilal@vol.pk', label: 'Volunteer' },
                { email: 'sana@fin.pk', label: 'Finance' },
                { email: 'omar@inv.pk', label: 'Inventory' },
              ].map(acc => (
                <button key={acc.email} type="button" className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'center', fontSize: '0.75rem' }}
                  onClick={() => { setEmail(acc.email); }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
