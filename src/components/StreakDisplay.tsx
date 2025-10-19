import { Flame } from "lucide-react";
import { Badge } from "./ui/badge";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  className?: string;
}

export const StreakDisplay = ({ currentStreak, longestStreak, className = "" }: StreakDisplayProps) => {
  const getMultiplier = (streak: number) => {
    if (streak >= 100) return 3;
    if (streak >= 30) return 2;
    if (streak >= 7) return 1.5;
    return 1;
  };

  const multiplier = getMultiplier(currentStreak);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30">
        <Flame className={`h-4 w-4 ${currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
        <span className="text-sm font-bold text-foreground">{currentStreak}</span>
        <span className="text-xs text-muted-foreground">day streak</span>
      </div>
      
      {multiplier > 1 && (
        <Badge variant="default" className="bg-gradient-to-r from-success to-success/80">
          {multiplier}x Points
        </Badge>
      )}
    </div>
  );
};
