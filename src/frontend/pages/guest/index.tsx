import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

export default function GuestQRMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tableId = params.get('table_id');
    const restaurantId = params.get('restaurant_id');
    
    if (restaurantId) {
      fetchMenu(restaurantId);
    }
  }, []);

  const fetchMenu = async (restaurantId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/restaurants/${restaurantId}/categories`,
        {
          headers: { 'X-Tenant-ID': localStorage.getItem('tenant_id') || '' }
        }
      );
      const data = await response.json();
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].category_id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.item_id === item.item_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    setCart([...cart]);
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.item_id !== itemId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-0 bg-white border-b z-10 p-4">
          <h1 className="text-2xl font-bold text-gray-900">Menu</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          <div className="lg:col-span-3">
            {loading ? (
              <p>Loading menu...</p>
            ) : (
              <>
                <div className="flex gap-2 mb-6 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.category_id}
                      onClick={() => setSelectedCategory(cat.category_id)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap ${
                        selectedCategory === cat.category_id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <div
                      key={item.item_id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded mb-2"
                        />
                      )}
                      <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600">
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-20 p-6">
              <h2 className="text-xl font-semibold mb-4">Your Order</h2>
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.item_id} className="flex justify-between items-center border-b pb-2">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600 text-sm">${item.price} x {item.quantity}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.item_id)}
                      className="text-red-600 hover:text-red-800 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold mb-4">
                Order Now
              </button>

              {cart.length > 0 && (
                <button className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
