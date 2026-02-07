import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
import Head from 'next/head';
interface TableRequest {
    request_id: string;
    table_id: string;
    table_number?: number;
    request_type: string;
    status: string;
    created_at: string;
}
interface RestaurantTable {
    table_id: string;
    table_number: number;
    status: boolean;
}
interface OrderDetail {
    order_detail_id: string;
    item_id: string;
    quantity: number;
    note?: string;
}
interface Order {
    order_id: string;
    table_number?: number;
    total_amount: number;
    status: string;
    created_at: string;
    order_details?: OrderDetail[];
}
interface MenuItem {
    item_id: string;
    name: string;
}
const StaffService = () => {
    const [requests, setRequests] = useState<TableRequest[]>([]);
    const [kitchenOrders, setKitchenOrders] = useState<Order[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [servedOrders, setServedOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [menuItems, setMenuItems] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const router = useRouter();
    useEffect(() => {
        const init = async () => {
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
                fetchData(restaurant_id);
                const wsUrl = `ws:
                const ws = new WebSocket(wsUrl);
                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (message.event === 'table_request') {
                        const newReq = message.data;
                        if (newReq.restaurant_id === restaurant_id) {
                            setRequests(prev => {
                                if (prev.some(r => r.request_id === newReq.request_id)) return prev;
                                return [newReq, ...prev];
                            });
                            new Audio('/notification.mp3').play().catch(() => { });
                        }
                    } else if (message.event === 'order_created' || message.event === 'order_status_changed') {
                        fetchData(restaurant_id);
                    }
                };
                return () => ws.close();
            } catch (error) {
                console.error('Failed to init service dashboard:', error);
                router.push('/staff');
            }
        };
        init();
        const interval = setInterval(() => {
            if (restaurantId) fetchData(restaurantId);
        }, 10000);
        return () => clearInterval(interval);
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
    const fetchData = async (resId: string) => {
        setLoading(true);
        try {
            const [reqRes, kitchenRes, readyRes, servedRes, tablesRes] = await Promise.all([
                axiosInstance.get(`/table-requests/${resId}?status=pending`),
                axiosInstance.get(`/orders/restaurant/${resId}?status=PENDING,PREPARING`),
                axiosInstance.get(`/orders/status/READY?restaurant_id=${resId}`),
                axiosInstance.get(`/orders/status/SERVED?restaurant_id=${resId}`),
                axiosInstance.get(`/restaurants/${resId}/tables`)
            ]);
            setRequests(reqRes.data);
            setKitchenOrders(kitchenRes.data);
            setReadyOrders(readyRes.data);
            setServedOrders(servedRes.data);
            setTables(tablesRes.data);
        } catch (error) {
            console.error('Failed to fetch service data', error);
        } finally {
            setLoading(false);
        }
    };
    const completeRequest = async (reqId: string) => {
        try {
            await axiosInstance.put(`/table-requests/${reqId}`, { status: 'completed' });
            setRequests(prev => prev.filter(r => r.request_id !== reqId));
        } catch (err) {
            console.error('Failed to complete request', err);
            alert('Failed to update request');
        }
    };
    const markOrderReady = async (orderId: string) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}`, { status: 'READY' });
            fetchData(restaurantId);
        } catch (error) {
            console.error('Failed to update order status:', error);
            alert('Failed to complete order');
        }
    };
    const serveOrder = async (orderId: string) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}`, { status: 'SERVED' });
            fetchData(restaurantId);
        } catch (err) {
            console.error('Failed to serve order', err);
            alert('Failed to update order');
        }
    };
    const toggleTableStatus = async (tableId: string, currentStatus: boolean) => {
        try {
            await axiosInstance.patch(`/tables/${tableId}`, { status: !currentStatus });
            setTables(prev => prev.map(t =>
                t.table_id === tableId ? { ...t, status: !currentStatus } : t
            ));
        } catch (err) {
            console.error('Failed to toggle table status', err);
            alert('Failed to update table status');
        }
    };
    const openPaymentModal = (order: Order) => {
        setSelectedOrder(order);
        setAmountPaid(order.total_amount);
        setShowPaymentModal(true);
    };
    const processPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder) return;
        try {
            await axiosInstance.post('/invoices', {
                order_id: selectedOrder.order_id,
                payment_method: paymentMethod,
                amount_paid: amountPaid,
                customer_id: null
            });
            alert('Payment processed and order completed!');
            setShowPaymentModal(false);
            setSelectedOrder(null);
            fetchData(restaurantId);
        } catch (err) {
            console.error('Payment failed', err);
            alert('Payment failed');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('guest_orders');
        router.push('/login');
    };
    return (
        <>
            <Head>
                <title>Service Dashboard | Staff</title>
            </Head>
            <style jsx>{`
                .page-container {
                    min-height: 100vh;
                    background-color: #f5f5f5;
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
                }
                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }
                .btn-danger {
                    background-color: #dc3545;
                    color: white;
                }
                .content {
                    padding: 30px;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    margin-bottom: 30px;
                }
                @media (max-width: 1200px) {
                    .grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }
                }
                .tables-section {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .tables-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                }
                .table-card {
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .status-badge {
                    font-size: 12px;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-weight: 600;
                }
                .status-available { background: #d4edda; color: #155724; }
                .status-unavailable { background: #f8d7da; color: #721c24; }
                .column {
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .column-title {
                    padding-bottom: 10px;
                    margin-bottom: 15px;
                    font-size: 18px;
                    font-weight: 600;
                    position: sticky;
                    top: 0;
                    background: white;
                    z-index: 10;
                }
                .column-title.requests {
                    border-bottom: 3px solid #dc3545;
                    color: #dc3545;
                }
                .column-title.kitchen {
                    border-bottom: 3px solid #ffc107;
                    color: #d39e00;
                }
                .column-title.ready {
                    border-bottom: 3px solid #28a745;
                    color: #28a745;
                }
                .column-title.payment {
                    border-bottom: 3px solid #007bff;
                    color: #007bff;
                }
               .card {
                    padding: 15px;
                    margin-bottom: 15px;
                    border-radius: 6px;
                    border: 1px solid;
                    background: #fff;
                }
                .card.request {
                    border-color: #f5c6cb;
                    background-color: #f8d7da;
                }
                .card.kitchen {
                    border-color: #ffeeba;
                    background-color: #fff3cd;
                }
                .card.ready {
                    border-color: #c3e6cb;
                    background-color: #d4edda;
                }
                .card.served {
                    border-color: #b8daff;
                    background-color: #cce5ff;
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .card-items {
                    font-size: 13px;
                    color: #555;
                    margin-bottom: 8px;
                    max-height: 100px;
                    overflow-y: auto;
                }
                .card-button {
                    margin-top: 8px;
                    width: 100%;
                    padding: 8px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 600;
                    color: white;
                    transition: filter 0.2s;
                }
                .card-button:hover {
                    filter: brightness(90%);
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    width: 350px;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                }
                .form-group input,
                .form-group select {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                .modal-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
            `}</style>
            <div className="page-container">
                <div className="header">
                    <h1 className="header-title">🛎️ Service Dashboard</h1>
                    <div className="header-actions">
                        <button onClick={() => router.push('/staff')} className="btn btn-secondary">
                            Back
                        </button>
                        <button onClick={handleLogout} className="btn btn-danger">
                            Logout
                        </button>
                    </div>
                </div>
                <div className="content">
                    <div className="grid">
                        {}
                        <div className="column">
                            <h2 className="column-title requests">⚠️ Requests</h2>
                            {requests.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center' }}>No active requests</p>
                            ) : (
                                requests.map(req => (
                                    <div key={req.request_id} className="card request">
                                        <div className="card-header">
                                            <span>Table {req.table_number || 'N/A'}</span>
                                            <span style={{ fontSize: '12px' }}>{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
                                            {req.request_type === 'call_server' ? '🔔 Call Server' : '🧾 Request Bill'}
                                        </div>
                                        <button
                                            onClick={() => completeRequest(req.request_id)}
                                            className="card-button"
                                            style={{ backgroundColor: '#dc3545' }}
                                        >
                                            ACKNOWLEDGE
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {}
                        <div className="column">
                            <h2 className="column-title kitchen">👨‍🍳 Kitchen</h2>
                            {kitchenOrders.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center' }}>No orders cooking</p>
                            ) : (
                                kitchenOrders.map(order => (
                                    <div key={order.order_id} className="card kitchen">
                                        <div className="card-header">
                                            <span>Table {order.table_number || 'N/A'}</span>
                                            <span style={{ fontSize: '12px' }}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="card-items">
                                            {order.order_details && order.order_details.map(d => (
                                                <div key={d.order_detail_id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{menuItems[d.item_id] || 'Item'}</span>
                                                    <b>x{d.quantity}</b>
                                                </div>
                                            ))}
                                            {!order.order_details && <div>Loading items...</div>}
                                        </div>
                                        <button
                                            onClick={() => markOrderReady(order.order_id)}
                                            className="card-button"
                                            style={{ backgroundColor: '#ffc107', color: '#000' }}
                                        >
                                            MARK READY
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {}
                        <div className="column">
                            <h2 className="column-title ready">🍳 Ready</h2>
                            {readyOrders.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center' }}>No orders ready</p>
                            ) : (
                                readyOrders.map(order => (
                                    <div key={order.order_id} className="card ready">
                                        <div className="card-header">
                                            <span>Table {order.table_number || 'N/A'}</span>
                                            <span style={{ fontSize: '12px' }}>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>Total: ${Number(order.total_amount).toFixed(2)}</div>
                                        <button
                                            onClick={() => serveOrder(order.order_id)}
                                            className="card-button"
                                            style={{ backgroundColor: '#28a745' }}
                                        >
                                            SERVE
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        {}
                        <div className="column">
                            <h2 className="column-title payment">💳 Active / Pay</h2>
                            {servedOrders.length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center' }}>No active orders</p>
                            ) : (
                                servedOrders.map(order => (
                                    <div key={order.order_id} className="card served">
                                        <div className="card-header">
                                            <span>Table {order.table_number || 'N/A'}</span>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>Total: ${Number(order.total_amount).toFixed(2)}</div>
                                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Status: {order.status}</div>
                                        <button
                                            onClick={() => openPaymentModal(order)}
                                            className="card-button"
                                            style={{ backgroundColor: '#007bff' }}
                                        >
                                            Process Payment
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    <div className="tables-section">
                        <h2 className="column-title" style={{ borderBottom: 'none', color: '#333' }}>📊 Table Availability</h2>
                        <div className="tables-grid">
                            {tables.map(table => (
                                <div key={table.table_id} className="table-card">
                                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>Table {table.table_number}</div>
                                    <div className={`status-badge ${table.status ? 'status-available' : 'status-unavailable'}`}>
                                        {table.status ? 'AVAILABLE' : 'UNAVAILABLE'}
                                    </div>
                                    <button
                                        onClick={() => toggleTableStatus(table.table_id, table.status)}
                                        className="btn"
                                        style={{
                                            backgroundColor: table.status ? '#dc3545' : '#28a745',
                                            color: 'white',
                                            width: '100%',
                                            marginTop: '10px'
                                        }}
                                    >
                                        {table.status ? 'Set Busy' : 'Set Free'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {}
                {showPaymentModal && selectedOrder && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>Process Payment</h2>
                            <p>Table {selectedOrder.table_number}</p>
                            <p>Total Amount: <strong>${Number(selectedOrder.total_amount).toFixed(2)}</strong></p>
                            <form onSubmit={processPayment}>
                                <div className="form-group">
                                    <label>Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount Paid</label>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                                        step="0.01"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        onClick={() => setShowPaymentModal(false)}
                                        className="btn btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn"
                                        style={{ backgroundColor: '#28a745', color: 'white' }}
                                    >
                                        Complete Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};
export default StaffService;