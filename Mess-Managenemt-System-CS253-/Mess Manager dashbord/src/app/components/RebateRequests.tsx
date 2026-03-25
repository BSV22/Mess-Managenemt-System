import { useState, useEffect } from 'react';
import { Check, X, Calendar, User } from 'lucide-react';

interface RebateRequest {
  requestId: string;
  studentRollNo: string;
  studentName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function RebateRequests() {
  const [requests, setRequests] = useState<RebateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRebateRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/manager/rebates', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Transform backend data to frontend format
          const transformedRequests = data.data.map((request: any) => ({
            requestId: request.id,
            studentRollNo: request.studentRollNo,
            studentName: request.student ? request.student.name : 'Unknown Student',
            startDate: request.startDate,
            endDate: request.endDate,
            reason: request.reason,
            status: request.status.toLowerCase(),
            createdAt: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
          }));
          setRequests(transformedRequests);
        } else {
          setError('Failed to load rebate requests');
        }
      } catch (err) {
        setError('Failed to load rebate requests');
        console.error('Rebate requests fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRebateRequests();
  }, []);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/manager/rebate/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: action })
      });

      const data = await response.json();

      if (data.success) {
        setRequests((prev) =>
          prev.map((req) =>
            req.requestId === requestId ? { ...req, status: action } : req
          )
        );
        alert(`Rebate request ${action} successfully!`);
      } else {
        alert('Failed to update rebate request');
      }
    } catch (err) {
      alert('Failed to update rebate request');
      console.error('Rebate update error:', err);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading rebate requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rebate Requests</h2>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-yellow-100 border border-yellow-600">
            Pending: {pendingRequests.length}
          </span>
          <span className="px-3 py-1 bg-green-100 border border-green-600">
            Processed: {processedRequests.length}
          </span>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Pending Requests</h3>
        {pendingRequests.length === 0 ? (
          <div className="border-2 border-gray-300 p-8 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.requestId} className="border-2 border-black p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5" />
                    <h4 className="font-bold">{request.studentName}</h4>
                    <span className="text-sm text-gray-600">({request.studentRollNo})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </span>
                    <span className="ml-2 text-xs">
                      ({Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Reason:</p>
                    <p className="text-sm text-gray-700">{request.reason}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Requested on: {request.createdAt}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAction(request.requestId, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction(request.requestId, 'rejected')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Processed Requests */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Processed Requests</h3>
        {processedRequests.length === 0 ? (
          <div className="border-2 border-gray-300 p-8 text-center text-gray-500">
            No processed requests
          </div>
        ) : (
          processedRequests.map((request) => (
            <div key={request.requestId} className="border-2 border-gray-300 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5" />
                    <h4 className="font-bold">{request.studentName}</h4>
                    <span className="text-sm text-gray-600">({request.studentRollNo})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </span>
                    <span className="ml-2 text-xs">
                      ({Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Reason:</p>
                    <p className="text-sm text-gray-700">{request.reason}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Requested on: {request.createdAt}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
