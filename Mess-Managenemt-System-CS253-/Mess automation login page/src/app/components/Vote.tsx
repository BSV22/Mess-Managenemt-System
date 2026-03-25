import { useState } from 'react';
import { ThumbsUp, Clock, CheckCircle2 } from 'lucide-react';

interface DishOption {
  id: string;
  name: string;
  category: string;
  votes: number;
}

interface VotingPoll {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'upcoming';
  options: DishOption[];
  hasVoted: boolean;
  userVote?: string;
}

export function Vote() {
  const [polls, setPolls] = useState<VotingPoll[]>([
    {
      id: '1',
      title: 'Choose Next Week\'s Special Dinner',
      description: 'Vote for your favorite dish for Friday special dinner',
      startDate: '2026-01-20',
      endDate: '2026-01-25',
      status: 'active',
      hasVoted: false,
      options: [
        { id: 'o1', name: 'Butter Chicken with Naan', category: 'Non-Veg', votes: 45 },
        { id: 'o2', name: 'Paneer Butter Masala with Naan', category: 'Veg', votes: 38 },
        { id: 'o3', name: 'Biryani (Veg/Non-Veg)', category: 'Rice', votes: 52 },
        { id: 'o4', name: 'Chole Bhature', category: 'North Indian', votes: 30 },
      ]
    },
    {
      id: '2',
      title: 'Sunday Breakfast Menu',
      description: 'What would you like for Sunday breakfast?',
      startDate: '2026-01-15',
      endDate: '2026-01-20',
      status: 'closed',
      hasVoted: true,
      userVote: 'o6',
      options: [
        { id: 'o5', name: 'Dosa with Sambar', category: 'South Indian', votes: 55 },
        { id: 'o6', name: 'Paratha with Curd', category: 'North Indian', votes: 62 },
        { id: 'o7', name: 'Poha and Jalebi', category: 'Snacks', votes: 43 },
        { id: 'o8', name: 'Idli Vada', category: 'South Indian', votes: 48 },
      ]
    },
    {
      id: '3',
      title: 'Mid-Semester Exam Week Special',
      description: 'Choose comfort food for exam week',
      startDate: '2026-01-25',
      endDate: '2026-01-30',
      status: 'upcoming',
      hasVoted: false,
      options: [
        { id: 'o9', name: 'Maggi with Vegetables', category: 'Snacks', votes: 0 },
        { id: 'o10', name: 'Pizza', category: 'Continental', votes: 0 },
        { id: 'o11', name: 'Pasta', category: 'Continental', votes: 0 },
        { id: 'o12', name: 'Sandwich and Fries', category: 'Snacks', votes: 0 },
      ]
    }
  ]);

  const handleVote = (pollId: string, optionId: string) => {
    setPolls(polls.map(poll => {
      if (poll.id === pollId && !poll.hasVoted && poll.status === 'active') {
        return {
          ...poll,
          hasVoted: true,
          userVote: optionId,
          options: poll.options.map(opt => 
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          )
        };
      }
      return poll;
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTotalVotes = (options: DishOption[]) => {
    return options.reduce((sum, opt) => sum + opt.votes, 0);
  };

  const getVotePercentage = (votes: number, total: number) => {
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Menu Voting System</h2>
        <p className="text-sm mt-2 text-gray-600">Have your say in what gets served!</p>
      </div>

      {/* Active Polls */}
      {polls.filter(poll => poll.status === 'active').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Active Polls</h3>
          {polls
            .filter(poll => poll.status === 'active')
            .map(poll => {
              const totalVotes = getTotalVotes(poll.options);
              return (
                <div key={poll.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold mb-2 text-gray-800">{poll.title}</h4>
                      <p className="text-gray-600 mb-3">{poll.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Ends on {formatDate(poll.endDate)}</span>
                      </div>
                    </div>
                    {poll.hasVoted && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Voted
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {poll.options.map(option => (
                      <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800">{option.name}</h5>
                            <span className="text-sm text-gray-500">{option.category}</span>
                          </div>
                          {!poll.hasVoted ? (
                            <button
                              onClick={() => handleVote(poll.id, option.id)}
                              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                            >
                              <ThumbsUp className="w-4 h-4" />
                              Vote
                            </button>
                          ) : (
                            <div className="text-right">
                              <p className="font-bold text-lg text-gray-800">{option.votes} votes</p>
                              <p className="text-sm text-gray-500">{getVotePercentage(option.votes, totalVotes)}%</p>
                            </div>
                          )}
                        </div>
                        {poll.hasVoted && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  poll.userVote === option.id ? 'bg-gray-800' : 'bg-gray-400'
                                }`}
                                style={{ width: `${getVotePercentage(option.votes, totalVotes)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    Total votes: {totalVotes}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Closed Polls */}
      {polls.filter(poll => poll.status === 'closed').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Closed Polls</h3>
          {polls
            .filter(poll => poll.status === 'closed')
            .map(poll => {
              const totalVotes = getTotalVotes(poll.options);
              const winner = poll.options.reduce((max, opt) => opt.votes > max.votes ? opt : max, poll.options[0]);
              return (
                <div key={poll.id} className="bg-gray-50 border border-gray-300 rounded-lg shadow-md p-6 opacity-90">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold mb-2">{poll.title}</h4>
                      <p className="text-gray-600 mb-3">{poll.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Closed on {formatDate(poll.endDate)}</span>
                      </div>
                    </div>
                    <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Closed
                    </span>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-green-800 font-semibold mb-1">Winner:</p>
                    <p className="text-lg font-bold text-green-900">{winner.name}</p>
                    <p className="text-sm text-green-700">{winner.votes} votes ({getVotePercentage(winner.votes, totalVotes)}%)</p>
                  </div>

                  <div className="space-y-2">
                    {poll.options.map(option => (
                      <div key={option.id} className="flex items-center justify-between p-3 bg-white rounded">
                        <span className="font-medium">{option.name}</span>
                        <span className="text-gray-600">{option.votes} votes ({getVotePercentage(option.votes, totalVotes)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Upcoming Polls */}
      {polls.filter(poll => poll.status === 'upcoming').length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Upcoming Polls</h3>
          {polls
            .filter(poll => poll.status === 'upcoming')
            .map(poll => (
              <div key={poll.id} className="bg-blue-50 border border-blue-200 rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-bold mb-2">{poll.title}</h4>
                    <p className="text-gray-600 mb-3">{poll.description}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                      <Clock className="w-4 h-4" />
                      <span>Starts on {formatDate(poll.startDate)}</span>
                    </div>
                  </div>
                  <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    Upcoming
                  </span>
                </div>

                <div className="space-y-2">
                  {poll.options.map(option => (
                    <div key={option.id} className="p-3 bg-white rounded border border-blue-100">
                      <span className="font-medium">{option.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({option.category})</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}