import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000';

type FeedbackCategory = 'food-quality' | 'service' | 'cleanliness' | 'variety' | 'general';

interface FeedbackItem {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  rating: number;
  category: FeedbackCategory;
  message: string;
}

export function FeedbackSection() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics] = useState<{ category: string; totalReviews: number; averageRating: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Manager token missing.');
      setLoading(false);
      return;
    }

    try {
      const [feedbackRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/manager/feedback`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }),
        fetch(`${API_BASE_URL}/api/manager/feedback/analytics`, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } })
      ]);

      const feedbackData = await feedbackRes.json();
      const analyticsData = await analyticsRes.json();

      if (!feedbackData.success) throw new Error(feedbackData.message || 'Feedback load failed');
      if (!analyticsData.success) throw new Error(analyticsData.message || 'Analytics load failed');

      setFeedbacks(feedbackData.data || []);
      setAnalytics(analyticsData.data || []);
    } catch (err) {
      setError((err as Error).message || 'Error fetching feedback data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="py-16 text-center">Loading feedback...</div>;
  if (error) return <div className="py-16 text-center text-red-600">{error}</div>;

  const filteredFeedbacks = selectedCategory === 'all' ? feedbacks : feedbacks.filter((f) => f.category === selectedCategory);
  const avgRating = feedbacks.length ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) : '0.0';

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = feedbacks.filter((f) => f.rating === rating).length;
    return {
      rating,
      count,
      percentage: feedbacks.length ? (count / feedbacks.length) * 100 : 0
    };
  });

  const categories = [
    { id: 'all', label: 'All Feedback' },
    { id: 'food-quality', label: 'Food Quality' },
    { id: 'service', label: 'Service' },
    { id: 'cleanliness', label: 'Cleanliness' },
    { id: 'variety', label: 'Variety' },
    { id: 'general', label: 'General' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Student Feedback</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-3xl font-bold">{avgRating}</p>
            <div className="flex items-center gap-1">{
              Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(avgRating)) ? 'fill-black' : 'fill-gray-300'}`} />
              ))
            }</div>
            <p className="text-xs text-gray-600 mt-1">{feedbacks.length} reviews</p>
          </div>
        </div>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="font-bold mb-4">Rating Distribution</h3>
        <div className="space-y-2">
          {ratingDistribution.map((dist) => (
            <div key={dist.rating} className="flex items-center gap-3">
              <span className="w-12 text-sm">{dist.rating} stars</span>
              <div className="flex-1 h-6 bg-gray-200 border border-black">
                <div className="h-full bg-black" style={{ width: `${dist.percentage}%` }} />
              </div>
              <span className="w-12 text-sm text-right">{dist.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 border-2 transition-colors ${selectedCategory === cat.id ? 'bg-black text-white border-black' : 'border-black hover:bg-gray-100'}`}>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-bold">{selectedCategory === 'all' ? 'All Feedback' : categories.find((c) => c.id === selectedCategory)?.label} ({filteredFeedbacks.length})</h3>

        {filteredFeedbacks.length === 0 ? (
          <div className="border-2 border-gray-300 p-8 text-center text-gray-500">No feedback in this category</div>
        ) : filteredFeedbacks.map((feedback) => (
          <div key={feedback.id} className="border-2 border-black p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1"><h4 className="font-bold">{feedback.studentName}</h4><span className="text-sm text-gray-600">({feedback.studentId})</span></div>
                <div className="flex items-center gap-2"><div className="flex items-center gap-1">{[1,2,3,4,5].map((star) => <Star key={star} className={`w-4 h-4 ${star <= feedback.rating ? 'fill-black' : 'fill-gray-300'}`} />)}</div><span className="text-sm text-gray-600">{new Date(feedback.date).toLocaleDateString()}</span></div>
              </div>
              <span className="text-xs px-2 py-1 border border-black bg-gray-100">{feedback.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
            </div>
            <div className="flex items-start gap-2"><MessageSquare className="w-5 h-5 text-gray-400 mt-1" /><p className="text-sm flex-1">{feedback.message}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-black p-6"><div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-green-600" /><h4 className="font-bold">Positive Trends</h4></div><p className="text-sm text-gray-600">{feedbacks.filter((f) => f.rating >= 4).length} positive reviews</p></div>
        <div className="border-2 border-black p-6"><div className="flex items-center gap-2 mb-2"><TrendingDown className="w-5 h-5 text-red-600" /><h4 className="font-bold">Areas for Improvement</h4></div><p className="text-sm text-gray-600">{feedbacks.filter((f) => f.rating <= 2).length} low reviews</p></div>
      </div>

      <div className="border-2 border-black p-6">
        <h3 className="font-bold mb-3">Category Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {analytics.map((item) => (
            <div key={item.category} className="border p-3 rounded">
              <p className="text-sm font-medium">{item.category}</p>
              <p className="text-xl font-bold">{item.averageRating}</p>
              <p className="text-xs text-gray-600">{item.totalReviews} reviews</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
