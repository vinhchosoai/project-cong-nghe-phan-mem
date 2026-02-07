import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/Layout/DashboardLayout';
interface SettingsForm {
  appName: string;
  appDescription: string;
  adminEmail: string;
  maxRestaurants: number;
  maxUsersPerRestaurant: number;
  enableNotifications: boolean;
  enableAnalytics: boolean;
}
export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState<SettingsForm>({
    appName: 'S2O Smart Restaurant',
    appDescription: 'Smart Restaurant Management Platform',
    adminEmail: 'admin@example.com',
    maxRestaurants: 100,
    maxUsersPerRestaurant: 50,
    enableNotifications: true,
    enableAnalytics: true,
  });
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setSettings({
        ...settings,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === 'number') {
      setSettings({
        ...settings,
        [name]: parseInt(value, 10),
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }
  return (
    <DashboardLayout title="System Settings" userRole="Admin">
      <style jsx>{`
        .message {
          padding: 12px;
          margin-bottom: 20px;
          border-radius: 4px;
          font-size: 14px;
        }
        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .form-card {
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 25px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          color: #495057;
          font-weight: 500;
        }
        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="number"],
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .form-group textarea {
          resize: vertical;
          font-family: Arial, sans-serif;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .checkbox-group {
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
        }
        .checkbox-group h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #333;
        }
        .checkbox-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        .checkbox-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-right: 10px;
          cursor: pointer;
        }
        .checkbox-item label {
          margin: 0;
          cursor: pointer;
          color: #495057;
        }
        .button-group {
          display: flex;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
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
        .btn-primary:hover:not(:disabled) {
          background-color: #0056b3;
        }
        .btn-primary:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        .btn-secondary {
          background-color: #6c757d;
          color: #fff;
        }
        .btn-secondary:hover {
          background-color: #5a6268;
        }
        .info-card {
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .info-card h2 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #333;
        }
        .info-item {
          margin-bottom: 10px;
          color: #666;
          font-size: 14px;
        }
        .info-item strong {
          color: #333;
        }
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label>Application Name</label>
          <input
            type="text"
            name="appName"
            value={settings.appName}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Application Description</label>
          <textarea
            name="appDescription"
            value={settings.appDescription}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Admin Email</label>
          <input
            type="email"
            name="adminEmail"
            value={settings.adminEmail}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Max Restaurants</label>
            <input
              type="number"
              name="maxRestaurants"
              value={settings.maxRestaurants}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Max Users per Restaurant</label>
            <input
              type="number"
              name="maxUsersPerRestaurant"
              value={settings.maxUsersPerRestaurant}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="checkbox-group">
          <h3>Features</h3>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="enableNotifications"
              name="enableNotifications"
              checked={settings.enableNotifications}
              onChange={handleChange}
            />
            <label htmlFor="enableNotifications">Enable Notifications</label>
          </div>
          <div className="checkbox-item">
            <input
              type="checkbox"
              id="enableAnalytics"
              name="enableAnalytics"
              checked={settings.enableAnalytics}
              onChange={handleChange}
            />
            <label htmlFor="enableAnalytics">Enable Analytics</label>
          </div>
        </div>
        <div className="button-group">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
      <div className="info-card">
        <h2>System Information</h2>
        <p className="info-item"><strong>Version:</strong> 1.0.0</p>
        <p className="info-item"><strong>Environment:</strong> Production</p>
        <p className="info-item"><strong>Database:</strong> PostgreSQL</p>
        <p className="info-item"><strong>Cache:</strong> Redis</p>
      </div>
    </DashboardLayout>
  );
}