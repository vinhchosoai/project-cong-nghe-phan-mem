import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
import Head from 'next/head';
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
export default function StaffKitchen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState<Record<string, string>>({});
    const [restaurantId, setRestaurantId] = useState<string>('');
    useEffect(() => {
        let ws: WebSocket | null = null;
        const initStaffKitchen = async () => {
            try {
                const response = await axiosInstance.get('/auth/me');
                const { restaurant_id, tenant_id } = response.data;
                if (!restaurant_id) {
                    alert('You are not assigned to any restaurant');
                    router.push('/staff');
                    return;
                }
                if (tenant_id && !localStorage.getItem('tenant_id')) {
                    localStorage.setItem('tenant_id', tenant_id);
                }
                setRestaurantId(restaurant_id);
                await fetchMenuNames(restaurant_id);
                await fetchOrders(restaurant_id);
                const wsUrl = `ws:
                ws = new WebSocket(wsUrl);
                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (message.event === 'order_created') {
                        if (message.data.restaurant_id === restaurant_id) {
                            fetchOrders(restaurant_id);
                            new Audio('/notification.mp3').play().catch(() => { });
                        }
                    }
                };
            } catch (error) {
                console.error('Failed to init staff kitchen:', error);
                router.push('/staff');
            } finally {
                setLoading(false);
            }
        };
        initStaffKitchen();
        const interval = setInterval(() => {
            if (restaurantId) fetchOrders(restaurantId);
        }, 10000);
        return () => {
            if (ws) ws.close();
            clearInterval(interval);
        };
    }, [restaurantId, router]);
    const fetchMenuNames = async (restId: string) => {
        try {
            const res = await axiosInstance.get(`/public/menu/${restId}/items`);
            const map: Record<string, string> = {};
            res.data.forEach((item: MenuItem) => {
                map[item.item_id] = item.name;
            });
            setMenuItems(map);
        } catch (e) {
            console.error('Failed to fetch menu items', e);
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
    const handleMarkReady = async (orderId: string) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}`, { status: 'COMPLETED' });
            await fetchOrders(restaurantId);
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to complete order');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('guest_orders');
        router.push('/login');
    };
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }
    return (
        <>
            <Head>
                <title>Kitchen Display | Staff</title>
            </Head>
            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background-color: #f5f5f5;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .header {
                    background: white;
                    padding: 15px 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #333;
                    margin: 0;
                }
                .header-actions {
                    display: flex;
                    gap: 10px;
                }
                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.3s;
                }
                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }
                .btn-secondary:hover {
                    background-color: #5a6268;
                }
                .btn-danger {
                    background-color: #dc3545;
                    color: white;
                }
                .btn-danger:hover {
                    background-color: #c82333;
                }
                .content {
                    padding: 30px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                .orders-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 20px;
                }
                .order-card {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .order-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #f0f0f0;
                }
                .order-number {
                    font-size: 20px;
                    font-weight: 700;
                    color: #333;
                }
                .table-badge {
                    background: #007bff;
                    color: white;
                    padding: 6px 12px;
                    border-radius: 4px;
                    font-weight: 600;
                }
                .order-items {
                    margin: 15px 0;
                }
                .item {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #f0f0f0;
                }
                .item-name {
                    font-weight: 500;
                    color: #333;
                }
                .item-qty {
                    background: #e9ecef;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                    color: #495057;
                }
                .order-time {
                    font-size: 13px;
                    color: #666;
                    margin-top: 10px;
                }
                .btn-ready {
                    width: 100%;
                    margin-top: 15px;
                    padding: 12px;
                    background: #28a745;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                }
                .btn-ready:hover {
                    background: #218838;
                }
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    background: white;
                    border-radius: 8px;
                }
                .empty-state h3 {
                    color: #666;
                    margin: 0;
                }
            `}</style>
            <div className="page-container">
                <div className="header">
                    <h1 className="header-title">🍳 Kitchen Display</h1>
                    <div className="header-actions">
                        <button onClick={() => router.push('/staff')} className="btn btn-secondary">
                            Back to Dashboard
                        </button>
                        <button onClick={handleLogout} className="btn btn-danger">
                            Logout
                        </button>
                    </div>
                </div>
                <div className="content">
                    {orders.length === 0 ? (
                        <div className="empty-state">
                            <h3>No pending orders</h3>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {orders.map((order, index) => (
                                <div key={order.order_id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-number">Order #{index + 1}</span>
                                        <span className="table-badge">
                                            Table {order.table_number || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="order-items">
                                        {order.order_details.map((detail) => (
                                            <div key={detail.order_detail_id} className="item">
                                                <span className="item-name">
                                                    {menuItems[detail.item_id] || 'Unknown Item'}
                                                </span>
                                                <span className="item-qty">x{detail.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-time">
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </div>
                                    <button
                                        onClick={() => handleMarkReady(order.order_id)}
                                        className="btn btn-ready"
                                    >
                                        Complete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}