import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Calendar } from 'lucide-react';

interface ExtraItem {
  itemId: number;
  itemName: string;
  price: number;
  stockQuantity: number;
  isAvailable: boolean;
}


export function BookExtras() {
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [activeSection, setActiveSection] = useState<'instant' | 'prebook'>('instant');
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExtraItems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/student/extras', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setExtraItems(data.data);
        }
      } catch (error) {
        console.error('Error fetching extra items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraItems();
  }, []);



  // 🔹 CART + STOCK LOGIC
  const addToCart = (itemId: number) => {
    setExtraItems(prev =>
      prev.map(item =>
        item.itemId === itemId && item.stockQuantity > 0
          ? { ...item, stockQuantity: item.stockQuantity - 1 }
          : item
      )
    );

    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const removeFromCart = (itemId: number) => {
    setExtraItems(prev =>
      prev.map(item =>
        item.itemId === itemId ? { ...item, stockQuantity: item.stockQuantity + 1 } : item
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
      const item = extraItems.find(i => i.itemId === parseInt(id));
      return total + (item ? item.price * qty : 0);
    }, 0);

  const handleCheckout = async () => {
    if (!Object.keys(cart).length) {
      alert('Your cart is empty!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in first');
        return;
      }

      // Process each item in cart
      for (const [itemId, quantity] of Object.entries(cart)) {
        const response = await fetch('http://localhost:3000/api/student/extras/buy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            extraItemId: parseInt(itemId),
            quantityToBuy: quantity
          })
        });

        const data = await response.json();
        if (!data.success) {
          alert(`Error purchasing ${itemId}: ${data.message}`);
          return;
        }
      }

      alert(`Order placed successfully! Total amount: ₹${getTotalAmount()}`);
      setCart({});
      // Refresh items
      window.location.reload();
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Network error during checkout');
    }
  };



  const categories = ['Main Course', 'Dessert', 'Beverage', 'Other']; // Simplified categories

  const getCategory = (itemName: string) => {
    if (itemName.toLowerCase().includes('curry') || itemName.toLowerCase().includes('rice') || itemName.toLowerCase().includes('roti')) return 'Main Course';
    if (itemName.toLowerCase().includes('ice cream') || itemName.toLowerCase().includes('sweet')) return 'Dessert';
    if (itemName.toLowerCase().includes('drink') || itemName.toLowerCase().includes('juice') || itemName.toLowerCase().includes('coffee') || itemName.toLowerCase().includes('tea')) return 'Beverage';
    return 'Other';
  };



  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading extra items...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Book Extra Items</h2>
      </div>

      {/* INSTANT PURCHASE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => {
              const categoryItems = extraItems.filter(item => getCategory(item.itemName) === category);
              if (categoryItems.length === 0) return null;
              return (
                <div key={category} className="bg-white border rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">{category}</h3>
                  {categoryItems.map(item => (
                    <div key={item.itemId} className="flex justify-between items-center p-4 border rounded-lg mb-3">
                      <div>
                        <h4 className="font-semibold">{item.itemName}</h4>
                        <p>₹{item.price}</p>
                        <p className={`text-xs font-medium ${item.stockQuantity > 5 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.stockQuantity > 0 ? `${item.stockQuantity} plates left` : 'Sold Out'}
                        </p>
                      </div>

                      {item.isAvailable && item.stockQuantity > 0 && (
                        <div className="flex items-center gap-2">
                          {cart[item.itemId] ? (
                            <>
                              <button onClick={() => removeFromCart(item.itemId)} className="w-8 h-8 bg-gray-200 rounded-full">
                                <Minus className="w-4 h-4" />
                              </button>
                              <span>{cart[item.itemId]}</span>
                              <button onClick={() => addToCart(item.itemId)} className="w-8 h-8 bg-gray-800 text-white rounded-full">
                                <Plus className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => addToCart(item.itemId)}
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
              );
            })}
          </div>

          {/* CART */}
          <div className="lg:col-span-1 bg-white border rounded-lg p-6 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold mb-4">Your Cart</h3>
            {Object.keys(cart).length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
              <>
                {Object.entries(cart).map(([id, qty]) => {
                  const item = extraItems.find(i => i.itemId === parseInt(id));
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between text-sm mb-2">
                      <span>{item.itemName} × {qty}</span>
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
    </div>
  );
}
