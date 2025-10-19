import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";

export const PollutionClock = () => {
  const [totalWaste, setTotalWaste] = useState<number>(0);

  useEffect(() => {
    fetchTotalWaste();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('pollution-clock')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchTotalWaste();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTotalWaste = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('total_waste_kg');

    if (!error && data) {
      const total = data.reduce((sum, profile) => sum + (profile.total_waste_kg || 0), 0);
      setTotalWaste(total);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-success/10 via-success/5 to-transparent p-8 border border-success/20">
      <div className="relative z-10 text-center">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-success/20 rounded-full">
          <Leaf className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-success">Community Impact</span>
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mb-2">Total Waste Removed</h3>
        
        <div className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent mb-4 animate-in fade-in duration-1000">
          {totalWaste.toFixed(1)}
          <span className="text-4xl ml-2">kg</span>
        </div>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          Together, our community is making a real environmental impact
        </p>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/5 rounded-full blur-3xl -z-0" />
    </div>
  );
};
