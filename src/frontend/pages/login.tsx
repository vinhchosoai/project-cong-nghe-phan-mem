import { useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../lib/axios';
import Head from 'next/head';
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      const { access_token, role, tenant_id } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_role', role);
      if (tenant_id) {
        localStorage.setItem('tenant_id', tenant_id);
      }
      const { redirect } = router.query;
      if (redirect) {
        router.push(decodeURIComponent(redirect as string));
        return;
      }
      switch (role) {
        case 'admin':
          router.push('/admin');
          break;
        case 'restaurant_owner':
          router.push('/restaurant');
          break;
        case 'customer':
          router.push('/customer/orders');
          break;
        case 'chef':
        case 'waiter':
        case 'manager':
        case 'cashier':
        case 'RESTAURANT_STAFF':
          router.push('/staff');
          break;
        default:
          router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials';
      if (err.response?.data) {
        const errorData = err.response.data;
        if (Array.isArray(errorData) && errorData.length > 0) {
          errorMessage = errorData.map(e => e.msg || e.message).join(', ');
        }
        else if (typeof errorData.detail === 'string') {
          errorMessage = errorData.detail;
        }
        else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(e => e.msg || e.message).join(', ');
        }
        else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Head>
        <title>Login Page</title>
      </Head>
      <style jsx>{`
        .page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f0f2f5;
          font-family: Arial, sans-serif;
        }
        .login-container {
          background-color: #fff;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        .login-container h2 {
          margin-bottom: 20px;
          color: #333;
          text-align: center;
        }
        .login-container input[type="text"],
        .login-container input[type="password"] {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-sizing: border-box;
        }
        .login-container button {
          width: 100%;
          padding: 10px;
          background-color: #007bff;
          border: none;
          border-radius: 4px;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .login-container button:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .login-container button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          font-size: 14px;
        }
        .footer-links {
          margin-top: 15px;
          text-align: center;
          font-size: 14px;
        }
        .footer-links a {
          color: #007bff;
          text-decoration: none;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="page-container">
        <div className="login-container">
          <h2>Login</h2>
          {error && (
            <div className="error-message">{error}</div>
          )}
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="footer-links">
            Don't have an account?{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); router.push('/register'); }}>
              Register here
            </a>
          </div>
        </div>
      </div>
    </>
  );
}