import React, { useState, useEffect } from 'react';
import RestaurantLayout from '../components/Layout/RestaurantLayout';
import axiosInstance from '../../lib/axios';
import { useRouter } from 'next/router';
interface Staff {
    staff_id: string;
    user_id: string;
    username: string;
    email: string;
    role: string;
    restaurant_id: string;
}
const StaffManagement = () => {
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('manager');
    const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
    useEffect(() => {
        const role = localStorage.getItem('user_role');
        if (role !== 'restaurant_owner') {
            alert("Acccess Denied: Only Restaurant Owners can manage staff.");
            router.push('/restaurant');
            return;
        }
        fetchStaff();
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
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/staff');
            setStaffList(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch staff", err);
            setError("Failed to fetch staff.");
            setLoading(false);
        }
    };
    const handleEdit = (staff: Staff) => {
        setEditingStaffId(staff.staff_id);
        setUsername(staff.username);
        setEmail(staff.email);
        setRole(staff.role);
        setPassword('');
        setConfirmPassword('');
        setError('');
        setShowModal(true);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!editingStaffId) {
            if (password !== confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                setError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
                return;
            }
        }
        try {
            if (editingStaffId) {
                await axiosInstance.put(`/staff/${editingStaffId}`, {
                    role
                });
                alert("Staff updated successfully!");
            } else {
                await axiosInstance.post('/staff', {
                    username,
                    email,
                    password,
                    role
                });
                alert("Staff added successfully!");
            }
            setShowModal(false);
            resetForm();
            fetchStaff();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || "Failed to save staff");
        }
    };
    const handleDelete = async (staffId: string) => {
        if (!confirm("Are you sure you want to remove this staff member?")) return;
        try {
            await axiosInstance.delete(`/staff/${staffId}`);
            fetchStaff();
        } catch (err) {
            console.error(err);
            alert("Failed to delete staff");
        }
    };
    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setRole('manager');
        setEditingStaffId(null);
    };
    return (
        <RestaurantLayout>
            <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h1>Staff Management</h1>
                    <button
                        onClick={() => setShowModal(true)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        + Add Staff
                    </button>
                </div>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                {loading ? (
                    <p>Loading staff...</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Username</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Email</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Role</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffList.map((staff) => (
                                <tr key={staff.staff_id}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{staff.username}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{staff.email}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor: staff.role === 'manager' ? '#e2e3e5' : staff.role === 'chef' ? '#fff3cd' : '#d1ecf1',
                                            fontSize: '12px',
                                            textTransform: 'capitalize'
                                        }}>
                                            {staff.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                        <button
                                            onClick={() => handleEdit(staff)}
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: '#ffc107',
                                                color: '#212529',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                marginRight: '8px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(staff.staff_id)}
                                            style={{
                                                padding: '6px 10px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '12px'
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {staffList.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No staff members found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
                {}
                {showModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '24px',
                            borderRadius: '8px',
                            width: '400px',
                            maxWidth: '90%'
                        }}>
                            <h2 style={{ marginTop: 0 }}>{editingStaffId ? 'Edit Staff' : 'Add New Staff'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Username</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={!!editingStaffId}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: editingStaffId ? '#e9ecef' : 'white' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={!!editingStaffId}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: editingStaffId ? '#e9ecef' : 'white' }}
                                    />
                                </div>
                                {!editingStaffId && (
                                    <>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                        <div style={{ marginBottom: '15px' }}>
                                            <label style={{ display: 'block', marginBottom: '5px' }}>Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            />
                                        </div>
                                    </>
                                )}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px' }}>Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="chef">Chef</option>
                                        <option value="cashier">Cashier</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {editingStaffId ? 'Update Staff' : 'Create Staff'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </RestaurantLayout>
    );
};
export default StaffManagement;