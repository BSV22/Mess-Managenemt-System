import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp } from 'lucide-react';

interface Purchase {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export function ExtraBuyingHistory() {
  const [selectedMonth, setSelectedMonth] = useState('2026-03');
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExtraHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Manager token missing. Please log in first.');
          setLoading(false);
          return;
        }

        // Parse selected month to get year and month
        const [year, month] = selectedMonth.split('-');

        const response = await fetch(`${API_BASE_URL}/api/manager/extras/history?year=${year}&month=${month}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setPurchases(data.data);
        } else {
          setError('Failed to load extra buying history');
        }
      } catch (err) {
        setError('Failed to load extra buying history');
        console.error('Extra history fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExtraHistory();
  }, [selectedMonth]);

  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.total), 0);
  const totalTransactions = purchases.length;
  const avgTransactionValue = totalTransactions ? Math.round(totalRevenue / totalTransactions) : 0;

  // Item popularity
  const itemStats = purchases.reduce((acc, purchase) => {
    purchase.items.forEach((item) => {
      if (!acc[item.name]) {
        acc[item.name] = { quantity: 0, revenue: 0 };
      }
      acc[item.name].quantity += Number(item.quantity);
      acc[item.name].revenue += Number(item.price);
    });
    return acc;
  }, {} as Record<string, { quantity: number; revenue: number }>);

  const popularItems = Object.entries(itemStats)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.quantity - a.quantity);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Extra Buying History...</h2>
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
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading History</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Extra Buying History</h2>
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border-2 border-black focus:outline-none"
          >
            <option value="2026-03">March 2026</option>
            <option value="2026-01">January 2026</option>
            <option value="2025-12">December 2025</option>
            <option value="2025-11">November 2025</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-2 border-black p-6">
          <p className="text-sm text-gray-600 mb-2">Total Revenue</p>
          <p className="text-3xl font-bold">₹{totalRevenue.toFixed(2)}</p>
          <div className="flex items-center gap-1 mt-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>+12% from last month</span>
          </div>
        </div>

        <div className="border-2 border-black p-6">
          <p className="text-sm text-gray-600 mb-2">Total Transactions</p>
          <p className="text-3xl font-bold">{totalTransactions}</p>
          <p className="text-sm text-gray-600 mt-2">This month</p>
        </div>

        <div className="border-2 border-black p-6">
          <p className="text-sm text-gray-600 mb-2">Avg. Transaction</p>
          <p className="text-3xl font-bold">₹{avgTransactionValue}</p>
          <p className="text-sm text-gray-600 mt-2">Per purchase</p>
        </div>
      </div>

      {/* Popular Items */}
      <div className="border-2 border-black p-6">
        <h3 className="font-bold mb-4">Most Popular Items</h3>
        <div className="space-y-3">
          {popularItems.map((item, idx) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-300 w-8">{idx + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {item.quantity} sold • ₹{item.revenue.toFixed(2)}
                  </span>
                </div>
                <div className="h-4 bg-gray-200 border border-black">
                  <div
                    className="h-full bg-black"
                    style={{
                      width: `${(item.quantity / popularItems[0].quantity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase History */}
      <div className="border-2 border-black">
        <div className="bg-black text-white px-6 py-3">
          <h3 className="font-bold">Recent Purchases</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold">{purchase.studentName}</h4>
                    <span className="text-sm text-gray-600">({purchase.studentId})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(purchase.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">₹{Number(purchase.total).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                {purchase.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium">₹{Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
