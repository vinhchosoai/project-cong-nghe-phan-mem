import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axiosInstance from '../../lib/axios';

export default function RestaurantDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch restaurant ID from API
      const restRes = await axiosInstance.get('/restaurants');
      if (restRes.data.length === 0) return;

      const restaurantId = restRes.data[0].restaurant_id;

      const response = await axiosInstance.get(`/restaurants/${restaurantId}/orders`);
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Restaurant Dashboard</h1>
          <button onClick={() => {
            localStorage.removeItem('access_token');
            router.push('/login');
          }} className="text-red-600 font-medium">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/restaurant/menu-manager" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer border-l-4 border-indigo-500">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Menu Management</h3>
            <p className="text-gray-600">Update menu items, prices, and availability.</p>
          </Link>

          <Link href="/restaurant/inventory" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer border-l-4 border-emerald-500">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Inventory</h3>
            <p className="text-gray-600">Manage ingredients and stock levels.</p>
          </Link>

          <Link href="/restaurant/kitchen" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer border-l-4 border-orange-500">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Kitchen View</h3>
            <p className="text-gray-600">Real-time order display for kitchen staff.</p>
          </Link>

          <Link href="/restaurant/tables" className="bg-white p-6 rounded-xl shadow hover:shadow-md transition cursor-pointer border-l-4 border-purple-500">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Table Management</h3>
            <p className="text-gray-600">Manage tables and QR codes.</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-gray-500">No orders found.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.order_id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">
                    <div>
                      <p className="font-bold text-lg">Order #{order.order_id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">Table: {order.table_id || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Total: ${order.total_amount}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
