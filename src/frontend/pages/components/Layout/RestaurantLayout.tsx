import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import Link from 'next/link';
interface RestaurantLayoutProps {
    children: ReactNode;
}
export default function RestaurantLayout({ children }: RestaurantLayoutProps) {
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div>
                            <Link href="/restaurant" style={{ textDecoration: 'none' }}>
                                <h1 style={{ margin: 0, color: '#333', fontSize: '24px', cursor: 'pointer' }}>Restaurant Dashboard</h1>
                            </Link>
                            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>Restaurant Owner</p>
                        </div>
                        <nav style={{ display: 'flex', gap: '15px' }}>
                            <Link href="/restaurant/menu-manager" style={{ textDecoration: 'none', color: '#007bff' }}>Menu</Link>
                            <Link href="/restaurant/inventory" style={{ textDecoration: 'none', color: '#007bff' }}>Inventory</Link>
                            <Link href="/restaurant/staff" style={{ textDecoration: 'none', color: '#007bff' }}>Staff</Link>
                        </nav>
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