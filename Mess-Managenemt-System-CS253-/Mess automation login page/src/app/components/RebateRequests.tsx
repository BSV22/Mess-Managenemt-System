import { useState, useEffect } from 'react';
import { Check, X, Calendar, User } from 'lucide-react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type RebateStatus = 'pending' | 'approved' | 'rejected';

interface RebateRequestItem {
  requestId: string;
  studentRollNo: string;
  studentName: string;
  studentEmail: string;
  studentRoom: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: RebateStatus;
  createdAt: string;
}

export function RebateRequests() {
  const [requests, setRequests] = useState<RebateRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Manager token missing. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/rebates`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Unable to load rebate requests.');
      }

      const list = data.data.map((item: any) => ({
        requestId: String(item.requestId),
        studentRollNo: item.studentRollNo,
        studentName: item.studentName || item.studentName || 'Unknown',
        studentEmail: item.studentEmail || '',
        studentRoom: item.studentRoom || '',
        startDate: item.startDate,
        endDate: item.endDate,
        reason: item.reason,
        status: String(item.status).toLowerCase() as RebateStatus,
        createdAt: item.createdAt
      }));

      setRequests(list);
    } catch (ex) {
      setError((ex as Error).message || 'Failed to load rebate requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: RebateStatus) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Manager token missing.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/manager/rebate/${id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision: action === 'approved' ? 'Approved' : 'Rejected',
          rebateAmountPerDay: 150
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to process rebate request.');
      }

      setRequests((prev) =>
        prev.map((req) => (req.requestId === id ? { ...req, status: action } : req))
      );
    } catch (err) {
      setError((err as Error).message || 'Action failed.');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-bold">Loading Rebate Requests...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-red-600">
        <h2 className="text-2xl font-bold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Rebate Requests</h2>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-yellow-100 border border-yellow-600">Pending: {pendingRequests.length}</span>
          <span className="px-3 py-1 bg-green-100 border border-green-600">Processed: {processedRequests.length}</span>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="border-2 border-gray-300 p-8 text-center text-gray-500">No pending requests</div>
      ) : (
        <div className="space-y-4">
          {pendingRequests.map((request) => (
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
                    <span>{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium mb-1">Reason:</p>
                    <p className="text-sm text-gray-700">{request.reason}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Requested on: {new Date(request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => handleAction(request.requestId, 'approved')} className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800"> <Check className="w-4 h-4" /> Approve</button>
                <button onClick={() => handleAction(request.requestId, 'rejected')} className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100"> <X className="w-4 h-4" /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {processedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Recently Processed</h3>
          {processedRequests.map((request) => (
            <div key={request.requestId} className="border border-gray-300 p-4 opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{request.studentName}</h4>
                  <p className="text-sm text-gray-600">{request.studentRollNo} - {request.studentRoom}</p>
                </div>
                <span className={`text-xs px-3 py-1 ${request.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-600' : 'bg-red-100 text-red-800 border border-red-600'}`}>{request.status.toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
