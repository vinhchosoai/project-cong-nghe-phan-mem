import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';

interface Order {
  id: string;
  restaurant: string;
  items: string;
  total: number;
  date: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

export default function CustomerOrders() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }

        const userResponse = await axiosInstance.get('/auth/me');

        // Check if user is customer
        if (userResponse.data.role !== 'customer') {
          router.push('/');
          return;
        }

        setUser(userResponse.data);
        // TODO: Fetch orders from API
        setOrders([]);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      }
    };

    fetchUserAndOrders();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      preparing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Preparing' },
      ready: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Ready' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    };
    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">Xin chào, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        {user && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-indigo-500">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin cá nhân</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">Tên người dùng</p>
                <p className="font-semibold text-gray-900">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-semibold text-gray-900">{user.phone_number || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Điểm tích lũy</p>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg text-yellow-600">{user.current_points ?? 0}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Points</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử đơn hàng</h2>

        <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
          {['all', 'pending', 'preparing', 'completed', 'cancelled'].map(status => (
            <button key={status} className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 capitalize whitespace-nowrap">
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">Chưa có đơn hàng nào</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{order.restaurant}</h3>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">Mã đơn: {order.id}</p>
                    <p className="text-gray-600">{order.items}</p>
                    <p className="text-gray-500 text-sm mt-2">Ngày: {order.date}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600 mb-4">
                      {(order.total / 1000).toLocaleString('vi-VN')}K
                    </p>
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
