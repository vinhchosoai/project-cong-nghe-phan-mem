import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import axiosInstance from '../lib/axios';
interface StaffInfo {
  username: string;
  email: string;
  role: string;
  restaurantName?: string;
}
export default function StaffDashboard() {
  const router = useRouter();
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStaffInfo = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }
        const response = await axiosInstance.get('/auth/me');
        setStaffInfo(response.data);
      } catch (error) {
        console.error('Failed to fetch staff info:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchStaffInfo();
  }, [router]);
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('tenant_id');
    localStorage.removeItem('guest_orders');
    router.push('/login');
  };
  if (loading) return <div>Loading...</div>;
  return (
    <>
      <Head>
        <title>Staff Portal</title>
      </Head>
      <style jsx>{`
        .page-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f0f2f5;
            font-family: Arial, sans-serif;
        }
        .dashboard-container {
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .dashboard-container h2 {
            margin-bottom: 20px;
            color: #333;
        }
        .user-info {
            margin-bottom: 30px;
            color: #666;
            font-size: 14px;
        }
        .menu-button {
            display: block;
            width: 100%;
            padding: 12px;
            margin-bottom: 10px;
            background-color: #007bff;
            border: none;
            border-radius: 4px;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            text-decoration: none;
            text-align: center;
            transition: background 0.3s;
        }
        .menu-button:hover {
            background-color: #0056b3;
        }
        .btn-logout {
            background-color: #dc3545;
            margin-top: 20px;
        }
        .btn-logout:hover {
            background-color: #c82333;
        }
      `}</style>
      <div className="page-container">
        <div className="dashboard-container">
          <h2>Welcome, {staffInfo?.username}</h2>
          <div className="user-info">
            Role: {staffInfo?.role}
          </div>
          <a href="/staff/service" className="menu-button" onClick={(e) => { e.preventDefault(); router.push('/staff/service'); }}>
            🛎️ Service Dashboard
          </a>
          <a href="/staff/stock" className="menu-button" onClick={(e) => { e.preventDefault(); router.push('/staff/stock'); }}>
            📦 Menu Stock
          </a>
          <button onClick={handleLogout} className="menu-button btn-logout">
            Logout
          </button>
        </div>
      </div>
    </>
  );
}