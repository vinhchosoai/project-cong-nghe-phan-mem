import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  const [profile, setProfile] = useState<UserProfile>({
    email: 'customer@example.com',
    fullName: 'Nguyen Van A',
    phone: '0123456789',
    address: '123 Main Street, District 1, HCMC',
    loyaltyPoints: 5400,
    loyaltyTier: 'Gold',
  });

  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    setProfile(formData);
    setEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getLoyaltyColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'from-gray-600 to-gray-800';
      case 'Gold':
        return 'from-yellow-500 to-yellow-700';
      case 'Silver':
        return 'from-gray-300 to-gray-500';
      case 'Bronze':
        return 'from-orange-600 to-orange-800';
      default:
        return 'from-indigo-500 to-indigo-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Personal Profile</h1>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Back
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`lg:col-span-1 bg-gradient-to-br ${getLoyaltyColor(profile.loyaltyTier)} rounded-lg shadow-lg p-6 text-white`}>
            <h2 className="text-sm font-medium opacity-90 mb-2">Member Tier</h2>
            <h3 className="text-4xl font-bold mb-4">{profile.loyaltyTier}</h3>
            <p className="text-sm opacity-90">Loyalty Points</p>
            <p className="text-3xl font-bold mt-1">{profile.loyaltyPoints}</p>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <p className="text-xs opacity-75">Progress to next tier</p>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2 mt-2">
                <div
                  className="bg-white rounded-full h-2"
                  style={{ width: '70%' }}
                ></div>
              </div>
              <p className="text-xs opacity-75 mt-2">1,600 points remaining</p>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            {!editing ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{profile.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-gray-900">{profile.fullName}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-gray-900">{profile.phone}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="mt-1 text-gray-900">{profile.address}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Order from Pizza Palace</p>
                <p className="text-sm text-gray-500">+500 loyalty points</p>
              </div>
              <p className="text-sm text-gray-600">2 days ago</p>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-900">Upgraded to Gold tier</p>
                <p className="text-sm text-gray-500">Promotion successful</p>
              </div>
              <p className="text-sm text-gray-600">1 week ago</p>
            </div>

            <div className="flex justify-between items-center pb-4">
              <div>
                <p className="font-medium text-gray-900">Order from Burger King</p>
                <p className="text-sm text-gray-500">+300 loyalty points</p>
              </div>
              <p className="text-sm text-gray-600">2 weeks ago</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
