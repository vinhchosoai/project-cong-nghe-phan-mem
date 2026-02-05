import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';

interface OrderDetail {
    order_detail_id: string;
    item_id: string;
    quantity: number;
    note?: string;
    // TODO: Expand OrderDetailResponse in backend to include item name or fetch separately?
    // Ideally backend response includes item_name.
    // Current schema doesn't show it (only IDs). 
    // We'll need to fetch menu items to map names or update backend.
    // Let's assume for now we might just see IDs or we fetch menu to map.
}

interface Order {
    order_id: string;
    restaurant_id: string;
    table_id: string;
    status: string;
    total_amount: number;
    created_at: string;
    order_details: OrderDetail[];
}

// Helper to map IDs to names - in a real app would be better from backend
interface MenuItem {
    item_id: string;
    name: string;
}

export default function KitchenView() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [menuItems, setMenuItems] = useState<Record<string, string>>({});

    // Need to get restaurant ID. 
    // Owner has one restaurant usually. We can fetch it first.
    const [restaurantId, setRestaurantId] = useState<string>('');

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Get Restaurant ID associated with this owner
                // We can use a new endpoint or list restaurants (filtered by tenant)
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
                // Redirect to login if 401?
            } finally {
                setLoading(false);
            }
        };
        init();

        // Polling every 10 seconds
        const interval = setInterval(() => {
            if (restaurantId) fetchOrders(restaurantId);
        }, 10000);

        return () => clearInterval(interval);
    }, [restaurantId]);

    const fetchMenuNames = async (restId: string) => {
        // Get all categories -> items to build a map
        // Efficient way: GET /public/menu/{id}/items (it's public but works)
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
            // Also maybe 'preparing'?
            // Let's get all and filter locally or just pending for now 
            // Actually owner probably wants to see Preparing too.
            // API supports filtering by status.
            // Let's get "pending" first.

            // For now just Pending orders to start cooking
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

    if (loading) return <div className="p-8">Loading kitchen view...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Kitchen Display System (KDS)</h1>

            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded shadow text-center text-gray-500">
                    No pending orders.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <div key={order.order_id} className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-indigo-500">
                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-lg">Table: {order.table_id.slice(0, 8)}...</span>
                                    <div className="text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleTimeString()}
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                                    {order.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="p-4 space-y-3">
                                {order.order_details.map(detail => (
                                    <div key={detail.order_detail_id} className="flex justify-between items-start border-b pb-2 last:border-0">
                                        <div>
                                            <div className="font-bold text-gray-800">
                                                {menuItems[detail.item_id] || 'Unknown Item'}
                                            </div>
                                            {detail.note && (
                                                <div className="text-sm text-red-500 italic">Note: {detail.note}</div>
                                            )}
                                        </div>
                                        <div className="font-bold text-xl bg-gray-100 w-8 h-8 flex items-center justify-center rounded">
                                            {detail.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-gray-50 border-t flex gap-2">
                                <button
                                    onClick={() => updateStatus(order.order_id, "PREPARING")}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
                                >
                                    Start Cooking
                                </button>
                                <button
                                    onClick={() => updateStatus(order.order_id, "COMPLETED")}
                                    className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700"
                                >
                                    Complete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
