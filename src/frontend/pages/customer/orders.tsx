import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
interface Order {
  id: string;
  restaurant: string;
  items: string;
  total: number;
  date: string;
  status: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  order_details?: any[];
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
        if (userResponse.data.role !== 'customer') {
          router.push('/');
          return;
        }
        setUser(userResponse.data);
        const ordersResponse = await axiosInstance.get('/orders/my-orders');
        const mappedOrders = ordersResponse.data.map((o: any) => ({
          id: o.order_id,
          restaurant: `Restaurant #${o.restaurant_id.slice(-4)}`,
          items: o.order_details.map((d: any) => `${d.item_name} x ${d.quantity}`).join(', '),
          total: Number(o.total_amount),
          date: new Date(o.created_at).toLocaleString(),
          status: o.status,
          order_details: o.order_details
        }));
        setOrders(mappedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        router.push('/login');
      }
    };
    fetchUserAndOrders();
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('guest_orders');
    router.push('/login');
  };
  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDING: '#ffc107',
      PREPARING: '#007bff',
      READY: '#6f42c1',
      COMPLETED: '#28a745',
      CANCELLED: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };
  const getStatusLabel = (status: Order['status']) => {
    return status;
  };
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {}
      <div style={{ backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Order History</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ color: '#666' }}>Hello, {user?.username}</span>
            <button onClick={() => router.push('/customer/profile')} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}>Profile</button>
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>Logout</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 30px' }}>
        {}
        {user && (
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '20px', marginBottom: '20px', borderLeft: '4px solid #007bff' }}>
            <h2 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Personal Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Username</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{user.username}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Email</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{user.email}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Phone</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{user.phone_number || '-'}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>Loyalty Points</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>{user.current_points ?? 0}</span>
                  <span style={{ fontSize: '11px', backgroundColor: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '12px' }}>Points</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', fontWeight: 'bold', color: '#333' }}>Order History</h2>
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {orders.length === 0 ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '40px', textAlign: 'center', color: '#999' }}>
              No orders found.
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{order.restaurant}</h3>
                      <span style={{ padding: '4px 12px', backgroundColor: getStatusColor(order.status), color: '#fff', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#666' }}>Order ID: {order.id}</p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>{order.items}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Date: {order.date}</p>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '150px' }}>
                    <p style={{ margin: '0 0 15px 0', fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                      {order.total.toLocaleString()} đ
                    </p>
                    <button style={{ padding: '8px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}