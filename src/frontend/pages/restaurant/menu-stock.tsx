import React, { useState, useEffect } from 'react';
import RestaurantLayout from '../components/Layout/RestaurantLayout';
import axiosInstance from '../../lib/axios';
import { useRouter } from 'next/router';
interface MenuItem {
    item_id: string;
    name: string;
    is_available: boolean;
    category_id: string;
}
interface Category {
    category_id: string;
    name: string;
    display_index: number;
}
const MenuStock = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    useEffect(() => {
        fetchData();
    }, []);
    const fetchRestaurantId = async (): Promise<string | null> => {
        let resId = localStorage.getItem('restaurant_id');
        if (!resId) {
            try {
                const restRes = await axiosInstance.get('/restaurants');
                if (restRes.data.length > 0) {
                    resId = restRes.data[0].restaurant_id;
                    localStorage.setItem('restaurant_id', resId || '');
                }
            } catch (error) {
                console.error("Failed to fetch restaurant ID", error);
            }
        }
        return resId;
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            const resId = await fetchRestaurantId();
            if (!resId) {
                setError("No restaurant selected.");
                setLoading(false);
                return;
            }
            const [catRes] = await Promise.all([
                axiosInstance.get(`/restaurants/${resId}/categories`),
            ]);
            setCategories(catRes.data);
            const allItems: MenuItem[] = [];
            for (const cat of catRes.data) {
                const iRes = await axiosInstance.get(`/categories/${cat.category_id}/items`);
                allItems.push(...iRes.data);
            }
            setItems(allItems);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch menu data", err);
            setError("Failed to fetch menu data.");
            setLoading(false);
        }
    };
    const toggleAvailability = async (item: MenuItem) => {
        try {
            const newStatus = !item.is_available;
            setItems(items.map(i => i.item_id === item.item_id ? { ...i, is_available: newStatus } : i));
            await axiosInstance.patch(`/menu-items/${item.item_id}`, {
                is_available: newStatus
            });
        } catch (err) {
            console.error("Failed to update availability", err);
            alert("Failed to update status");
            setItems(items.map(i => i.item_id === item.item_id ? { ...i, is_available: !item.is_available } : i));
        }
    };
    return (
        <RestaurantLayout>
            <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h1>Kitchen Stock Management</h1>
                    <p>Toggle item availability instantly.</p>
                </div>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                {loading ? (
                    <p>Loading menu...</p>
                ) : (
                    <div>
                        {categories.sort((a, b) => a.display_index - b.display_index).map(cat => (
                            <div key={cat.category_id} style={{ marginBottom: '30px' }}>
                                <h2 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>{cat.name}</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                    {items.filter(i => i.category_id === cat.category_id).map(item => (
                                        <div key={item.item_id} style={{
                                            padding: '15px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            backgroundColor: item.is_available ? 'white' : '#f8f9fa',
                                            opacity: item.is_available ? 1 : 0.7,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <span style={{ fontWeight: 'bold', color: item.is_available ? 'black' : '#6c757d' }}>{item.name}</span>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <span style={{ marginRight: '10px', fontSize: '12px', color: item.is_available ? 'green' : 'red' }}>
                                                    {item.is_available ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_available}
                                                    onChange={() => toggleAvailability(item)}
                                                    style={{ transform: 'scale(1.5)' }}
                                                />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </RestaurantLayout>
    );
};
export default MenuStock;