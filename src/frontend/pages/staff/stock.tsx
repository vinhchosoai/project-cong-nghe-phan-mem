import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
import Head from 'next/head';
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
const StaffStock = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState<string>('');
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
                fetchData(restaurant_id);
            } catch (error) {
                console.error('Failed to init stock manager:', error);
                router.push('/staff');
            }
        };
        init();
    }, [router]);
    const fetchData = async (resId: string) => {
        setLoading(true);
        try {
            const catRes = await axiosInstance.get(`/restaurants/${resId}/categories`);
            setCategories(catRes.data);
            const allItems: MenuItem[] = [];
            for (const cat of catRes.data) {
                const iRes = await axiosInstance.get(`/categories/${cat.category_id}/items`);
                allItems.push(...iRes.data);
            }
            setItems(allItems);
        } catch (err) {
            console.error('Failed to fetch menu data', err);
        } finally {
            setLoading(false);
        }
    };
    const toggleAvailability = async (item: MenuItem) => {
        try {
            const newStatus = !item.is_available;
            await axiosInstance.patch(`/menu-items/${item.item_id}`, { is_available: newStatus });
            setItems(prev => prev.map(i =>
                i.item_id === item.item_id ? { ...i, is_available: newStatus } : i
            ));
        } catch (err) {
            console.error('Failed to update item availability', err);
            alert('Failed to update item');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('guest_orders');
        router.push('/login');
    };
    const getItemsByCategory = (catId: string) => {
        return items.filter(i => i.category_id === catId);
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
                <title>Menu Stock | Staff</title>
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
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .header-title {
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                    color: #333;
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
                    transition: all 0.2s;
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
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .category-section {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .category-title {
                    margin: 0 0 15px 0;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #f0f0f0;
                    color: #2c3e50;
                    font-size: 18px;
                }
                .items-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                }
                .item-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    padding: 15px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background-color: white;
                }
                .item-card:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }
                .item-card.unavailable {
                    background-color: #f8f9fa;
                    border-color: #dee2e6;
                }
                .item-card.unavailable .item-name {
                    color: #6c757d;
                    text-decoration: line-through;
                }
                .item-name {
                    font-weight: 500;
                    margin-right: 10px;
                }
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }
                .status-badge.in-stock {
                    background-color: #d4edda;
                    color: #155724;
                }
                .status-badge.out-stock {
                    background-color: #f8d7da;
                    color: #721c24;
                }
            `}</style>
            <div className="page-container">
                <div className="header">
                    <h1 className="header-title">📦 Menu Stock Management</h1>
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
                    {categories.map(category => {
                        const catItems = getItemsByCategory(category.category_id);
                        if (catItems.length === 0) return null;
                        return (
                            <div key={category.category_id} className="category-section">
                                <h3 className="category-title">{category.name}</h3>
                                <div className="items-grid">
                                    {catItems.map(item => (
                                        <div
                                            key={item.item_id}
                                            className={`item-card ${!item.is_available ? 'unavailable' : ''}`}
                                            onClick={() => toggleAvailability(item)}
                                        >
                                            <span className="item-name">{item.name}</span>
                                            <span className={`status-badge ${item.is_available ? 'in-stock' : 'out-stock'}`}>
                                                {item.is_available ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
export default StaffStock;