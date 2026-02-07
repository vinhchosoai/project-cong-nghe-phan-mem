import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
interface MenuItem {
  item_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: boolean;
}
interface Category {
  category_id: string;
  name: string;
  items: MenuItem[];
}
interface CartItem extends MenuItem {
  quantity: number;
}
interface OrderHistoryItem {
  order_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_details: {
    item_name: string;
    quantity: number;
    unit_price: number;
  }[];
}
export default function GuestQRMenu() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [pollingHistory, setPollingHistory] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resId = params.get('restaurant_id');
    const tblId = params.get('table_id');
    setRestaurantId(resId);
    setTableId(tblId);
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token && role) {
      setUserRole(role);
    }
    if (resId) {
      fetchMenu(resId);
    }
    const sessionOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    if (sessionOrders.length > 0) {
      fetchOrderHistory(sessionOrders);
    }
  }, []);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const sessionOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
    if (sessionOrders.length > 0) {
      interval = setInterval(() => {
        fetchOrderHistory(sessionOrders);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [restaurantId, tableId]);
  const handleLoginRedirect = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    router.push(`/login?redirect=${currentUrl}`);
  };
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('guest_orders');
    setUserRole(null);
    window.location.reload();
  };
  const fetchMenu = async (resId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/public/menu/${resId}`);
      setCategories(response.data);
      if (response.data.length > 0) {
        setSelectedCategory(response.data[0].category_id);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };
  const fetchOrderHistory = async (orderIds: string[]) => {
    try {
      const response = await axiosInstance.post('/public/orders/history', orderIds);
      setOrderHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
    }
  };
  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.item_id === item.item_id);
    if (existing) {
      setCart(cart.map(c =>
        c.item_id === item.item_id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.item_id !== itemId));
  };
  const clearCart = () => {
    setCart([]);
  };
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCategoryData = categories.find(c => c.category_id === selectedCategory);
  const handleTableRequest = async (type: 'call_server' | 'bill') => {
    if (!restaurantId || !tableId) {
      alert("Missing restaurant or table information.");
      return;
    }
    try {
      await axiosInstance.post(`/table-requests/${restaurantId}`, {
        table_id: tableId,
        request_type: type
      });
      alert(type === 'call_server' ? "Server called!" : "Bill requested!");
    } catch (err) {
      console.error("Failed to send request", err);
      alert("Failed to send request. Please try again.");
    }
  };
  const handleOrder = async () => {
    if (!restaurantId || !tableId) {
      alert("Missing restaurant or table information.");
      return;
    }
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        item_id: item.item_id,
        quantity: item.quantity,
        note: ''
      }));
      const payload = {
        restaurant_id: restaurantId,
        table_id: tableId,
        items: orderItems
      };
      const response = await axiosInstance.post('/public/orders', payload);
      const newOrderId = response.data.order_id;
      const existingOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
      const updatedOrders = [newOrderId, ...existingOrders].slice(0, 20);
      localStorage.setItem('guest_orders', JSON.stringify(updatedOrders));
      alert("Order submitted successfully!");
      clearCart();
      fetchOrderHistory(updatedOrders);
    } catch (err) {
      console.error('Failed to submit order:', err);
      alert("Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading menu...</div>;
  }
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {}
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, color: '#333', fontSize: '28px', fontWeight: 'bold' }}>Menu</h1>
            {tableId && <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Table: {tableId}</p>}
          </div>
          <div>
            {userRole ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#007bff', fontWeight: 'bold' }}>Welcome!</span>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleLoginRedirect}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#28a745',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        {}
        {orderHistory.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>🕒 Order History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orderHistory.map((order) => (
                <div key={order.order_id} style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Order #{order.order_id.slice(-6)}</span>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: order.status === 'COMPLETED' ? '#d4edda' : order.status === 'PENDING' ? '#fff3cd' : '#cfe2ff',
                      color: order.status === 'COMPLETED' ? '#155724' : order.status === 'PENDING' ? '#856404' : '#084298'
                    }}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                    {order.order_details.map((d, i) => (
                      <div key={i}>{d.item_name} x {d.quantity}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#999' }}>{new Date(order.created_at).toLocaleTimeString()}</span>
                    <span style={{ fontWeight: 'bold', color: '#007bff' }}>{order.total_amount.toLocaleString()} đ</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {}
        {categories.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '18px' }}>Categories</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat.category_id}
                  onClick={() => setSelectedCategory(cat.category_id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedCategory === cat.category_id ? '#007bff' : '#fff',
                    color: selectedCategory === cat.category_id ? '#fff' : '#333',
                    border: selectedCategory === cat.category_id ? 'none' : '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: selectedCategory === cat.category_id ? 'bold' : 'normal',
                    transition: 'all 0.3s'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {}
        <div style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>
            {selectedCategoryData?.name || 'Menu Items'}
          </h2>
          {!selectedCategoryData?.items || selectedCategoryData.items.filter(item => item.is_available).length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px 0' }}>
              No items available in this category.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {selectedCategoryData?.items?.filter(item => item.is_available).map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '15px',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        {item.name}
                      </h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                        {item.description}
                      </p>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>
                        {item.price.toLocaleString()} đ
                      </p>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0056b3'}
                      onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007bff'}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {}
        {cart.length > 0 && (
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '18px' }}>Your Order</h2>
            <div style={{ marginBottom: '20px' }}>
              {cart.map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                      {item.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      {item.price.toLocaleString()} đ × {item.quantity}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#007bff' }}>
                      {(item.price * item.quantity).toLocaleString()} đ
                    </span>
                    <button
                      onClick={() => removeFromCart(item.item_id)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#dc3545',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c82333'}
                      onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc3545'}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              borderTop: '2px solid #333',
              paddingTop: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>Total:</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  {totalPrice.toLocaleString()} đ
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#007bff',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0056b3'}
                onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#007bff'}
              >
                Order Now
              </button>
              <button
                onClick={clearCart}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#6c757d',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#5a6268'}
                onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#6c757d'}
              >
                Clear
              </button>
            </div>
          </div>
        )}
        {cart.length === 0 && (
          <div style={{
            backgroundColor: '#fff',
            padding: '40px 20px',
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}>
          </div>
        )}
        <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Need Assistance?</h3>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => handleTableRequest('call_server')}
              style={{ padding: '10px 20px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
            >
              🔔 Call Server
            </button>
            <button
              onClick={() => handleTableRequest('bill')}
              style={{ padding: '10px 20px', backgroundColor: '#17a2b8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'white' }}
            >
              🧾 Request Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}