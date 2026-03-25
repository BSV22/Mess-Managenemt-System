import { useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

interface RebateRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
}

export function RequestRebate() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Mock previous rebate requests
  const [previousRequests, setPreviousRequests] = useState<RebateRequest[]>([
    {
      id: '1',
      startDate: '2026-01-10',
      endDate: '2026-01-15',
      reason: 'Going home for family event',
      status: 'approved',
      submittedDate: '2026-01-05'
    },
    {
      id: '2',
      startDate: '2025-12-20',
      endDate: '2025-12-31',
      reason: 'Winter break',
      status: 'approved',
      submittedDate: '2025-12-15'
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      alert('End date cannot be before start date');
      return;
    }

    if (!reason.trim()) {
      alert('Please provide a reason for the rebate request');
      return;
    }

    // Calculate days
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    alert(`Rebate request submitted successfully!\nDuration: ${days} day(s)\nYour request will be reviewed by the mess manager.`);
    
    // Reset form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Request Mess Rebate</h2>
        <p className="text-sm mt-2 text-gray-600">
          Request a rebate for days when you won't be eating at the mess
        </p>
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-2">Important Information:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Rebate requests must be submitted at least 2 days in advance</li>
            <li>You will receive a refund based on the BDMR (Base Daily Mess Rate)</li>
            <li>Approval is subject to mess manager's discretion</li>
            <li>Once approved, the rebate amount will be credited to your account</li>
          </ul>
        </div>
      </div>

      {/* Request Form */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          New Rebate Request
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={getTodayDate()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || getTodayDate()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800"
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          {startDate && endDate && new Date(endDate) >= new Date(startDate) && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Duration:</strong>{' '}
                {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
              </p>
              <p className="text-sm text-green-800 mt-1">
                <strong>Estimated Rebate:</strong> ₹
                {(Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1) * 70}
                {' '}(based on BDMR)
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Reason for Rebate
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for your rebate request..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 resize-none"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Submit Rebate Request
          </button>
        </form>
      </div>

      {/* Previous Requests */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Previous Rebate Requests</h3>

        {previousRequests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No previous rebate requests</p>
        ) : (
          <div className="space-y-3">
            {previousRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="font-semibold text-gray-800">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.reason}</p>
                    <p className="text-xs text-gray-500">
                      Submitted on {formatDate(request.submittedDate)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${
                      request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
