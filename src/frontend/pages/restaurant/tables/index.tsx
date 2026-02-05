import { useState, useEffect } from 'react';
import axiosInstance from '../../../lib/axios';
import { useRouter } from 'next/router';

interface Table {
    table_id: string;
    table_number: number;
    qr_code_string: string;
    status: boolean;
}

export default function TableManager() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [generating, setGenerating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            // First get restaurant ID - assuming single restaurant for now or from context
            const restRes = await axiosInstance.get('/restaurants');
            if (restRes.data.length > 0) {
                const restId = restRes.data[0].restaurant_id;
                setRestaurantId(restId);
                const res = await axiosInstance.get(`/restaurants/${restId}/tables`);
                // Sort by table number
                setTables(res.data.sort((a: Table, b: Table) => a.table_number - b.table_number));
            }
        } catch (error) {
            console.error("Failed to fetch tables", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTable = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await axiosInstance.post(`/restaurants/${restaurantId}/tables`, {
                table_number: parseInt(newTableNumber)
            });
            setShowModal(false);
            setNewTableNumber('');
            fetchTables();
        } catch (error) {
            console.error("Failed to create table", error);
            alert("Failed to create table");
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteTable = async (id: string) => {
        if (!confirm("Are you sure? This will invalidate the QR code.")) return;
        try {
            await axiosInstance.delete(`/tables/${id}`);
            fetchTables();
        } catch (error) {
            console.error("Failed to delete table", error);
        }
    };

    // Helper to generate QR Code Image URL (using a public API or local lib if available, 
    // but for now we can just use a simple QR generator API for display)
    // Actually, asking backend to generate image is better, but frontend lib `qrcode.react` is standard.
    // Since I can't install packages easily, I'll use a public API for rendering or simple text display.
    // Using goqr.me API for simple rendering.
    const getQrImage = (data: string) => `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;

    if (loading) return <div className="p-8">Loading tables...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Table Management</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        + Add Table
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tables.map(table => (
                        <div key={table.table_id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
                            <div className="text-2xl font-bold text-gray-800 mb-4">Table {table.table_number}</div>

                            <div className="bg-gray-100 p-2 rounded-lg mb-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getQrImage(table.qr_code_string)} alt={`QR for Table ${table.table_number}`} className="w-32 h-32" />
                            </div>

                            <p className="text-xs text-gray-400 mb-4 text-center break-all">{table.qr_code_string}</p>

                            <div className="mt-auto w-full flex gap-2">
                                <a
                                    href={table.qr_code_string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 bg-blue-50 text-blue-600 text-center py-2 rounded hover:bg-blue-100 text-sm font-medium"
                                >
                                    Test Link
                                </a>
                                <button
                                    onClick={() => handleDeleteTable(table.table_id)}
                                    className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100 text-sm font-medium"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}

                    {tables.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No tables found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Table</h2>
                        <form onSubmit={handleCreateTable}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Table Number</label>
                                <input
                                    type="number"
                                    value={newTableNumber}
                                    onChange={e => setNewTableNumber(e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="e.g. 1"
                                    required
                                    min="1"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {generating ? 'Creating...' : 'Create Table'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
