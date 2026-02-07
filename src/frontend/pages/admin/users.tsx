import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
import DashboardLayout from '../components/Layout/DashboardLayout';
interface User {
  user_id: string;
  email: string;
  full_name: string;
  role: string;
}
export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auth/register', formData);
      setFormData({ email: '', password: '', full_name: '' });
      setShowForm(false);
      alert('User added successfully');
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user');
    }
  };
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }
  return (
    <DashboardLayout title="User Management" userRole="Admin">
      <style jsx>{`
        .page-header {
          margin-bottom: 25px;
        }
        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .btn-primary {
          background-color: #007bff;
          color: #fff;
        }
        .btn-primary:hover {
          background-color: #0056b3;
        }
        .form-card {
          background-color: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 25px;
        }
        .form-card h2 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
          font-size: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          color: #495057;
          font-weight: 500;
        }
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .table-card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
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
          font-size: 12px;
          text-transform: uppercase;
        }
        table td {
          font-size: 14px;
          color: #212529;
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
        .btn-edit {
          color: #007bff;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          padding: 0;
          margin-right: 15px;
        }
        .btn-edit:hover {
          text-decoration: underline;
        }
        .btn-delete {
          color: #dc3545;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          padding: 0;
        }
        .btn-delete:hover {
          text-decoration: underline;
        }
      `}</style>
      <div className="page-header">
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ Add New User'}
        </button>
      </div>
      {showForm && (
        <div className="form-card">
          <h2>Add New User</h2>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add User
            </button>
          </form>
        </div>
      )}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Admin User</td>
              <td>admin@example.com</td>
              <td>
                <span className="role-badge">Admin</span>
              </td>
              <td>
                <button className="btn-edit">Edit</button>
                <button className="btn-delete">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}