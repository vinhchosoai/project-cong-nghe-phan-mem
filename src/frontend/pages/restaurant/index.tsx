import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axiosInstance from '../../lib/axios';
export default function RestaurantDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    setUserRole(role || '');
    fetchOrders();
  }, []);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const restRes = await axiosInstance.get('/restaurants');
      if (restRes.data.length === 0) return;
      const restaurantId = restRes.data[0].restaurant_id;
      const response = await axiosInstance.get(`/orders/restaurant/${restaurantId}`);
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('guest_orders');
    router.push('/login');
  };
  const handlePrintInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.order_details.map((detail: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${detail.item_name || 'Món ăn'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${detail.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${Number(detail.unit_price).toLocaleString()} đ</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(detail.quantity * detail.unit_price).toLocaleString()} đ</td>
      </tr>
    `).join('');
    const html = `
      <html>
        <head>
          <title>Invoice #${order.order_id.slice(-6)}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f8f9fa; padding: 10px; text-align: left; border-bottom: 2px solid #dee2e6; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PAYMENT INVOICE</h1>
            <p>Table Number: ${order.table_number || 'N/A'}</p>
            <p>Date: ${new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div class="info">
            <p>Order ID: <strong>#${order.order_id}</strong></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">
            Total Amount: ${Number(order.total_amount).toLocaleString()} đ
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Restaurant Dashboard</h1>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Restaurant Owner</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            Logout
          </button>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <Link href="/restaurant/menu-manager" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s'
            }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.15)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)'}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>Menu Management</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Update menu items, prices, and availability.</p>
            </div>
          </Link>
          <Link href="/restaurant/inventory" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s'
            }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.15)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)'}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>Inventory</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Manage ingredients and stock levels.</p>
            </div>
          </Link>
          <Link href="/restaurant/tables" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s'
            }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.15)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)'}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>Table Management</h3>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Manage tables and QR codes.</p>
            </div>
          </Link>
          {userRole === 'restaurant_owner' && (
            <Link href="/restaurant/staff" style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'box-shadow 0.3s'
              }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.15)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)'}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: 'bold' }}>Staff Management</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Add and manage staff roles.</p>
              </div>
            </Link>
          )}
        </div>
        {}
        <div style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '30px'
        }}>
          <div style={{ borderBottom: '1px solid #ccc', padding: '20px' }}>
            <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>Recent Orders</h2>
          </div>
          <div style={{ padding: '20px' }}>
            {loading ? (
              <p style={{ color: '#666' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p style={{ color: '#666' }}>No orders found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {orders.map((order, index) => (
                  <div key={order.order_id} style={{
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '15px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9'
                  }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>Order #{orders.length - index}</p>
                      <p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>Table: {order.table_number || 'N/A'}</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Total: ${order.total_amount}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#17a2b8',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Print Invoice
                      </button>
                      <span style={{
                        padding: '5px 10px',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        backgroundColor: order.status === 'COMPLETED' ? '#d4edda' : order.status === 'PENDING' ? '#fff3cd' : '#cfe2ff',
                        color: order.status === 'COMPLETED' ? '#155724' : order.status === 'PENDING' ? '#856404' : '#084298'
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div >
    </div >
  );
}