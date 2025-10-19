import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Share2, Download, Leaf, Flame, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImpactStoryGeneratorProps {
  totalWasteKg: number;
  currentStreak: number;
  longestStreak: number;
  points: number;
  username: string;
}

export const ImpactStoryGenerator = ({
  totalWasteKg,
  currentStreak,
  longestStreak,
  points,
  username
}: ImpactStoryGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate impact metrics
  const plasticBottles = Math.floor(totalWasteKg * 40); // ~25g per bottle
  const co2Saved = (totalWasteKg * 2.5).toFixed(1); // kg CO2
  const energySaved = (totalWasteKg * 0.7).toFixed(1); // kWh

  const generateStory = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({
        title: "Impact Story Generated!",
        description: "Your personalized impact story is ready to share",
      });
    }, 1000);
  };

  const shareStory = async () => {
    const text = `🌱 I've made an impact with GreenSpark!\n\n` +
      `♻️ ${totalWasteKg.toFixed(1)}kg waste removed\n` +
      `🔥 ${currentStreak} day streak\n` +
      `⭐ ${points} GreenPoints earned\n` +
      `🌍 Equivalent to ${plasticBottles} plastic bottles!\n\n` +
      `Join me in making the UAE greener! #GreenSpark #Sustainability`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Share your impact story on social media",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Impact Story
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-success" />
            Your Impact Story
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Impact Card */}
          <div className="bg-gradient-to-br from-success/10 to-primary/10 p-6 rounded-lg border border-success/20">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-foreground mb-1">{username}</h3>
              <p className="text-sm text-muted-foreground">Green Champion</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-success">{totalWasteKg.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">kg removed</div>
              </div>
              <div className="text-center p-3 bg-background/50 rounded-lg">
                <div className="text-3xl font-bold text-orange-500">{currentStreak}</div>
                <div className="text-xs text-muted-foreground">day streak</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 bg-background/30 rounded">
                <span className="text-muted-foreground">Plastic bottles equivalent:</span>
                <span className="font-bold">{plasticBottles.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/30 rounded">
                <span className="text-muted-foreground">CO₂ saved:</span>
                <span className="font-bold">{co2Saved} kg</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/30 rounded">
                <span className="text-muted-foreground">Energy equivalent:</span>
                <span className="font-bold">{energySaved} kWh</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-background/30 rounded">
                <span className="text-muted-foreground">GreenPoints:</span>
                <span className="font-bold text-success">{points}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={shareStory} 
              className="flex-1 bg-success hover:bg-success/90"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Story
            </Button>
            <Button 
              onClick={generateStory} 
              variant="outline" 
              disabled={isGenerating}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Share your environmental impact and inspire others to join GreenSpark!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
