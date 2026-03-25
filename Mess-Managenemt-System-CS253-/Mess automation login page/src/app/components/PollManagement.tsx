import { useState, useEffect } from 'react';
import { Plus, Play, Square, Eye, EyeOff, BarChart3 } from 'lucide-react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

interface PollResult {
  menuId: string;
  date: string;
  mealType: string;
  items: string[];
  totalVotes: number;
  upVotes: number;
  downVotes: number;
  netVotes: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  options: string[];
  startDate: string;
  endDate: string;
  status: 'active' | 'ended' | 'scheduled';
  resultsPublic: boolean;
  votes?: Record<string, number>;
}

export function PollManagement() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadManagerResults = async (selectedDate: string) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Manager token missing.');
      setLoading(false);
      return;
    }

    try {
      const formatted = selectedDate;
      const res = await fetch(`${API_BASE_URL}/api/manager/votes/${formatted}`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to load voting results');
      setResults(data.data || []);
    } catch (err) {
      setError((err as Error).message || 'Unable to fetch vote results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagerResults(dateFilter);
    setPolls([
      { id: '1', title: 'Preferred Breakfast Time', description: 'Help us decide the best breakfast timing for students', options: ['7:00 AM - 8:00 AM', '8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM'], startDate: '2026-01-15', endDate: '2026-01-25', status: 'active', resultsPublic: true, votes: { '7:00 AM - 8:00 AM': 89, '8:00 AM - 9:00 AM': 120, '9:00 AM - 10:00 AM': 36 } },
      { id: '2', title: 'Weekend Special Menu', description: 'Vote for your favorite cuisine for weekend specials', options: ['North Indian', 'South Indian', 'Continental', 'Chinese'], startDate: '2026-01-10', endDate: '2026-01-20', status: 'ended', resultsPublic: true, votes: { 'North Indian': 145, 'South Indian': 98, 'Continental': 69, 'Chinese': 0 } },
      { id: '3', title: 'New Extra Item', description: 'Should we add smoothies to the extra items menu?', options: ['Yes', 'No'], startDate: '2026-01-28', endDate: '2026-02-05', status: 'scheduled', resultsPublic: false }
    ]);
  }, []);

  const toggleResultsVisibility = (pollId: string) => {
    setPolls((prev) => prev.map((poll) => poll.id === pollId ? { ...poll, resultsPublic: !poll.resultsPublic } : poll));
  };

  const endPoll = (pollId: string) => {
    setPolls((prev) => prev.map((poll) => poll.id === pollId ? { ...poll, status: 'ended' } : poll));
  };

  const getStatusColor = (status: Poll['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-600';
      case 'ended': return 'bg-gray-100 text-gray-800 border-gray-600';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-600';
      default: return 'bg-gray-100 text-gray-800 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Poll Management</h2>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800"><Plus className="w-4 h-4" /> Create New Poll</button>
      </div>

      {showCreateForm && (
        <div className="border-2 border-black p-6">...create form (unchanged)</div>
      )}

      <div className="flex items-center gap-3">
        <label>Date for vote results:</label>
        <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); loadManagerResults(e.target.value); }} className="px-3 py-2 border-2 border-black" />
      </div>

      {loading ? <p>Loading vote results...</p> : error ? <p className="text-red-600">{error}</p> : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Vote Results ({dateFilter})</h3>
          {results.length === 0 ? <p>No voting data for this date.</p> : results.map((result) => (
            <div key={result.menuId} className="border-2 border-black p-4">
              <div className="flex items-center justify-between mb-2">
                <div><strong>{result.mealType}</strong> • {new Date(result.date).toLocaleDateString()}</div>
                <span className="text-sm text-gray-600">Net Votes: {result.netVotes}</span>
              </div>
              <div className="text-sm text-gray-700">Items: {result.items.join(', ')}</div>
              <div className="mt-2 text-sm">Up: {result.upVotes}, Down: {result.downVotes}, Total: {result.totalVotes}</div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        {polls.map((poll) => (
          <div key={poll.id} className="border-2 border-black p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold">{poll.title}</h3>
                  <span className={`text-xs px-2 py-1 border ${getStatusColor(poll.status)}`}>{poll.status.toUpperCase()}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{poll.description}</p>
                <div className="text-sm text-gray-600">{poll.startDate} - {poll.endDate}</div>
              </div>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-200">
              {poll.status === 'active' && <button onClick={() => endPoll(poll.id)} className="flex items-center gap-2 px-3 py-2 border-2 border-black hover:bg-gray-100"><Square className="w-4 h-4" /> End Poll</button> }
              <button onClick={() => toggleResultsVisibility(poll.id)} className="flex items-center gap-2 px-3 py-2 border-2 border-black hover:bg-gray-100">{poll.resultsPublic ? <><EyeOff className="w-4 h-4" /> Hide Results</> : <><Eye className="w-4 h-4" /> Show Results</>}</button>
              {poll.status === 'scheduled' && <button className="flex items-center gap-2 px-3 py-2 bg-black text-white text-sm"><Play className="w-4 h-4" /> Start Now</button>}
            </div>
            {poll.resultsPublic && poll.votes && (
              <div className="mt-4 space-y-2">
                {poll.options.map((option) => {
                  const votes = poll.votes?.[option] || 0;
                  const total = Object.values(poll.votes).reduce((a,b) => a+b, 0);
                  const percentage = total > 0 ? Math.round((votes/total)*100) : 0;
                  return (
                    <div key={option}>
                      <div className="text-sm flex justify-between"><span>{option}</span><span>{votes} votes ({percentage}%)</span></div>
                      <div className="h-2 bg-gray-200 border border-black"><div className="h-full bg-black" style={{ width: `${percentage}%` }} /></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
