import { useState, useEffect } from 'react';
import { Check, X, User, Mail, Phone } from 'lucide-react';

interface PersonRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  room: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function NewPersonRequests() {
  const [requests, setRequests] = useState<PersonRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/manager/new-person-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          // Transform backend data to frontend format
          const transformedRequests = data.data.map((request: any) => ({
            id: request.id,
            name: request.name,
            email: request.email,
            phone: request.phone,
            rollNumber: request.rollNumber,
            room: request.room || 'N/A',
            requestDate: request.createdAt ? new Date(request.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            status: request.status.toLowerCase()
          }));
          setRequests(transformedRequests);
        } else {
          setError('Failed to load new person requests');
        }
      } catch (err) {
        setError('Failed to load new person requests');
        console.error('New person requests fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/manager/new-person-request/${id}`, {
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
          prev.map((req) => (req.id === id ? { ...req, status: action } : req))
        );
        alert(`New person request ${action} successfully!`);
      } else {
        alert('Failed to update request status');
      }
    } catch (err) {
      alert('Failed to update request status');
      console.error('Request status update error:', err);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const processedRequests = requests.filter((r) => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading new person requests...</div>
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
        <h2 className="text-2xl font-bold">New Person Requests</h2>
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
        <h3 className="text-lg font-bold">Pending Approval</h3>
        {pendingRequests.length === 0 ? (
          <div className="border-2 border-gray-300 p-8 text-center text-gray-500">
            No pending requests
          </div>
        ) : (
          pendingRequests.map((request) => (
            <div key={request.id} className="border-2 border-black p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5" />
                    <h4 className="font-bold text-lg">{request.name}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span>{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span>{request.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Roll Number:</span>
                    <span className="font-medium">{request.rollNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{request.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request Date:</span>
                    <span className="font-medium">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleAction(request.id, 'approved')}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve & Add to System
                </button>
                <button
                  onClick={() => handleAction(request.id, 'rejected')}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
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
      {processedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Recently Processed</h3>
          {processedRequests.map((request) => (
            <div key={request.id} className="border border-gray-300 p-4 opacity-75">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{request.name}</h4>
                  <p className="text-sm text-gray-600">{request.rollNumber} - {request.room}</p>
                </div>
                <span
                  className={`text-xs px-3 py-1 ${
                    request.status === 'approved'
                      ? 'bg-green-100 text-green-800 border border-green-600'
                      : 'bg-red-100 text-red-800 border border-red-600'
                  }`}
                >
                  {request.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
