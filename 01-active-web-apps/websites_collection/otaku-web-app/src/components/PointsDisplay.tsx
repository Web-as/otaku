import { useState, useEffect } from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { gamificationAPI } from '../services/api';

interface UserPoints {
  total_points: number;
  daily_points: number;
  weekly_points: number;
  monthly_points: number;
}

const PointsDisplay = () => {
  const [points, setPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await gamificationAPI.getPoints();
      setPoints(response.data);
    } catch (err) {
      console.error('Failed to fetch points:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !points) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <div>
          <p className="text-xs text-gray-500 uppercase">Total Points</p>
          <p className="text-lg font-bold text-white">{points.total_points}</p>
        </div>
      </div>
      <div className="h-8 w-px bg-gray-800" />
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-violet-400" />
        <div>
          <p className="text-xs text-gray-500 uppercase">This Week</p>
          <p className="text-lg font-bold text-violet-400">{points.weekly_points}</p>
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay;
