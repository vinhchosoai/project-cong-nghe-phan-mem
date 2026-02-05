import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// Interfaces
interface MenuItem {
    item_id: string;
    category_id: string;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    is_available: boolean;
}

interface Category {
    category_id: string;
    name: string;
    display_index: number;
}

interface CartItem {
    item: MenuItem;
    quantity: number;
    note?: string;
}

export default function PublicMenu() {
    const router = useRouter();
    const { restaurantId, tableId } = router.query;

    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [customerInfo, setCustomerInfo] = useState<any>(null);

    // Base URL for public API - adjust if checking local/prod environment
    const API_URL = 'http://localhost:8000/api/v1/public';

    useEffect(() => {
        if (restaurantId) {
            fetchMenu();
        }
        fetchCustomerInfo();
    }, [restaurantId]);

    const fetchCustomerInfo = async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                // We use axios directly here or need an instance with interceptor? 
                // Public menu might not have axiosInstance setup for auth unless shared.
                // Assuming simple fetch with header for now.
                const res = await axios.get('http://localhost:8000/api/v1/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCustomerInfo(res.data);
            } catch (e) {
                console.error("Failed to fetch customer info", e);
            }
        }
    };

    const fetchMenu = async () => {
        try {
            const [catRes, itemRes] = await Promise.all([
                axios.get(`${API_URL}/menu/${restaurantId}`),
                axios.get(`${API_URL}/menu/${restaurantId}/items`)
            ]);

            setCategories(catRes.data);
            setMenuItems(itemRes.data);

            if (catRes.data.length > 0) {
                setActiveCategory(catRes.data[0].category_id);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch menu:', error);
            setLoading(false);
        }
    };

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.item.item_id === item.item_id);
            if (existing) {
                return prev.map(i =>
                    i.item.item_id === item.item_id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            }
            return [...prev, { item, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.item.item_id !== itemId));
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.item.item_id === itemId) {
                    const newQty = i.quantity + delta;
                    return newQty > 0 ? { ...i, quantity: newQty } : i;
                }
                return i;
            });
        });
    };

    const submitOrder = async () => {
        if (cart.length === 0) return;
        setSubmitting(true);

        try {
            const orderData = {
                restaurant_id: restaurantId,
                table_id: tableId,
                items: cart.map(i => ({
                    item_id: i.item.item_id,
                    quantity: i.quantity,
                    note: i.note
                }))
            };

            await axios.post(`${API_URL}/orders`, orderData);
            setOrderSuccess(true);
            setCart([]);
        } catch (error) {
            console.error('Failed to submit order:', error);
            alert('Failed to submit order. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading menu...</div>;

    if (orderSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
                <div className="text-center p-8 bg-white rounded-lg shadow-xl">
                    <div className="text-5xl mb-4">✅</div>
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Order Submitted!</h1>
                    <p className="text-gray-600 mb-6">Your order has been sent to the kitchen.</p>
                    <button
                        onClick={() => setOrderSuccess(false)}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
                    >
                        Order More
                    </button>
                </div>
            </div>
        );
    }

    // Calculate Total
    const total = cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h1 className="font-bold text-lg">Menu</h1>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">Table {tableId ? tableId.slice(0, 4) : ''}</span>
                    </div>
                    {/* Customer Profile Section */}
                    {customerInfo && (
                        <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium text-indigo-900">
                                👤 {customerInfo.username}
                            </span>
                            <span className="text-sm font-bold text-indigo-600">
                                🏆 {customerInfo.current_points} Points
                            </span>
                        </div>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="flex overflow-x-auto p-2 gap-2 hide-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat.category_id}
                            onClick={() => setActiveCategory(cat.category_id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.category_id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-4">
                {menuItems
                    .filter(item => item.category_id === activeCategory)
                    .map(item => (
                        <div key={item.item_id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4">
                            {/* Use placeholder if no image */}
                            <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 bg-cover bg-center"
                                style={{ backgroundImage: item.image_url ? `url(${item.image_url})` : 'none' }}>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{item.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="font-bold text-indigo-600">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                    </span>
                                    <button
                                        onClick={() => addToCart(item)}
                                        className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold hover:bg-indigo-200"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {/* Cart Float */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 border-t z-20">
                    <div className="max-w-md mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-800">Your Order ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
                            <span className="font-bold text-xl text-indigo-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
                            </span>
                        </div>

                        {/* Collapsible details could go here */}

                        <button
                            onClick={submitOrder}
                            disabled={submitting}
                            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {submitting ? 'Sending...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
