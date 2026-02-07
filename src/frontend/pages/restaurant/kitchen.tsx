import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
interface OrderDetail {
    order_detail_id: string;
    item_id: string;
    quantity: number;
    note?: string;
}
interface Order {
    order_id: string;
    restaurant_id: string;
    table_id: string;
    table_number?: number;
    status: string;
    total_amount: number;
    created_at: string;
    order_details: OrderDetail[];
}
interface MenuItem {
    item_id: string;
    name: string;
}
export default function KitchenView() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState<Record<string, string>>({});
    const [restaurantId, setRestaurantId] = useState<string>('');
    useEffect(() => {
        const init = async () => {
            try {
                const restRes = await axiosInstance.get('/restaurants');
                if (restRes.data.length > 0) {
                    const restId = restRes.data[0].restaurant_id;
                    setRestaurantId(restId);
                    await fetchMenuNames(restId);
                    await fetchOrders(restId);
                } else {
                    console.error("No restaurant found for this owner");
                }
            } catch (error) {
                console.error('Failed to init kitchen view:', error);
            } finally {
                setLoading(false);
            }
        };
        init();
        const interval = setInterval(() => {
            if (restaurantId) fetchOrders(restaurantId);
        }, 10000);
        return () => clearInterval(interval);
    }, [restaurantId]);
    const fetchMenuNames = async (restId: string) => {
        try {
            const res = await axiosInstance.get(`/public/menu/${restId}/items`);
            const map: Record<string, string> = {};
            res.data.forEach((item: MenuItem) => {
                map[item.item_id] = item.name;
            });
            setMenuItems(map);
        } catch (e) {
            console.error("Failed to fetch menu items map", e);
        }
    };
    const fetchOrders = async (restId: string) => {
        try {
            const response = await axiosInstance.get(`/orders/restaurant/${restId}?status=PENDING,PREPARING`);
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        }
    };
    const updateStatus = async (orderId: string, status: string) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}`, { status });
            if (restaurantId) fetchOrders(restaurantId);
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('guest_orders');
        router.push('/login');
    };
    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Kitchen Display System</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => router.push('/restaurant')} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}>Back</button>
                        <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>Logout</button>
                    </div>
                </div>
            </div>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 30px' }}>
                {orders.length === 0 ? (
                    <div style={{ backgroundColor: '#fff', padding: '40px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', color: '#999' }}>
                        No pending orders.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {orders.map((order, index) => (
                            <div key={order.order_id} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', overflow: 'hidden', borderTop: '4px solid #007bff' }}>
                                <div style={{ padding: '15px 20px', backgroundColor: '#f9f9f9', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Table {order.table_number || 'N/A'}</div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#007bff' }}>Order #{orders.length - index}</div>
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '3px' }}>
                                            {new Date(order.created_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <span style={{ padding: '4px 12px', backgroundColor: '#ffc107', color: '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {order.status.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ padding: '15px 20px' }}>
                                    {order.order_details.map(detail => (
                                        <div key={detail.order_detail_id} style={{ padding: '10px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 'bold', color: '#333' }}>
                                                    {menuItems[detail.item_id] || 'Unknown Item'}
                                                </div>
                                                {detail.note && (
                                                    <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '3px', fontStyle: 'italic' }}>Note: {detail.note}</div>
                                                )}
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '18px', backgroundColor: '#f0f2f5', padding: '5px 12px', borderRadius: '4px', minWidth: '40px', textAlign: 'center' }}>
                                                {detail.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '15px 20px', backgroundColor: '#f9f9f9', borderTop: '1px solid #ccc', display: 'flex', gap: '10px' }}>
                                    <button onClick={() => {
                                        updateStatus(order.order_id, "COMPLETED");
                                        setOrders(prev => prev.filter(o => o.order_id !== order.order_id));
                                    }} style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}>
                                        Complete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}