import React, { useState, useEffect } from 'react';
import RestaurantLayout from '../components/Layout/RestaurantLayout';
import axiosInstance from '../../lib/axios';
import { useRouter } from 'next/router';
interface TableRequest {
    request_id: string;
    table_id: string;
    table_number?: number;
    request_type: string;
    status: string;
    created_at: string;
}
interface Order {
    order_id: string;
    table_number?: number;
    total_amount: number;
    status: string;
    created_at: string;
    items?: any[];
}
const ServiceDashboard = () => {
    const [requests, setRequests] = useState<TableRequest[]>([]);
    const [readyOrders, setReadyOrders] = useState<Order[]>([]);
    const [servedOrders, setServedOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<string>('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [amountPaid, setAmountPaid] = useState<number>(0);
    const router = useRouter();
    useEffect(() => {
        const init = async () => {
            const resId = localStorage.getItem('restaurant_id');
            if (resId) {
                setRestaurantId(resId);
                fetchData(resId);
            } else {
                try {
                    const restRes = await axiosInstance.get('/restaurants');
                    if (restRes.data.length > 0) {
                        const id = restRes.data[0].restaurant_id;
                        setRestaurantId(id);
                        localStorage.setItem('restaurant_id', id);
                        fetchData(id);
                    }
                } catch (error) {
                    console.error("Failed to fetch restaurant", error);
                }
            }
        };
        init();
        const interval = setInterval(() => {
            const resId = localStorage.getItem('restaurant_id');
            if (resId) fetchData(resId);
        }, 10000);
        return () => clearInterval(interval);
    }, []);
    const fetchData = async (resId: string) => {
        setLoading(true);
        try {
            const [reqRes, readyRes, servedRes] = await Promise.all([
                axiosInstance.get(`/table-requests/${resId}?status=pending`),
                axiosInstance.get(`/orders/status/READY?restaurant_id=${resId}`),
                axiosInstance.get(`/orders/status/SERVED?restaurant_id=${resId}`)
            ]);
            setRequests(reqRes.data);
            setReadyOrders(readyRes.data);
            setServedOrders(servedRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch service data", error);
            setLoading(false);
        }
    };
    const completeRequest = async (reqId: string) => {
        try {
            await axiosInstance.put(`/table-requests/${reqId}`, { status: 'completed' });
            setRequests(prev => prev.filter(r => r.request_id !== reqId));
        } catch (err) {
            console.error("Failed to complete request", err);
            alert("Failed to update request");
        }
    };
    const serveOrder = async (orderId: string) => {
        try {
            await axiosInstance.patch(`/orders/${orderId}`, { status: 'SERVED' });
            fetchData(restaurantId);
        } catch (err) {
            console.error("Failed to serve order", err);
            alert("Failed to update order");
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
            alert("Payment processed and order completed!");
            setShowPaymentModal(false);
            setSelectedOrder(null);
            fetchData(restaurantId);
        } catch (err) {
            console.error("Payment failed", err);
            alert("Payment failed");
        }
    };
    return (
        <RestaurantLayout>
            <div style={{ padding: '20px' }}>
                <h1 style={{ marginBottom: '20px' }}>Service Dashboard</h1>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {}
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ borderBottom: '2px solid #dc3545', paddingBottom: '10px', color: '#dc3545' }}>⚠️ Table Requests</h2>
                        {requests.length === 0 ? <p style={{ color: '#888' }}>No active requests.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {requests.map(req => (
                                    <div key={req.request_id} style={{ padding: '10px', border: '1px solid #ffeeba', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: 'bold' }}>Table {req.table_number || 'N/A'}</div>
                                        <div>{req.request_type === 'call_server' ? '🔔 Call Server' : '🧾 Request Bill'}</div>
                                        <div style={{ fontSize: '12px', color: '#856404' }}>{new Date(req.created_at).toLocaleTimeString()}</div>
                                        <button
                                            onClick={() => completeRequest(req.request_id)}
                                            style={{ marginTop: '5px', width: '100%', padding: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Complete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {}
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ borderBottom: '2px solid #28a745', paddingBottom: '10px', color: '#28a745' }}>🍳 Ready to Serve</h2>
                        {readyOrders.length === 0 ? <p style={{ color: '#888' }}>No orders ready.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {readyOrders.map(order => (
                                    <div key={order.order_id} style={{ padding: '10px', border: '1px solid #c3e6cb', backgroundColor: '#d4edda', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: 'bold' }}>Table {order.table_number || 'N/A'}</div>
                                        <div>Order Total: ${Number(order.total_amount).toFixed(2)}</div>
                                        <div style={{ fontSize: '12px', color: '#155724' }}>{new Date(order.created_at).toLocaleTimeString()}</div>
                                        <button
                                            onClick={() => serveOrder(order.order_id)}
                                            style={{ marginTop: '5px', width: '100%', padding: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Mark Served
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {}
                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', color: '#007bff' }}>💳 Active Tables</h2>
                        {servedOrders.length === 0 ? <p style={{ color: '#888' }}>No active served orders.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {servedOrders.map(order => (
                                    <div key={order.order_id} style={{ padding: '10px', border: '1px solid #b8daff', backgroundColor: '#cce5ff', borderRadius: '4px' }}>
                                        <div style={{ fontWeight: 'bold' }}>Table {order.table_number || 'N/A'}</div>
                                        <div>Total: ${Number(order.total_amount).toFixed(2)}</div>
                                        <div style={{ fontSize: '12px', color: '#004085' }}>Status: {order.status}</div>
                                        <button
                                            onClick={() => openPaymentModal(order)}
                                            style={{ marginTop: '5px', width: '100%', padding: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Process Payment
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                {}
                {showPaymentModal && selectedOrder && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '350px' }}>
                            <h2>Process Payment</h2>
                            <p>Table {selectedOrder.table_number}</p>
                            <p>Total Amount: <strong>${Number(selectedOrder.total_amount).toFixed(2)}</strong></p>
                            <form onSubmit={processPayment}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{ width: '100%', padding: '8px' }}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="online">Online</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Amount Paid</label>
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                                        step="0.01"
                                        style={{ width: '100%', padding: '8px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowPaymentModal(false)} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Complete Payment</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </RestaurantLayout>
    );
};
export default ServiceDashboard;