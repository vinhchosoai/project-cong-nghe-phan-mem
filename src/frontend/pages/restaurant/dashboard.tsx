import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';

export default function RestaurantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await axiosInstance.get('/auth/me');
        
        // Check if user is restaurant owner
        if (response.data.role !== 'restaurant_owner') {
          router.push('/');
          return;
        }
        
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  if (loading) return <div className="text-center py-8">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">S2O Nhà Hàng</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Xin chào, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Bảng điều khiển nhà hàng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-600">Hôm nay</p>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Đơn hàng</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-gray-600">Doanh thu hôm nay</p>
              <p className="text-3xl font-bold text-green-600">0 ₫</p>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg">
              <p className="text-gray-600">Bàn trống</p>
              <p className="text-3xl font-bold text-yellow-600">0</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <p className="text-gray-600">Nhân viên</p>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quản lý</h3>
              <div className="space-y-2">
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                  Quản lý thực đơn
                </button>
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                  Quản lý bàn
                </button>
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                  Quản lý nhân viên
                </button>
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                  Báo cáo & thống kê
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin tài khoản</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tên người dùng</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Số điện thoại</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user?.phone_number || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
