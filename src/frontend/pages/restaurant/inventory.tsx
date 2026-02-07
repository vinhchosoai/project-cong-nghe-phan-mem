import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
interface Ingredient {
    ingredient_id: string;
    name: string;
    quantity: number;
    unit: string;
    is_available: boolean;
}
export default function InventoryManager() {
    const router = useRouter();
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
    const [formData, setFormData] = useState({ name: '', quantity: 0, unit: '' });
    const [restaurantId, setRestaurantId] = useState('');
    useEffect(() => {
        fetchRestaurantAndIngredients();
    }, []);
    const fetchRestaurantAndIngredients = async () => {
        try {
            const restRes = await axiosInstance.get('/restaurants');
            if (restRes.data.length > 0) {
                const restId = restRes.data[0].restaurant_id;
                setRestaurantId(restId);
                await fetchIngredients(restId);
            }
        } catch (error) {
            console.error('Failed to init inventory:', error);
        } finally {
            setLoading(false);
        }
    };
    const fetchIngredients = async (restId: string) => {
        try {
            const response = await axiosInstance.get(`/ingredients/restaurant/${restId}`);
            setIngredients(response.data);
        } catch (error) {
            console.error('Failed to fetch ingredients:', error);
        }
    };
    const resetForm = () => {
        setFormData({ name: '', quantity: 0, unit: '' });
        setEditingItem(null);
        setShowModal(false);
    };
    const handleEdit = (item: Ingredient) => {
        setEditingItem(item);
        setFormData({ name: item.name, quantity: item.quantity, unit: item.unit });
        setShowModal(true);
    };
    const handleDelete = async (id: string) => {
        if (!confirm('Delete this ingredient?')) return;
        try {
            await axiosInstance.delete(`/ingredients/${id}`);
            fetchIngredients(restaurantId);
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };
    const toggleAvailability = async (item: Ingredient) => {
        try {
            await axiosInstance.patch(`/ingredients/${item.ingredient_id}`, {
                is_available: !item.is_available
            });
            fetchIngredients(restaurantId);
        } catch (error) {
            console.error('Failed to toggle:', error);
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await axiosInstance.patch(`/ingredients/${editingItem.ingredient_id}`, formData);
            } else {
                await axiosInstance.post('/ingredients', {
                    ...formData,
                    restaurant_id: restaurantId,
                    is_available: true
                });
            }
            resetForm();
            fetchIngredients(restaurantId);
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Operation failed');
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
                    <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Inventory Management</h1>
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
                    <button onClick={() => setShowModal(true)} style={{ padding: '10px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>+ Add Ingredient</button>
                </div>
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9f9f9', borderBottom: '2px solid #ccc' }}>
                            <tr>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>Name</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>Quantity</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>Unit</th>
                                <th style={{ padding: '15px 20px', textAlign: 'left', fontWeight: 'bold', color: '#333' }}>Status</th>
                                <th style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ingredients.map((item) => (
                                <tr key={item.ingredient_id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{item.name}</td>
                                    <td style={{ padding: '15px 20px' }}>{item.quantity}</td>
                                    <td style={{ padding: '15px 20px' }}>{item.unit}</td>
                                    <td style={{ padding: '15px 20px' }}>
                                        <button onClick={() => toggleAvailability(item)} style={{ padding: '5px 15px', backgroundColor: item.is_available ? '#28a745' : '#dc3545', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', minWidth: '100px' }}>
                                            {item.is_available ? 'Available' : 'Out of Stock'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                        <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', marginRight: '10px' }}>Edit</button>
                                        <button onClick={() => handleDelete(item.ingredient_id)} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {ingredients.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No ingredients found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '500px' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>
                            {editingItem ? 'Edit Ingredient' : 'Add New Ingredient'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Quantity</label>
                                    <input type="number" step="0.01" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Unit</label>
                                    <input type="text" placeholder="kg, box, bottle..." value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={resetForm} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}