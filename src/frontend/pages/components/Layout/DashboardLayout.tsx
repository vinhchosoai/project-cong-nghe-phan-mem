import { useRouter } from 'next/router';
import { ReactNode } from 'react';
interface DashboardLayoutProps {
    title: string;
    userRole: string;
    children: ReactNode;
}
export default function DashboardLayout({ title, userRole, children }: DashboardLayoutProps) {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('tenant_id');
        localStorage.removeItem('guest_orders');
        router.push('/login');
    };
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            {}
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div>
                        <h1 style={{ margin: 0, color: '#333', fontSize: '24px' }}>{title}</h1>
                        <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>{userRole}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#dc3545',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer'
                        }}
                        onMouseOver={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#c82333'}
                        onMouseOut={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc3545'}
                    >
                        Logout
                    </button>
                </div>
            </div>
            {}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                {children}
            </div>
        </div>
    );
}