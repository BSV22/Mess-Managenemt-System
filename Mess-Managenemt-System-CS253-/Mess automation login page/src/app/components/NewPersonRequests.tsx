import { useState, useEffect } from 'react';
import { Check, X, User, Mail, Phone } from 'lucide-react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface PersonRequest {
  rollNo: string;
  name: string;
  email: string;
  phone?: string;
  roomNo: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function NewPersonRequests() {
  const [requests, setRequests] = useState<PersonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPending = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Manager token missing.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/students/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Unable to load pending students');

      const normalized: PersonRequest[] = data.data.map((student: any) => ({
        rollNo: student.rollNo,
        name: student.name,
        email: student.email,
        phone: student.phone || 'N/A',
        roomNo: student.roomNo || 'N/A',
        requestDate: student.createdAt || new Date().toISOString(),
        status: 'pending'
      }));

      setRequests(normalized);
    } catch (err) {
      setError((err as Error).message || 'Failed to fetch pending requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (rollNo: string, action: 'approved' | 'rejected') => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Manager token missing.');
      return;
    }

    if (action === 'approved') {
      try {
        const res = await fetch(`${API_BASE_URL}/api/manager/student/approve`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rollNo })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Approve failed');

        setRequests((prev) => prev.filter((r) => r.rollNo !== rollNo));
      } catch (err) {
        setError((err as Error).message || 'Approve request failed.');
      }
    } else {
      setRequests((prev) =>
        prev.map((r) => (r.rollNo === rollNo ? { ...r, status: 'rejected' } : r))
      );
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-lg">Loading pending student requests...</div>;
  }

  if (error) {
    return <div className="py-16 text-center text-red-600">{error}</div>;
  }

  const pending = requests.filter((r) => r.status === 'pending');
  const processed = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">New Person Requests</h2>
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-yellow-100 border border-yellow-600">Pending: {pending.length}</span>
          <span className="px-3 py-1 bg-green-100 border border-green-600">Processed: {processed.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {pending.length === 0 ? (
          <div className="border-2 border-gray-300 p-8 text-center text-gray-500">No pending requests</div>
        ) : (
          pending.map((request) => (
            <div key={request.rollNo} className="border-2 border-black p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5" />
                    <h4 className="font-bold text-lg">{request.name}</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-600" /><span>{request.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-600" /><span>{request.phone}</span></div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Roll Number:</span><span className="font-medium">{request.rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Room:</span><span className="font-medium">{request.roomNo}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Request Date:</span><span className="font-medium">{new Date(request.requestDate).toLocaleDateString()}</span></div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button onClick={() => handleAction(request.rollNo, 'approved')} className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800"><Check className="w-4 h-4" /> Approve & Add</button>
                <button onClick={() => handleAction(request.rollNo, 'rejected')} className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100"><X className="w-4 h-4" /> Reject</button>
              </div>
            </div>
          ))
        )}
      </div>

      {processed.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Processed Requests</h3>
          {processed.map((request) => (
            <div key={request.rollNo} className="border border-gray-300 p-4 opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{request.name}</h4>
                  <p className="text-sm text-gray-600">{request.rollNo} - {request.roomNo}</p>
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
