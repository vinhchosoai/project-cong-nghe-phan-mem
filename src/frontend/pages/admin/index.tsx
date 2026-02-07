import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';
import DashboardLayout from '../components/Layout/DashboardLayout';
interface User {
  user_id: string;
  username: string;
  email: string;
  phone_number: string | null;
  role: string;
  created_at: string;
}
interface Restaurant {
  restaurant_id: string;
  name: string;
  address: string;
  status: boolean;
}
export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'restaurants'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [restaurantFormData, setRestaurantFormData] = useState({
    name: '',
    address: '',
    owner_username: '',
    owner_email: '',
    owner_password: '',
    confirm_owner_password: '',
    owner_phone: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
          router.push('/login');
          return;
        }
        const response = await axiosInstance.get('/auth/me');
        if (response.data.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(response.data);
        fetchUsers();
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);
  useEffect(() => {
    if (activeTab === 'restaurants') {
      fetchRestaurants();
    } else {
      fetchUsers();
    }
  }, [activeTab]);
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };
  const fetchRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const response = await axiosInstance.get('/admin/users/restaurants');
      setRestaurants(response.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoadingRestaurants(false);
    }
  };
  const handleResetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      phone_number: '',
      password: '',
    });
    setEditingUser(null);
    setShowUserForm(false);
  };
  const handleResetRestaurantForm = () => {
    setRestaurantFormData({
      name: '',
      address: '',
      owner_username: '',
      owner_email: '',
      owner_password: '',
      confirm_owner_password: '',
      owner_phone: '',
    });
    setEditingRestaurant(null);
    setShowRestaurantForm(false);
  };
  const handleEditRestaurant = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setRestaurantFormData({
      name: restaurant.name,
      address: restaurant.address,
      owner_username: '',
      owner_email: '',
      owner_password: '',
      confirm_owner_password: '',
      owner_phone: '',
    });
    setShowRestaurantForm(true);
  };
  const handleEditUser = (selectedUser: User) => {
    setEditingUser(selectedUser);
    setUserFormData({
      username: selectedUser.username,
      email: selectedUser.email,
      phone_number: selectedUser.phone_number || '',
      password: '',
    });
    setShowUserForm(true);
  };
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const submitData: any = {
        username: userFormData.username,
        email: userFormData.email,
        phone_number: userFormData.phone_number || null,
      };
      if (editingUser) {
        if (userFormData.password) submitData.password = userFormData.password;
        await axiosInstance.put(`/admin/users/${editingUser.user_id}`, submitData);
        setSuccess('User updated successfully');
      } else {
        submitData.password = userFormData.password;
        await axiosInstance.post('/admin/users', submitData);
        setSuccess('User created successfully');
      }
      handleResetUserForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };
  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (editingRestaurant) {
      try {
        await axiosInstance.put(`/admin/users/restaurants/${editingRestaurant.restaurant_id}`, {
          name: restaurantFormData.name,
          address: restaurantFormData.address,
        });
        setSuccess('Restaurant updated successfully');
        handleResetRestaurantForm();
        fetchRestaurants();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to update restaurant');
      }
      return;
    }
    if (restaurantFormData.owner_password !== restaurantFormData.confirm_owner_password) {
      setError("Passwords do not match");
      return;
    }
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(restaurantFormData.owner_password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter and one number.");
      return;
    }
    try {
      const response = await axiosInstance.post('/admin/users/restaurants', {
        restaurant_name: restaurantFormData.name,
        restaurant_address: restaurantFormData.address,
        owner_username: restaurantFormData.owner_username,
        owner_email: restaurantFormData.owner_email,
        owner_password: restaurantFormData.owner_password,
        owner_phone: restaurantFormData.owner_phone || null,
      });
      setSuccess('Restaurant and owner account created successfully');
      handleResetRestaurantForm();
      fetchRestaurants();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create restaurant');
    }
  };
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete user');
    }
  };
  const handleDeleteRestaurant = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await axiosInstance.delete(`/admin/users/restaurants/${id}`);
      setSuccess('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (e) {
      console.error(e);
      setError('Failed to delete restaurant');
    }
  };
  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  return (
    <DashboardLayout title="Admin Dashboard" userRole="Admin">
      <style jsx>{`
        .message-box {
          padding: 12px;
          margin-bottom: 15px;
          border-radius: 4px;
          font-size: 14px;
        }
        .error-box {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .success-box {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .tabs {
          display: flex;
          border-bottom: 1px solid #ccc;
          margin-bottom: 30px;
        }
        .tab-button {
          padding: 12px 24px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 16px;
          color: #666;
          transition: all 0.3s;
        }
        .tab-button:hover {
          color: #333;
        }
        .tab-button.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }
        .content-box {
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }
        .header-row h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.3s;
        }
        .btn-primary {
          background-color: #007bff;
          color: #fff;
        }
        .btn-primary:hover {
          background-color: #0056b3;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: #fff;
        }
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        .form-container {
          background-color: #f8f9fa;
          padding: 25px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
          margin-bottom: 25px;
        }
        .form-container h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 15px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          margin-bottom: 5px;
          font-size: 14px;
          color: #495057;
          font-weight: 500;
        }
        .form-group input {
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }
        .form-group input:disabled {
          background-color: #e9ecef;
          cursor: not-allowed;
        }
        .form-section {
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
        }
        .form-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #495057;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        table th,
        table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }
        table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #495057;
          font-size: 14px;
        }
        table td {
          font-size: 14px;
          color: #212529;
        }
        table tr:hover {
          background-color: #f8f9fa;
        }
        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          background-color: #e7f3ff;
          color: #004085;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-badge {
          font-weight: 600;
        }
        .status-active {
          color: #28a745;
        }
        .status-inactive {
          color: #dc3545;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
        }
        .btn-small {
          padding: 6px 12px;
          font-size: 13px;
        }
        .btn-edit {
          background-color: #007bff;
          color: #fff;
        }
        .btn-edit:hover {
          background-color: #0056b3;
        }
        .btn-delete {
          background-color: #dc3545;
          color: #fff;
        }
        .btn-delete:hover {
          background-color: #c82333;
        }
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      {error && <div className="message-box error-box">{error}</div>}
      {success && <div className="message-box success-box">{success}</div>}
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Restaurant Management
        </button>
      </div>
      {activeTab === 'users' ? (
        <div className="content-box">
          <div className="header-row">
            <h2>Users</h2>
            <button onClick={() => setShowUserForm(!showUserForm)} className="btn btn-primary">
              {showUserForm ? 'Cancel' : 'Add User'}
            </button>
          </div>
          {showUserForm && (
            <form onSubmit={handleUserSubmit} className="form-container">
              <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={userFormData.username}
                    onChange={e => setUserFormData({ ...userFormData, username: e.target.value })}
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={userFormData.email}
                    onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={userFormData.phone_number}
                    onChange={e => setUserFormData({ ...userFormData, phone_number: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Password {editingUser ? '(leave blank to keep)' : '*'}</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={e => setUserFormData({ ...userFormData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update' : 'Create'}
              </button>
            </form>
          )}
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : users.map(u => (
                <tr key={u.user_id}>
                  <td>{u.user_id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phone_number || '-'}</td>
                  <td><span className="role-badge">{u.role}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEditUser(u)} className="btn btn-small btn-edit">Edit</button>
                      <button onClick={() => handleDeleteUser(u.user_id)} className="btn btn-small btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="content-box">
          <div className="header-row">
            <h2>Restaurants</h2>
            <button onClick={() => setShowRestaurantForm(!showRestaurantForm)} className="btn btn-primary">
              {showRestaurantForm ? 'Cancel' : 'Add Restaurant'}
            </button>
          </div>
          {showRestaurantForm && (
            <form onSubmit={handleRestaurantSubmit} className="form-container">
              <h3>{editingRestaurant ? 'Edit Restaurant' : 'Create New Restaurant'}</h3>
              <div className="form-section">
                <h4>Restaurant Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      value={restaurantFormData.name}
                      onChange={e => setRestaurantFormData({ ...restaurantFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <input
                      type="text"
                      value={restaurantFormData.address}
                      onChange={e => setRestaurantFormData({ ...restaurantFormData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              {!editingRestaurant && (
                <div className="form-section">
                  <h4>Owner Account Information</h4>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Owner Username *</label>
                      <input
                        type="text"
                        value={restaurantFormData.owner_username}
                        onChange={e => setRestaurantFormData({ ...restaurantFormData, owner_username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Owner Email *</label>
                      <input
                        type="email"
                        value={restaurantFormData.owner_email}
                        onChange={e => setRestaurantFormData({ ...restaurantFormData, owner_email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Owner Phone</label>
                      <input
                        type="tel"
                        value={restaurantFormData.owner_phone}
                        onChange={e => setRestaurantFormData({ ...restaurantFormData, owner_phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Owner Password *</label>
                      <input
                        type="password"
                        value={restaurantFormData.owner_password}
                        onChange={e => setRestaurantFormData({ ...restaurantFormData, owner_password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Owner Password *</label>
                      <input
                        type="password"
                        value={restaurantFormData.confirm_owner_password}
                        onChange={e => setRestaurantFormData({ ...restaurantFormData, confirm_owner_password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              <button type="submit" className="btn btn-primary">
                {editingRestaurant ? 'Update Restaurant' : 'Create Restaurant & Owner Account'}
              </button>
            </form>
          )}
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRestaurants ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>Loading...</td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center' }}>No restaurants found</td>
                </tr>
              ) : restaurants.map(r => (
                <tr key={r.restaurant_id}>
                  <td style={{ fontWeight: '500' }}>{r.name}</td>
                  <td>{r.address}</td>
                  <td>
                    {r.status ? (
                      <span className="status-badge status-active">Active</span>
                    ) : (
                      <span className="status-badge status-inactive">Inactive</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleEditRestaurant(r)} className="btn btn-small btn-edit">Edit</button>
                      <button onClick={() => handleDeleteRestaurant(r.restaurant_id)} className="btn btn-small btn-delete">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}