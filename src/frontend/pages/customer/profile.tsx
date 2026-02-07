import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '../../lib/axios';
interface UserProfile {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  loyaltyPoints: number;
  loyaltyTier: string;
}
export default function CustomerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await axiosInstance.get('/auth/me');
        const userData = response.data;
        if (userData.role !== 'customer') {
          router.push('/');
          return;
        }
        const userProfile: UserProfile = {
          email: userData.email || '',
          fullName: userData.username || '',
          phone: userData.phone_number || '',
          address: userData.address || '',
          loyaltyPoints: userData.current_points || 0,
          loyaltyTier: userData.current_points >= 10000 ? 'Platinum' :
            userData.current_points >= 5000 ? 'Gold' :
              userData.current_points >= 2000 ? 'Silver' : 'Bronze',
        };
        setProfile(userProfile);
        setFormData(userProfile);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        router.push('/login');
      }
    };
    fetchUserProfile();
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('guest_orders');
    router.push('/login');
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formData) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleSave = () => {
    if (formData) {
      setProfile(formData);
      setEditing(false);
    }
  };
  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };
  const getTierColor = (tier: string) => {
    const colors = {
      Platinum: '#6c757d',
      Gold: '#ffc107',
      Silver: '#c0c0c0',
      Bronze: '#cd7f32',
    };
    return colors[tier as keyof typeof colors] || '#007bff';
  };
  if (loading || !profile || !formData) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {}
      <div style={{ backgroundColor: '#fff', padding: '20px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>Personal Profile</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => router.push('/customer/orders')} style={{ padding: '10px 20px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}>Orders</button>
            <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}>Logout</button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px 30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
          {}
          <div style={{
            backgroundColor: getTierColor(profile.loyaltyTier),
            borderRadius: '8px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            padding: '30px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '14px', opacity: 0.9 }}>Member Tier</h2>
            <h3 style={{ margin: '0 0 30px 0', fontSize: '32px', fontWeight: 'bold' }}>{profile.loyaltyTier}</h3>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', opacity: 0.9 }}>Loyalty Points</p>
            <p style={{ margin: '0 0 30px 0', fontSize: '28px', fontWeight: 'bold' }}>{profile.loyaltyPoints}</p>
            <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.3)' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '11px', opacity: 0.8 }}>Progress to next tier</p>
              <div style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: '70%', backgroundColor: '#fff', height: '100%' }}></div>
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '11px', opacity: 0.8 }}>1,600 points remaining</p>
            </div>
          </div>
          {}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
                {editing ? 'Edit Profile' : 'Personal Information'}
              </h2>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{ padding: '8px 20px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                  Edit
                </button>
              )}
            </div>
            {!editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Email</label>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{profile.email}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Full Name</label>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{profile.fullName}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Phone Number</label>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{profile.phone}</p>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '5px' }}>Address</label>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{profile.address}</p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} disabled style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
                  <button onClick={handleSave} style={{ flex: 1, padding: '10px', backgroundColor: '#007bff', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007bff'}>
                    Save
                  </button>
                  <button onClick={handleCancel} style={{ flex: 1, padding: '10px', backgroundColor: '#6c757d', border: 'none', borderRadius: '4px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5a6268'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6c757d'}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', padding: '30px' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 'bold' }}>Recent Activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ paddingBottom: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}