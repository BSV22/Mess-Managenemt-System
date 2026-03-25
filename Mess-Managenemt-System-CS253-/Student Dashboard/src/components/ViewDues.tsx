import { useState, useEffect } from 'react';
import { Calendar, IndianRupee, ShoppingBag } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'charge' | 'extra' | 'payment';
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

export function ViewDues() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({
    monthlyCharge: 4500,
    totalExtras: 0,
    totalAmount: 0,
    paidAmount: 0
  });

  useEffect(() => {
    const loadDues = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Settings for globals
        const settingsRes = await fetch(`${API_BASE_URL}/api/settings`);
        const settingsData = await settingsRes.json();
        const bdmrValue = settingsData.data?.bdmrValue || 150;
        const monthlyCharge = settingsData.data?.monthlyCharge || 4500;
        
        // Total Bill summary
        const billRes = await fetch(`${API_BASE_URL}/api/student/bill`, { headers: { Authorization: `Bearer ${token}` } });
        const billData = await billRes.json();
        
        const totalAmount = billData.data?.totalBill || 0;
        const extrasAmount = totalAmount > monthlyCharge ? totalAmount - monthlyCharge : 0;
        
        setSummary({
          monthlyCharge,
          totalExtras: extrasAmount,
          totalAmount,
          paidAmount: 0
        });

        // Transactions list
        const txRes = await fetch(`${API_BASE_URL}/api/student/transactions`, { headers: { Authorization: `Bearer ${token}` } });
        const txData = await txRes.json();
        if (txData.success) {
          setTransactions(txData.data.map((tx: any) => ({
            id: String(tx.transactionId),
            date: tx.date,
            description: tx.type === 'Extra Item' ? 'Extra Item Purchase' : tx.type,
            amount: Number(tx.amount),
            type: Number(tx.amount) < 0 ? 'payment' : tx.type === 'Extra Item' ? 'extra' : 'charge'
          })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDues();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">View Dues & Transactions</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-600">Monthly Charge</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">₹{summary.monthlyCharge}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <ShoppingBag className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-600">Extras Purchased</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">₹{summary.totalExtras}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-gray-100 p-3 rounded-full">
              <IndianRupee className="w-6 h-6 text-gray-700" />
            </div>
            <h3 className="font-semibold text-gray-600">Total Amount</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">₹{summary.totalAmount}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4 pb-3 border-b border-gray-200 text-gray-800">Transaction History</h3>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                transaction.type === 'payment'
                  ? 'bg-green-50 border-green-200'
                  : transaction.type === 'charge'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-orange-50 border-orange-200'
              }`}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{transaction.description}</p>
                <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    transaction.type === 'payment'
                      ? 'text-green-600'
                      : transaction.type === 'charge'
                      ? 'text-blue-600'
                      : 'text-orange-600'
                  }`}
                >
                  {transaction.type === 'payment' ? '' : '+'}₹{Math.abs(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.type === 'payment' ? 'Paid' : transaction.type === 'charge' ? 'Charge' : 'Extra'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Payment Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <span className="text-gray-700">Total Amount Due:</span>
            <span className="font-bold text-lg text-gray-800">₹{summary.totalAmount}</span>
          </div>
          <div className="flex justify-between items-center p-3 border-b border-gray-200">
            <span className="text-gray-700">Amount Paid:</span>
            <span className="font-bold text-lg text-green-600">₹{summary.paidAmount}</span>
          </div>
        </div>
        <button className="w-full mt-6 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
          Pay Now
        </button>
      </div>
    </div>
  );
}