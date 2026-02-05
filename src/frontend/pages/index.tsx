import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../lib/axios';

interface UserData {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthResponse {
  user_id: string;
  email: string;
  full_name: string;
  tenant_id: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await axiosInstance.get('/auth/me');

        const userData = response.data as AuthResponse;
        const userWithRole: UserData = {
          user_id: userData.user_id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.email.includes('admin') ? 'ADMIN' : 'RESTAURANT_STAFF',
        };

        setUser(userWithRole);
        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        localStorage.removeItem('access_token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Phiên đăng nhập hết hạn</h1>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">S2O</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">S2O Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Xin chào</p>
              <p className="font-semibold text-gray-800">{user.full_name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Chào mừng, {user.full_name}!
          </h2>
          <p className="text-gray-600">
            Vai trò: <span className="font-semibold text-indigo-600">{user.role}</span>
          </p>
        </div>

        {user.role === 'ADMIN' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Bảng điều khiển quản trị
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  onClick={() => navigateTo('/admin')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5.581m0 0H9m0 0h5.581M9 9h.008v.008H9V9m5 0h.008v.008h-.008V9m-9 9h.008v.008H5v-.008zm5 0h.008v.008h-.008v-.008zm5 0h.008v.008h-.008v-.008z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Quản lý nhà hàng
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Xem, tạo, chỉnh sửa và quản lý toàn bộ nhà hàng
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/admin/users')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 12H9m6 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Quản lý người dùng
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Quản lý tài khoản nhân viên và quyền truy cập
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/admin/analytics')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Báo cáo & Phân tích
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Xem thống kê doanh thu, đơn hàng và khách hàng
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/admin/settings')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Cài đặt hệ thống
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Cấu hình cài đặt chung và tùy chỉnh hệ thống
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2m4-4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Hỗ trợ kỹ thuật
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Truy cập log hệ thống và xử lý sự cố
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thống kê tổng quát</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Tổng nhà hàng</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">--</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Tổng người dùng</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">--</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Đơn hàng hôm nay</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">--</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                  <p className="text-gray-600 text-sm font-medium">Doanh thu hôm nay</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">--</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {user.role === 'RESTAURANT_STAFF' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Bảng điều khiển nhà hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  onClick={() => navigateTo('/restaurant')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2m4-4l2 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Quản lý đơn hàng
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Xem và xử lý các đơn hàng đang chờ
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/restaurant')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Quản lý menu
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Cập nhật thực đơn và giá cả
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/restaurant')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-pink-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Quản lý bàn
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Cập nhật trạng thái bàn và đặt chỗ
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/restaurant')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-cyan-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Bếp hiển thị
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Xem đơn hàng trực tiếp ở bếp
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/restaurant')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-teal-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8c0 1.657-.895 3.05-2.174 3.8M16 8l-2 2m2-2l2 2M8 16c1.657 0 3.05.895 3.8 2.174M8 16l2-2m-2 2l-2 2"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Thống kê
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Xem doanh số và hiệu suất
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Đơn hàng gần đây</h3>
              <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-600">
                <p>Không có đơn hàng gần đây</p>
              </div>
            </div>
          </div>
        )}

        {user.role === 'CUSTOMER' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Khám phá nhà hàng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  onClick={() => navigateTo('/guest')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Thực đơn QR
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Quét mã QR để xem thực đơn và đặt hàng
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/customer/orders')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Đơn hàng của tôi
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Xem lịch sử đơn hàng và trạng thái
                  </p>
                </div>

                <div
                  onClick={() => navigateTo('/customer/profile')}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl p-6 cursor-pointer transition transform hover:scale-105"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Hồ sơ cá nhân
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Quản lý thông tin và điểm thưởng
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Điểm thưởng của bạn</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-indigo-100 mb-2">Tổng điểm</p>
                  <p className="text-5xl font-bold">0</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-100 mb-2">Hạng thành viên</p>
                  <p className="text-3xl font-bold">BRONZE</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
