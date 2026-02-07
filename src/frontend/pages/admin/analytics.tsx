import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../components/Layout/DashboardLayout';
export default function AdminAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }
  return (
    <DashboardLayout title="Analytics & Reports" userRole="Admin">
      <style jsx>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .metric-card {
          background-color: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .metric-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .metric-value {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .metric-value.blue { color: #007bff; }
        .metric-value.green { color: #28a745; }
        .metric-value.purple { color: #6f42c1; }
        .metric-value.orange { color: #fd7e14; }
        .metric-subtitle {
          font-size: 12px;
          color: #999;
        }
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .chart-card {
          background-color: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .chart-card h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }
        .chart-placeholder {
          background-color: #f8f9fa;
          border-radius: 8px;
          height: 250px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          border: 1px solid #dee2e6;
        }
        .progress-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .progress-label {
          color: #666;
          font-size: 14px;
        }
        .progress-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .progress-bar-container {
          width: 100px;
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          border-radius: 4px;
        }
        .progress-bar.green { background-color: #28a745; }
        .progress-bar.yellow { background-color: #ffc107; }
        .progress-bar.orange { background-color: #fd7e14; }
        .progress-value {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          min-width: 40px;
          text-align: right;
        }
        .table-card {
          background-color: #fff;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .table-card h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
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
          color: #666;
        }
        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div className="metrics-grid">
        <div className="metric-card">
          <p className="metric-label">Total Revenue</p>
          <p className="metric-value blue">--</p>
          <p className="metric-subtitle">This month</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Orders</p>
          <p className="metric-value green">--</p>
          <p className="metric-subtitle">This month</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Customers</p>
          <p className="metric-value purple">--</p>
          <p className="metric-subtitle">All time</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Total Restaurants</p>
          <p className="metric-value orange">--</p>
          <p className="metric-subtitle">Active</p>
        </div>
      </div>
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Monthly Revenue</h2>
          <div className="chart-placeholder">
            Revenue chart (connect data)
          </div>
        </div>
        <div className="chart-card">
          <h2>Orders by Status</h2>
          <div style={{ paddingTop: '20px' }}>
            <div className="progress-item">
              <span className="progress-label">Completed</span>
              <div className="progress-right">
                <div className="progress-bar-container">
                  <div className="progress-bar green" style={{ width: '75%' }}></div>
                </div>
                <span className="progress-value">75%</span>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">Preparing</span>
              <div className="progress-right">
                <div className="progress-bar-container">
                  <div className="progress-bar yellow" style={{ width: '15%' }}></div>
                </div>
                <span className="progress-value">15%</span>
              </div>
            </div>
            <div className="progress-item">
              <span className="progress-label">Pending</span>
              <div className="progress-right">
                <div className="progress-bar-container">
                  <div className="progress-bar orange" style={{ width: '10%' }}></div>
                </div>
                <span className="progress-value">10%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="table-card">
        <h2>Top Restaurants</h2>
        <table>
          <thead>
            <tr>
              <th>Restaurant Name</th>
              <th>Revenue</th>
              <th>Orders</th>
              <th>Customers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} style={{ textAlign: 'center' }}>
                No data
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}