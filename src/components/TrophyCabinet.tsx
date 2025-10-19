import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Trophy, Lock } from "lucide-react";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Trophy {
  id: string;
  name: string;
  description: string;
  tier: string;
  required_kg: number;
  icon: string;
  unlocked?: boolean;
  unlocked_at?: string;
}

export const TrophyCabinet = ({ userId }: { userId: string }) => {
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrophies();
  }, [userId]);

  const fetchTrophies = async () => {
    try {
      // Get all available trophies
      const { data: allTrophies, error: trophiesError } = await supabase
        .from('ar_trophies')
        .select('*')
        .order('required_kg', { ascending: true });

      if (trophiesError) throw trophiesError;

      // Get user's unlocked trophies
      const { data: userTrophies, error: userTrophiesError } = await supabase
        .from('user_trophies')
        .select('trophy_id, unlocked_at')
        .eq('user_id', userId);

      if (userTrophiesError) throw userTrophiesError;

      // Merge the data
      const unlockedIds = new Set(userTrophies?.map(ut => ut.trophy_id) || []);
      const mergedTrophies = allTrophies?.map(trophy => ({
        ...trophy,
        unlocked: unlockedIds.has(trophy.id),
        unlocked_at: userTrophies?.find(ut => ut.trophy_id === trophy.id)?.unlocked_at
      })) || [];

      setTrophies(mergedTrophies);
    } catch (error) {
      console.error('Error fetching trophies:', error);
      toast({
        title: "Error",
        description: "Failed to load trophies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-orange-600 to-orange-400';
      case 'silver': return 'from-gray-400 to-gray-200';
      case 'gold': return 'from-yellow-500 to-yellow-300';
      case 'platinum': return 'from-blue-400 to-purple-400';
      default: return 'from-gray-400 to-gray-200';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trophy className="h-4 w-4" />
          My Trophies
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Trophy Cabinet
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {trophies.map((trophy) => (
              <div
                key={trophy.id}
                className={`relative p-6 rounded-lg border-2 transition-all ${
                  trophy.unlocked
                    ? 'bg-gradient-to-br ' + getTierColor(trophy.tier) + ' border-white/30 shadow-lg'
                    : 'bg-muted/50 border-muted-foreground/20 opacity-50'
                }`}
              >
                {!trophy.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-5xl mb-3">{trophy.icon}</div>
                  <h3 className={`font-bold mb-1 ${trophy.unlocked ? 'text-white' : 'text-foreground'}`}>
                    {trophy.name}
                  </h3>
                  <p className={`text-sm mb-3 ${trophy.unlocked ? 'text-white/90' : 'text-muted-foreground'}`}>
                    {trophy.description}
                  </p>
                  
                  <Badge variant={trophy.unlocked ? "secondary" : "outline"} className="text-xs">
                    {trophy.required_kg}kg required
                  </Badge>
                  
                  {trophy.unlocked && trophy.unlocked_at && (
                    <p className="text-xs text-white/70 mt-2">
                      Unlocked {new Date(trophy.unlocked_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
