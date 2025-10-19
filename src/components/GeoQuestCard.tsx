import { MapPin, Clock, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface GeoQuestCardProps {
  title: string;
  description: string;
  locationName: string;
  pointsMultiplier: number;
  badgeName: string;
  icon: string;
  endsAt: string;
  onJoin: () => void;
}

export const GeoQuestCard = ({
  title,
  description,
  locationName,
  pointsMultiplier,
  badgeName,
  icon,
  endsAt,
  onJoin
}: GeoQuestCardProps) => {
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours}h remaining`;
  };

  return (
    <Card className="relative overflow-hidden border-2 border-warning bg-gradient-to-br from-warning/5 via-warning/10 to-warning/5 hover:shadow-xl transition-all group">
      {/* Animated pulse effect */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-warning/20 rounded-full blur-2xl animate-pulse" />
      
      {/* Geo-Quest Badge */}
      <div className="absolute top-3 right-3 z-10">
        <Badge className="bg-gradient-to-r from-warning to-orange-500 text-white border-0 animate-pulse">
          <Zap className="h-3 w-3 mr-1" />
          GEO-QUEST
        </Badge>
      </div>

      <div className="relative z-10 p-6">
        {/* Icon */}
        <div className="text-5xl mb-3">{icon}</div>

        {/* Content */}
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

        {/* Location */}
        <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-warning" />
          <span>{locationName}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-4">
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            {pointsMultiplier}x Points
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {getTimeRemaining()}
          </div>
        </div>

        {/* Badge reward */}
        <div className="mb-4 p-3 bg-background/50 rounded-lg border border-warning/30">
          <p className="text-xs text-muted-foreground mb-1">Exclusive Badge:</p>
          <p className="text-sm font-semibold text-foreground">{badgeName}</p>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onJoin}
          className="w-full bg-gradient-to-r from-warning to-orange-500 hover:from-warning/90 hover:to-orange-500/90 text-white border-0"
        >
          Accept Quest
        </Button>
      </div>
    </Card>
  );
};
