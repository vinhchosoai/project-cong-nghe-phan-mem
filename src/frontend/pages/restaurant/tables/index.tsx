import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../../lib/axios';
interface Table {
    table_id: string;
    table_number: number;
    qr_code_string: string;
    status: boolean;
}
export default function TableManager() {
    const router = useRouter();
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [restaurantId, setRestaurantId] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [generating, setGenerating] = useState(false);
    useEffect(() => {
        fetchTables();
    }, []);
    const fetchTables = async () => {
        try {
            const restRes = await axiosInstance.get('/restaurants');
            if (restRes.data.length > 0) {
                const restId = restRes.data[0].restaurant_id;
                setRestaurantId(restId);
                const res = await axiosInstance.get(`/restaurants/${restId}/tables`);
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
        if (!confirm("Delete this table? This will invalidate the QR code.")) return;
        try {
            await axiosInstance.delete(`/tables/${id}`);
            fetchTables();
        } catch (error) {
            console.error("Failed to delete table", error);
        }
    };
    const getQrImage = (data: string) => `https:
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
                    <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Table Management</h1>
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
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>+ Add Table</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {tables.map(table => (
                        <div key={table.table_id} style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>Table {table.table_number}</div>
                            <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                                {}
                                <img src={getQrImage(table.qr_code_string)} alt={`QR for Table ${table.table_number}`} style={{ width: '150px', height: '150px' }} />
                            </div>
                            <p style={{ fontSize: '11px', color: '#999', marginBottom: '15px', textAlign: 'center', wordBreak: 'break-all', maxWidth: '100%' }}>{table.qr_code_string}</p>
                            <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
                                <a href={table.qr_code_string} target="_blank" rel="noreferrer" style={{ flex: 1, backgroundColor: '#007bff', color: '#fff', textAlign: 'center', padding: '8px', borderRadius: '4px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold' }}>
                                    Test Link
                                </a>
                                <button onClick={() => handleDeleteTable(table.table_id)} style={{ flex: 1, backgroundColor: '#dc3545', color: '#fff', padding: '8px', borderRadius: '4px', border: 'none', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {tables.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', padding: '40px', textAlign: 'center', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', color: '#999' }}>
                            No tables found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '30px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>Add New Table</h2>
                        <form onSubmit={handleCreateTable}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>Table Number</label>
                                <input type="number" value={newTableNumber} onChange={e => setNewTableNumber(e.target.value)} placeholder="e.g. 1" required min="1" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button type="submit" disabled={generating} style={{ padding: '10px 20px', backgroundColor: generating ? '#999' : '#007bff', border: 'none', borderRadius: '4px', color: '#fff', cursor: generating ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
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