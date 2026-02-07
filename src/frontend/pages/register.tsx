import { useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../lib/axios';
export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password,
        phone_number: phone || null,
      });
      if (response.data) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err: any) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        errorMessage = typeof detail === 'string' ? detail : JSON.stringify(detail);
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (Optional)"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              border: '1px solid #ef5350',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              <p style={{ color: '#c62828', fontSize: '14px', margin: 0, textAlign: 'center' }}>{error}</p>
            </div>
          )}
          {success && (
            <div style={{
              backgroundColor: '#e8f5e9',
              border: '1px solid #66bb6a',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px'
            }}>
              <p style={{ color: '#2e7d32', fontSize: '14px', margin: 0, textAlign: 'center' }}>{success}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: loading ? '#999' : '#007bff',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#0056b3';
            }}
            onMouseOut={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#007bff';
            }}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px'
              }}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}