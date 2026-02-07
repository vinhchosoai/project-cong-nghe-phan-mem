import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
interface MenuItem {
    item_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    is_available: boolean;
    image_url?: string;
}
interface Category {
    category_id: string;
    restaurant_id: string;
    name: string;
    display_index: number;
    items: MenuItem[];
}
export default function MenuManager() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [itemForm, setItemForm] = useState({
        name: '',
        price: '',
        description: '',
        image_url: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    useEffect(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        try {
            const restRes = await axiosInstance.get('/restaurants');
            if (restRes.data.length > 0) {
                const restId = restRes.data[0].restaurant_id;
                setRestaurantId(restId);
                await fetchCategories(restId);
            }
        } catch (error) {
            console.error('Failed to load menu:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async (restId: string) => {
        const catRes = await axiosInstance.get(`/restaurants/${restId}/categories`);
        const cats = catRes.data;
        const catsWithItems = await Promise.all(cats.map(async (cat: any) => {
            const itemRes = await axiosInstance.get(`/categories/${cat.category_id}/items`);
            return { ...cat, items: itemRes.data };
        }));
        setCategories(catsWithItems);
    };
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/restaurants/${restaurantId}/categories`, {
                name: categoryName,
                display_index: categories.length
            });
            setShowCategoryModal(false);
            setCategoryName('');
            await fetchCategories(restaurantId);
        } catch (error) {
            console.error("Failed to create category", error);
            alert("Failed to create category");
        }
    };
    const handleDeleteCategory = async (catId: string) => {
        if (!confirm("Delete this category?")) return;
        try {
            await axiosInstance.delete(`/categories/${catId}`);
            fetchCategories(restaurantId);
        } catch (error) {
            console.error(error);
        }
    };
    const toggleItemAvailability = async (item: MenuItem) => {
        try {
            setCategories(prev => prev.map(cat => ({
                ...cat,
                items: cat.items.map(i => i.item_id === item.item_id ? { ...i, is_available: !i.is_available } : i)
            })));
            await axiosInstance.patch(`/menu-items/${item.item_id}`, {
                is_available: !item.is_available
            });
        } catch (error) {
            console.error('Failed to toggle item:', error);
            fetchCategories(restaurantId);
        }
    };
    const handleDeleteItem = async (itemId: string) => {
        if (!confirm("Delete this item?")) return;
        try {
            await axiosInstance.delete(`/menu-items/${itemId}`);
            fetchCategories(restaurantId);
        } catch (error) {
            console.error("Failed to delete item", error);
        }
    };
    const openCreateItemModal = (catId: string) => {
        setActiveCategoryId(catId);
        setEditingItem(null);
        setItemForm({ name: '', price: '', description: '', image_url: '' });
        setImageFile(null);
        setShowItemModal(true);
    };
    const openEditItemModal = (item: MenuItem) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            price: item.price.toString(),
            description: item.description || '',
            image_url: item.image_url || '',
        });
        setImageFile(null);
        setShowItemModal(true);
    };
    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let image_url = itemForm.image_url;
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const uploadRes = await axiosInstance.post('/upload/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                image_url = uploadRes.data.url;
            }
            const payload = {
                name: itemForm.name,
                price: parseFloat(itemForm.price),
                description: itemForm.description,
                image_url: image_url,
            };
            if (editingItem) {
                await axiosInstance.patch(`/menu-items/${editingItem.item_id}`, payload);
            } else {
                await axiosInstance.post(`/categories/${activeCategoryId}/items`, payload);
            }
            setShowItemModal(false);
            setImageFile(null);
            fetchCategories(restaurantId);
        } catch (error) {
            console.error("Failed to save item", error);
            alert("Failed to save item");
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('tenant_id');
        router.push('/login');
    };
    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <div style={{ backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Menu Management</h1>
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
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 30px' }}>
                <div style={{ marginBottom: '20px', textAlign: 'right' }}>
                    <button onClick={() => setShowCategoryModal(true)} style={{ padding: '10px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '16px', cursor: 'pointer' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>+ Add Category</button>
                </div>
                {categories.map(cat => (
                    <div key={cat.category_id} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#f9f9f9', padding: '15px 20px', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '20px', color: '#333', fontWeight: 'bold' }}>{cat.name}</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => openCreateItemModal(cat.category_id)} style={{ padding: '8px 15px', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>+ Add Item</button>
                                <button onClick={() => handleDeleteCategory(cat.category_id)} style={{ padding: '8px 15px', backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Delete</button>
                            </div>
                        </div>
                        <div>
                            {cat.items.map(item => (
                                <div key={item.item_id} style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                                        {item.image_url && (
                                            <div style={{ width: '60px', height: '60px', backgroundImage: `url(${item.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', backgroundColor: '#e0e0e0', filter: !item.is_available ? 'grayscale(100%)' : 'none' }}></div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: !item.is_available ? '#999' : '#333', textDecoration: !item.is_available ? 'line-through' : 'none' }}>{item.name}</h3>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#007bff', fontWeight: 'bold' }}>${item.price.toFixed(2)}</p>
                                            {item.description && <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{item.description}</p>}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <button onClick={() => openEditItemModal(item)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Edit</button>
                                        <button onClick={() => handleDeleteItem(item.item_id)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Delete</button>
                                        <button onClick={() => toggleItemAvailability(item)} style={{ padding: '6px 15px', backgroundColor: item.is_available ? '#28a745' : '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', minWidth: '100px' }}>
                                            {item.is_available ? 'Available' : 'Unavailable'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {cat.items.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No items in this category</div>}
                        </div>
                    </div>
                ))}
                {categories.length === 0 && <div style={{ backgroundColor: '#fff', padding: '40px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', color: '#999' }}>No categories found. Add one to get started.</div>}
            </div>
            {showCategoryModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>Add Category</h2>
                        <form onSubmit={handleCreateCategory}>
                            <input type="text" placeholder="Category Name" value={categoryName} onChange={e => setCategoryName(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowCategoryModal(false)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showItemModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleItemSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Name</label>
                                <input type="text" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Price</label>
                                <input type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Description</label>
                                <textarea value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', minHeight: '80px', fontFamily: 'Arial, sans-serif' }} />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                />
                                {(itemForm.image_url || imageFile) && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Preview:</p>
                                        {imageFile ? (
                                            <img
                                                src={URL.createObjectURL(imageFile)}
                                                alt="Preview"
                                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        ) : itemForm.image_url ? (
                                            <img
                                                src={itemForm.image_url}
                                                alt="Current"
                                                style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        ) : null}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowItemModal(false)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {editingItem ? 'Save Changes' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}