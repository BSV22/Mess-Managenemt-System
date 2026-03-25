import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Calendar } from 'lucide-react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface ExtraItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  stock: number; // plates left
}

interface PreBookItem {
  dishName: string;
  meal: 'breakfast' | 'lunch' | 'dinner';
  booked: boolean;
}

export function BookExtras() {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [activeSection, setActiveSection] =
    useState<'instant' | 'prebook'>('instant');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ INSTANT PURCHASE ITEMS (fetched from backend)
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);

  // ✅ PRE-BOOK STATE — UNCHANGED
  const [preBookings, setPreBookings] = useState<PreBookItem[]>([
    { dishName: 'Extra Roti (2 pcs)', meal: 'breakfast', booked: false },
    { dishName: 'Paneer Curry', meal: 'breakfast', booked: false },
    { dishName: 'Extra Rice Bowl', meal: 'lunch', booked: false },
    { dishName: 'Paneer Curry', meal: 'lunch', booked: false },
    { dishName: 'Chicken Curry', meal: 'lunch', booked: false },
    { dishName: 'Extra Roti (2 pcs)', meal: 'dinner', booked: false },
    { dishName: 'Egg Curry (2 eggs)', meal: 'dinner', booked: false },
    { dishName: 'Ice Cream', meal: 'dinner', booked: false },
  ]);

  useEffect(() => {
    const fetchExtraItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/student/extras`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Transform backend data to frontend format
          const transformedItems = data.data.map((item: any, index: number) => ({
            id: item.id || `extra-${index}`,
            name: item.itemName || item.name,
            price: item.price || 0,
            category: item.category || 'Main Course', // Default category
            available: item.isAvailable !== false, // Default to true if not specified
            stock: item.stockQuantity || 0
          }));
          setExtraItems(transformedItems);
        } else {
          setError('Failed to load extra items');
        }
      } catch (err) {
        setError('Failed to load extra items');
        console.error('Extra items fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraItems();
  }, []);

  // 🔹 CART + STOCK LOGIC
  const addToCart = (itemId: string) => {
    setExtraItems(prev =>
      prev.map(item =>
        item.id === itemId && item.stock > 0
          ? { ...item, stock: item.stock - 1 }
          : item
      )
    );

    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: string) => {
    setExtraItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, stock: item.stock + 1 } : item
      )
    );

    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) newCart[itemId]--;
      else delete newCart[itemId];
      return newCart;
    });
  };

  const getTotalAmount = () =>
    Object.entries(cart).reduce((total, [id, qty]) => {
      const item = extraItems.find(i => i.id === id);
      return total + (item ? item.price * qty : 0);
    }, 0);

  const handleCheckout = () => {
    if (!Object.keys(cart).length) {
      alert('Your cart is empty!');
      return;
    }
    alert(`Order placed successfully! Total amount: ₹${getTotalAmount()}`);
    setCart({});
  };

  // 🔹 PRE-BOOK LOGIC — UNCHANGED
  const togglePreBooking = (index: number) => {
    setPreBookings(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, booked: !item.booked } : item
      )
    );
  };

  const handlePreBookSubmit = () => {
    const bookedItems = preBookings.filter(item => item.booked);
    if (bookedItems.length === 0) {
      alert('Please select at least one item to pre-book');
      return;
    }
    alert(`Successfully pre-booked ${bookedItems.length} items for tomorrow!`);
    setPreBookings(prev => prev.map(item => ({ ...item, booked: false })));
  };

  const categories = [...new Set(extraItems.map(item => item.category))];
  const breakfastItems = preBookings.filter(item => item.meal === 'breakfast');
  const lunchItems = preBookings.filter(item => item.meal === 'lunch');
  const dinnerItems = preBookings.filter(item => item.meal === 'dinner');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Extra Items...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Extra Items</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Book Extra Items</h2>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 flex gap-2">
        <button
          onClick={() => setActiveSection('instant')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
            activeSection === 'instant'
              ? 'bg-gray-800 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          <ShoppingCart className="w-5 h-5 inline mr-2" />
          Instant Purchase
        </button>
        <button
          onClick={() => setActiveSection('prebook')}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold ${
            activeSection === 'prebook'
              ? 'bg-gray-800 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          <Calendar className="w-5 h-5 inline mr-2" />
          Pre-Book for Tomorrow
        </button>
      </div>

      {/* INSTANT PURCHASE */}
      {activeSection === 'instant' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => (
              <div key={category} className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">{category}</h3>
                {extraItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg mb-3">
                      <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p>₹{item.price}</p>
                        <p className={`text-xs font-medium ${item.stock > 5 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.stock > 0 ? `${item.stock} plates left` : 'Sold Out'}
                        </p>
                      </div>

                      {item.available && item.stock > 0 && (
                        <div className="flex items-center gap-2">
                          {cart[item.id] ? (
                            <>
                              <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 bg-gray-200 rounded-full">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span>{cart[item.id]}</span>
                              <button onClick={() => addToCart(item.id)} className="w-8 h-8 bg-gray-800 text-white rounded-full">
                                <Plus className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => addToCart(item.id)}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* CART */}
          <div className="lg:col-span-1 bg-white border rounded-lg p-6 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold mb-4">Your Cart</h3>
            {Object.keys(cart).length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
              <>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = extraItems.find(i => i.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between text-sm mb-2">
                      <span>{item.name} × {qty}</span>
                      <span>₹{item.price * qty}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-4 font-bold">
                  Total: ₹{getTotalAmount()}
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 bg-gray-800 text-white py-3 rounded-lg"
                >
                  Place Order
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* PRE-BOOK — COMPLETELY ORIGINAL */}
      {activeSection === 'prebook' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Pre-book your extra items for tomorrow.
            </p>
          </div>

          {([['Breakfast', breakfastItems], ['Lunch', lunchItems], ['Dinner', dinnerItems]] as [string, PreBookItem[]][]).map(
            ([title, items]) => (
              <div key={title} className="bg-white border rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                {items.map((item, index) => {
                  const globalIndex = preBookings.findIndex(p => p === item);
                  return (
                    <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-2">
                      <span>{item.dishName}</span>
                      <button
                        onClick={() => togglePreBooking(globalIndex)}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          item.booked
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-800 text-white'
                        }`}
                      >
                        {item.booked ? 'Booked ✓' : 'Book'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          )}

          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <button
              onClick={handlePreBookSubmit}
              className="w-full bg-gray-800 text-white py-4 rounded-lg font-semibold"
            >
              Confirm Pre-bookings for Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
