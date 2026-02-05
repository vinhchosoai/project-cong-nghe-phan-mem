import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axiosInstance from '../../lib/axios';

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

  // Tabs
  const [activeTab, setActiveTab] = useState<'users' | 'restaurants'>('users');

  // User Management State
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: '',
  });

  // Restaurant Management State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);

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
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setLoadingRestaurants(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    router.push('/login');
  };

  const handleResetForm = () => {
    setFormData({
      username: '',
      email: '',
      phone_number: '',
      password: '',
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleEdit = (selectedUser: User) => {
    setEditingUser(selectedUser);
    setFormData({
      username: selectedUser.username,
      email: selectedUser.email,
      phone_number: selectedUser.phone_number || '',
      password: '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const submitData: any = {
        username: formData.username,
        email: formData.email,
        phone_number: formData.phone_number || null,
      };

      if (editingUser) {
        if (formData.password) submitData.password = formData.password;
        await axiosInstance.put(`/admin/users/${editingUser.user_id}`, submitData);
        setSuccess('User updated successfully');
      } else {
        submitData.password = formData.password;
        await axiosInstance.post('/admin/users', submitData);
        setSuccess('User created successfully');
      }

      handleResetForm();
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleDelete = async (userId: string) => {
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

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <h1 className="text-2xl font-bold text-indigo-600 flex items-center">S2O Admin</h1>
            <div className="flex items-center gap-4">
              <span>Hello, {user?.username}</span>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
        {success && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{success}</div>}

        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'users' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`py-4 px-6 font-medium ${activeTab === 'restaurants' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurant Management
          </button>
        </div>

        {activeTab === 'users' ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Users</h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                {showForm ? 'Cancel' : 'Add User'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{editingUser ? 'Edit User' : 'Create New User'}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.phone_number}
                      onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password {editingUser ? '(leave blank to keep)' : '*'}</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border rounded-lg"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
                    {editingUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Username</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingUsers ? (
                    <tr><td colSpan={6} className="text-center py-4">Loading...</td></tr>
                  ) : users.map(u => (
                    <tr key={u.user_id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4">{u.user_id}</td>
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">{u.phone_number || '-'}</td>
                      <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{u.role}</span></td>
                      <td className="px-6 py-4 space-x-2">
                        <button onClick={() => handleEdit(u)} className="text-blue-600 hover:underline">Edit</button>
                        <button onClick={() => handleDelete(u.user_id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">Restaurants List</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRestaurants ? (
                    <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                  ) : restaurants.map(r => (
                    <tr key={r.restaurant_id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{r.name}</td>
                      <td className="px-6 py-4">{r.address}</td>
                      <td className="px-6 py-4">
                        {r.status ? <span className="text-green-600 font-bold">Active</span> : <span className="text-red-600">Inactive</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleDeleteRestaurant(r.restaurant_id)} className="text-red-600 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!loadingRestaurants && restaurants.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-4">No restaurants found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
const router = useRouter();
const [user, setUser] = useState<any>(null);
const [loading, setLoading] = useState(true);
const [users, setUsers] = useState<User[]>([]);
const [showForm, setShowForm] = useState(false);
const [editingUser, setEditingUser] = useState<User | null>(null);
const [formData, setFormData] = useState({
  username: '',
  email: '',
  phone_number: '',
  password: '',
});
const [loadingUsers, setLoadingUsers] = useState(false);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');

// Restaurant Management State
const [activeTab, setActiveTab] = useState<'users' | 'restaurants'>('users');
const [restaurants, setRestaurants] = useState<any[]>([]);
const [loadingRestaurants, setLoadingRestaurants] = useState(false);

const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : '';

useEffect(() => {
  const fetchUser = async () => {
    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        router.push('/login');
        return;
      }

      const response = await axiosInstance.get('/auth/me');

      // Check if user is admin
      if (response.data.role !== 'admin') {
        router.push('/');
        return;
      }

      setUser(response.data);
      await fetchUsers();
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      router.push('/login');
    }
  };

  fetchUser();
}, [router]);

// Effect for fetching restaurants when tab changes
useEffect(() => {
  if (activeTab === 'restaurants' && restaurants.length === 0) {
    fetchRestaurants();
  }
}, [activeTab]);

const fetchRestaurants = async () => {
  try {
    setLoadingRestaurants(true);
    const response = await axiosInstance.get('/admin/users/restaurants');
    setRestaurants(response.data);
  } catch (error) {
    console.error('Failed to fetch restaurants:', error);
    setError('Failed to load restaurants');
  } finally {
    setLoadingRestaurants(false);
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

const fetchUsers = async () => {
  try {
    setLoadingUsers(true);
    const response = await axiosInstance.get('/admin/users');
    setUsers(response.data);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    setError('Failed to load users');
  } finally {
    setLoadingUsers(false);
  }
};

const handleLogout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  router.push('/login');
};

const handleResetForm = () => {
  setFormData({
    username: '',
    email: '',
    phone_number: '',
    password: '',
  });
  setEditingUser(null);
  setShowForm(false);
};

const handleEdit = (selectedUser: User) => {
  setEditingUser(selectedUser);
  setFormData({
    username: selectedUser.username,
    email: selectedUser.email,
    phone_number: selectedUser.phone_number || '',
    password: '',
  });
  setShowForm(true);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    const submitData: any = {
      username: formData.username,
      email: formData.email,
      phone_number: formData.phone_number || null,
    };

    if (editingUser) {
      // Update user
      if (formData.password) {
        submitData.password = formData.password;
      }
      await axiosInstance.put(
        `/admin/users/${editingUser.user_id}`,
        submitData
      );
      setSuccess('User updated successfully');
    } else {
      // Create new user
      submitData.password = formData.password;
      await axiosInstance.post(
        '/admin/users',
        submitData
      );
      setSuccess('User created successfully');
    }

    handleResetForm();
    await fetchUsers();
  } catch (err: any) {
    setError(err.response?.data?.detail || 'Operation failed');
  }
};

const handleDelete = async (userId: string) => {
  if (!confirm('Are you sure you want to delete this user?')) return;

  try {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return;

    await axiosInstance.delete(`/admin/users/${userId}`);
    setSuccess('User deleted successfully');
    await fetchUsers();
  } catch (err: any) {
    setError(err.response?.data?.detail || 'Failed to delete user');
  }
};

if (loading) return <div className="text-center py-8">Đang tải...</div>;



// Main Render
return (
  <div className="min-h-screen bg-gray-50">
    {/* Nav ... same */}
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center">S2O Admin</h1>
          <div className="flex items-center gap-4">
            <span>Hello, {user?.username}</span>
            <button onClick={handleLogout} className="text-red-600 font-medium">Logout</button>
          </div>
        </div>
      </div>
    </nav>

    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`py-4 px-6 font-medium ${activeTab === 'users' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('users')}
        >
          Quản lý người dùng
        </button>
        <button
          className={`py-4 px-6 font-medium ${activeTab === 'restaurants' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Quản lý nhà hàng
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              {showForm ? 'Hủy' : 'Thêm người dùng'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {editingUser ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên người dùng *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Nhập tên người dùng"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                    disabled={editingUser ? true : false}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu {editingUser ? '(để trống nếu không đổi)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required={!editingUser}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded"
                >
                  {editingUser ? 'Cập nhật' : 'Tạo'}
                </button>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên người dùng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Đang tải...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Không có người dùng nào
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.user_id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{u.user_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{u.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{u.phone_number || '-'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(u.user_id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6">Danh sách Nhà hàng</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tên</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Địa chỉ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loadingRestaurants ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">Đang tải...</td></tr>
                ) : restaurants.map(r => (
                  <tr key={r.restaurant_id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{r.name}</td>
                    <td className="px-6 py-4">{r.address}</td>
                    <td className="px-6 py-4">
                      {r.status ? <span className="text-green-600 font-bold">Hoạt động</span> : <span className="text-red-600">Ngừng hoạt động</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteRestaurant(r.restaurant_id)} className="text-red-600 hover:underline">Xóa</button>
                    </td>
                  </tr>
                ))}
                {!loadingRestaurants && restaurants.length === 0 && (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-500">Không có nhà hàng nào</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  </div>
);
}
