import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';

// Interfaces
interface MenuItem {
    item_id: string;
    category_id: string;
    name: string;
    description: string;
    price: number;
    is_available: boolean;
    image_url?: string;
    ai_tags?: string;
}

interface Category {
    category_id: string;
    restaurant_id: string;
    name: string;
    display_index: number;
    items: MenuItem[];
}

export default function MenuManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');

    // Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [activeCategoryId, setActiveCategoryId] = useState('');

    // Forms
    const [categoryName, setCategoryName] = useState('');
    const [itemForm, setItemForm] = useState({
        name: '',
        price: '',
        description: '',
        image_url: '',
    });

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

        // Fetch items for each category
        const catsWithItems = await Promise.all(cats.map(async (cat: any) => {
            const itemRes = await axiosInstance.get(`/categories/${cat.category_id}/items`);
            return { ...cat, items: itemRes.data };
        }));

        setCategories(catsWithItems);
    };

    // --- Category Actions ---

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/restaurants/${restaurantId}/categories`, {
                name: categoryName,
                display_index: categories.length // simple append
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
        if (!confirm("Delete this category? Items inside might be orphaned or deleted.")) return;
        try {
            await axiosInstance.delete(`/categories/${catId}`);
            fetchCategories(restaurantId);
        } catch (error) {
            console.error(error);
        }
    };

    // --- Item Actions ---

    const toggleItemAvailability = async (item: MenuItem) => {
        try {
            // Optimistic update
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
        if (!confirm("Are you sure you want to delete this item?")) return;
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
        setShowItemModal(true);
    };

    const handleItemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                name: itemForm.name,
                price: parseFloat(itemForm.price),
                description: itemForm.description,
                image_url: itemForm.image_url,
            };

            if (editingItem) {
                await axiosInstance.patch(`/menu-items/${editingItem.item_id}`, payload);
            } else {
                await axiosInstance.post(`/categories/${activeCategoryId}/items`, payload);
            }
            setShowItemModal(false);
            fetchCategories(restaurantId);
        } catch (error) {
            console.error("Failed to save item", error);
            alert("Failed to save item");
        }
    };


    if (loading) return <div className="p-8">Loading menu manager...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Menu Management</h1>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        + Add Category
                    </button>
                </div>

                <div className="space-y-8">
                    {categories.map(cat => (
                        <div key={cat.category_id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">{cat.name}</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openCreateItemModal(cat.category_id)}
                                        className="text-sm bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                                    >
                                        + Add Item
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCategory(cat.category_id)}
                                        className="text-sm text-red-600 hover:text-red-800 px-2"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cat.items.map(item => (
                                    <div key={item.item_id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`w-16 h-16 rounded-lg bg-gray-200 bg-cover bg-center ${!item.is_available ? 'grayscale' : ''}`}
                                                style={{ backgroundImage: item.image_url ? `url(${item.image_url})` : 'none' }}
                                            ></div>
                                            <div>
                                                <h3 className={`font-semibold text-gray-800 ${!item.is_available ? 'text-gray-400 line-through' : ''}`}>
                                                    {item.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price)}
                                                </p>
                                                {item.description && <p className="text-xs text-gray-400 max-w-md truncate">{item.description}</p>}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => openEditItemModal(item)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDeleteItem(item.item_id)}
                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                            >
                                                Delete
                                            </button>

                                            <button
                                                onClick={() => toggleItemAvailability(item)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${item.is_available ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span className="sr-only">Toggle availability</span>
                                                <span
                                                    aria-hidden="true"
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${item.is_available ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {cat.items.length === 0 && (
                                    <div className="p-8 text-center text-gray-400 text-sm">No items in this category</div>
                                )}
                            </div>
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No categories found. Add one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                        <h2 className="text-xl font-bold mb-4">Add Category</h2>
                        <form onSubmit={handleCreateCategory}>
                            <input
                                type="text"
                                className="w-full border rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="Category Name (e.g. Desserts)"
                                value={categoryName}
                                onChange={e => setCategoryName(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleItemSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 mt-1"
                                        value={itemForm.name}
                                        onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full border rounded-lg px-3 py-2 mt-1"
                                        value={itemForm.price}
                                        onChange={e => setItemForm({ ...itemForm, price: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        className="w-full border rounded-lg px-3 py-2 mt-1"
                                        rows={3}
                                        value={itemForm.description}
                                        onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg px-3 py-2 mt-1"
                                        placeholder="https://..."
                                        value={itemForm.image_url}
                                        onChange={e => setItemForm({ ...itemForm, image_url: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
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
