import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface AchievementsCardProps {
  achievements: string[];
  loading?: boolean;
}

const AchievementsCard: React.FC<AchievementsCardProps> = ({ achievements, loading }) => {
  if (loading) {
    return (
      <div className="mb-4">
        <div className="rounded-lg bg-green-50 p-4 animate-pulse h-24" />
      </div>
    );
  }

  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="rounded-lg bg-green-50 p-4 border border-green-200 shadow-sm">
        <div className="font-bold text-green-800 mb-3 flex items-center gap-2 text-lg">
          <span className="text-xl">🏅</span>
          New Achievements
        </div>
        <ul className="space-y-3">
          {achievements.map((achievement, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm"
            >
              <span className="bg-green-100 rounded-full p-1 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </span>
              <span className="text-sm">{achievement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AchievementsCard; 