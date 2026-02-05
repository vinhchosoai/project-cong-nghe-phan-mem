import { useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../lib/axios';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        '/auth/login',
        {
          email,
          password,
        }
      );

      const { access_token, role, tenant_id } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_role', role);
      if (tenant_id) {
        localStorage.setItem('tenant_id', tenant_id);
      }

      // Redirect based on user role
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
        default:
          router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra lại'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    const demoCredentials: { [key: string]: { email: string; password: string } } = {
      admin: {
        email: 'admin@example.com',
        password: 'Admin123!',
      },
      restaurant: {
        email: 'restaurant@example.com',
        password: 'Restaurant123!',
      },
      customer: {
        email: 'customer@example.com',
        password: 'Customer123!',
      },
    };

    const credentials = demoCredentials[role];
    if (credentials) {
      setEmail(credentials.email);
      setPassword(credentials.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg mb-4">
              <span className="text-2xl font-bold text-white">S2O</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">S2O Platform</h1>
            <p className="text-gray-600 mt-2">Hệ thống quản lý nhà hàng thông minh</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc đăng nhập dùng tài khoản demo</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-3 rounded-lg transition text-sm"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('restaurant')}
                className="bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-2 px-3 rounded-lg transition text-sm"
              >
                Nhà hàng
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('customer')}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold py-2 px-3 rounded-lg transition text-sm"
              >
                Khách hàng
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo Credentials:</strong>
              <br />
              Admin: admin@example.com / Admin123!
              <br />
              Nhà hàng: restaurant@example.com / Restaurant123!
              <br />
              Khách hàng: customer@example.com / Customer123!
            </p>
          </div>
        </div>
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/register')}
            className="text-indigo-600 hover:text-indigo-700 font-bold"
          >
            Register here
          </button>
        </p>      </div>
    </div>
  );
}
