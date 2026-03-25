import { useState } from 'react';
import { Eye } from 'lucide-react';

interface Vote {
  id: string;
  title: string;
  date: string;
  totalVotes: number;
  options: { name: string; votes: number; percentage: number }[];
}

export function VotesSection() {
  const [votes] = useState<Vote[]>([
    {
      id: '1',
      title: 'Preferred Breakfast Time',
      date: '2026-01-20',
      totalVotes: 245,
      options: [
        { name: '7:00 AM - 8:00 AM', votes: 89, percentage: 36 },
        { name: '8:00 AM - 9:00 AM', votes: 120, percentage: 49 },
        { name: '9:00 AM - 10:00 AM', votes: 36, percentage: 15 },
      ],
    },
    {
      id: '2',
      title: 'Weekend Special Menu',
      date: '2026-01-19',
      totalVotes: 312,
      options: [
        { name: 'North Indian', votes: 145, percentage: 46 },
        { name: 'South Indian', votes: 98, percentage: 31 },
        { name: 'Continental', votes: 69, percentage: 23 },
      ],
    },
    {
      id: '3',
      title: 'Extra Item Preference',
      date: '2026-01-18',
      totalVotes: 198,
      options: [
        { name: 'Ice Cream', votes: 78, percentage: 39 },
        { name: 'Fresh Juice', votes: 65, percentage: 33 },
        { name: 'Fruits', votes: 55, percentage: 28 },
      ],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">View Votes</h2>
        <p className="text-sm text-gray-600">{votes.length} Total Polls</p>
      </div>

      <div className="space-y-4">
        {votes.map((vote) => (
          <div key={vote.id} className="border-2 border-black p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{vote.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Date: {new Date(vote.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{vote.totalVotes}</p>
                <p className="text-xs text-gray-600">Total Votes</p>
              </div>
            </div>

            <div className="space-y-3">
              {vote.options.map((option, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-sm text-gray-600">
                      {option.votes} votes ({option.percentage}%)
                    </span>
                  </div>
                  <div className="h-6 bg-gray-200 border border-black">
                    <div
                      className="h-full bg-black transition-all"
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="flex items-center gap-2 text-sm hover:underline">
                <Eye className="w-4 h-4" />
                View Detailed Results
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
