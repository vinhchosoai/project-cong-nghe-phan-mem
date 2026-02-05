import { useState, useEffect } from 'react';
import axiosInstance from '../../lib/axios';

// Interfaces
interface Ingredient {
    ingredient_id: string;
    name: string;
    quantity: number;
    unit: string;
    is_available: boolean;
}

export default function InventoryManager() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<Ingredient | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        quantity: 0,
        unit: '',
    });

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
        setFormData({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ingredient?')) return;
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

    if (loading) return <div className="p-8">Loading inventory...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Quản lý kho (Nguyên liệu)</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                    >
                        + Thêm nguyên liệu
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Tên nguyên liệu</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Số lượng</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Đơn vị</th>
                                <th className="px-6 py-4 text-left font-semibold text-gray-600">Trạng thái</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ingredients.map((item) => (
                                <tr key={item.ingredient_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{item.name}</td>
                                    <td className="px-6 py-4">{item.quantity}</td>
                                    <td className="px-6 py-4">{item.unit}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => toggleAvailability(item)}
                                            className={`px-3 py-1 rounded-full text-sm font-bold transition-colors ${item.is_available
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                }`}
                                        >
                                            {item.is_available ? 'Có sẵn' : 'Hết hàng'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-indigo-600 hover:text-indigo-800 font-medium"
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.ingredient_id)}
                                            className="text-red-600 hover:text-red-800 font-medium"
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {ingredients.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Chưa có nguyên liệu nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {editingItem ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên liệu</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                                    <input
                                        type="text"
                                        value={formData.unit}
                                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="kg, hộp, chai..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold"
                                >
                                    Lưu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
