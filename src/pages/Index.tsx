import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Leaf, Users, Trophy, Camera, Star, Recycle, TreePine, Heart, User, Upload, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { UserProfile } from "@/components/UserProfile";
import { ActivitySubmission } from "@/components/ActivitySubmission";
import { GeneralSubmission } from "@/components/GeneralSubmission";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-image.jpg";
import ecoIcon from "@/assets/eco-icon.jpg";
import leaderboardImage from "@/assets/leaderboard-image.jpg";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [generalSubmissionOpen, setGeneralSubmissionOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const weeklyActivities = [
    {
      id: "project-evergreen",
      title: "Project Evergreen",
      description: "Plant native trees in collaboration with local authorities",
      points: 20,
      icon: <TreePine className="w-6 h-6" />,
      participants: 89,
      timeLeft: "5 days left",
      difficulty: "Medium"
    },
    {
      id: "trash-to-treasure",
      title: "Trash to Treasure",
      description: "Plastic bottle and waste recycling drives",
      points: 10,
      icon: <Recycle className="w-6 h-6" />,
      participants: 245,
      timeLeft: "3 days left",
      difficulty: "Easy"
    },
    {
      id: "blue-horizon-cleanup",
      title: "Blue Horizon Cleanup",
      description: "Beach and waterfront litter cleanup efforts",
      points: 15,
      icon: <Heart className="w-6 h-6" />,
      participants: 156,
      timeLeft: "2 days left",
      difficulty: "Easy"
    },
    {
      id: "solar-switch",
      title: "Solar Switch Challenge",
      description: "Document your switch to solar-powered alternatives",
      points: 25,
      icon: <Star className="w-6 h-6" />,
      participants: 67,
      timeLeft: "6 days left",
      difficulty: "Hard"
    },
    {
      id: "water-warrior",
      title: "Water Warrior",
      description: "Install water-saving devices and track conservation",
      points: 15,
      icon: <Leaf className="w-6 h-6" />,
      participants: 123,
      timeLeft: "4 days left",
      difficulty: "Medium"
    },
    {
      id: "zero-waste-week",
      title: "Zero Waste Week",
      description: "Go completely waste-free for 7 days",
      points: 30,
      icon: <Trophy className="w-6 h-6" />,
      participants: 45,
      timeLeft: "1 day left",
      difficulty: "Hard"
    }
  ];

  // Fetch leaderboard data
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Fetch user profile and check admin status when authenticated
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      checkAdminStatus();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  };

  const fetchLeaderboard = async () => {
    try {
      // Use leaderboard view that excludes sensitive data like email
      const { data, error } = await supabase
        .from('leaderboard_profiles')
        .select('username, points, team_name, avatar_url')
        .order('points', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedData = data.map((profile, index) => ({
          rank: index + 1,
          name: profile.team_name || profile.username,
          points: profile.points,
          avatar: profile.avatar_url || "/api/placeholder/32/32"
        }));
        setLeaderboardData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleJoinCommunity = () => {
    if (user) {
      setUserProfileOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleStartJourney = () => {
    if (user) {
      // Scroll to activities section
      document.getElementById('activities')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleJoinChallenge = (activity: any) => {
    if (user) {
      setSelectedActivity(activity);
      setActivityModalOpen(true);
    } else {
      setAuthModalOpen(true);
      toast({
        title: "Sign in required",
        description: "Please sign in to join challenges and earn points!",
      });
    }
  };

  const handleActivitySuccess = () => {
    fetchUserProfile();
    fetchLeaderboard();
    toast({
      title: "Success!",
      description: "Activity submitted successfully. Points will be added once reviewed!",
    });
  };

  const defaultLeaderboardData = [
    { rank: 1, name: "EcoWarriors Team", points: 2450, avatar: "/api/placeholder/32/32" },
    { rank: 2, name: "Green Guardians", points: 2380, avatar: "/api/placeholder/32/32" },
    { rank: 3, name: "Nature Ninjas", points: 2290, avatar: "/api/placeholder/32/32" },
    { rank: 4, name: "Planet Protectors", points: 2150, avatar: "/api/placeholder/32/32" },
    { rank: 5, name: "Sustainability Squad", points: 2050, avatar: "/api/placeholder/32/32" }
  ];

  const displayLeaderboard = leaderboardData.length > 0 ? leaderboardData : defaultLeaderboardData;

  const sponsors = [
    { name: "EcoBank", logo: "🏦", reward: "$500 Monthly Winner" },
    { name: "GreenTech", logo: "💚", reward: "Smart Home Package" },
    { name: "Nature Co.", logo: "🌱", reward: "Eco-Friendly Products" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 px-4 py-4 bg-card/80 backdrop-blur-lg border-b shadow-soft">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center shadow-medium">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">GreenSpark</h1>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-success text-white font-semibold shadow-medium">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">{userProfile?.points || 0}</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">{userProfile?.username || 'Profile'}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <UserProfile onClose={() => setUserProfileOpen(false)} />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Button size="sm" className="gap-2 bg-gradient-hero hover:opacity-90" onClick={handleJoinCommunity}>
                <Users className="w-4 h-4" />
                Join Community
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-gradient-success text-white border-0 shadow-medium px-4 py-1.5">
              🌍 Community-Driven Sustainability
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Turn Eco-Actions into
              <span className="block mt-2 bg-gradient-hero bg-clip-text text-transparent">Green Champion Status</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete weekly challenges, earn GreenPoints, climb the leaderboard, and make real environmental impact in the UAE.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button 
                size="lg" 
                className="bg-gradient-hero hover:opacity-90 text-white text-base px-8 shadow-medium"
                onClick={handleStartJourney}
              >
                {user ? 'View Challenges' : 'Get Started'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8"
                onClick={() => setGeneralSubmissionOpen(true)}
              >
                <Upload className="w-5 h-5 mr-2" />
                Share Your Action
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Activities */}
      <section id="activities" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-gradient-success text-white border-0 shadow-medium px-4 py-1.5">
              Weekly Challenges
            </Badge>
            <h3 className="text-3xl font-bold text-foreground mb-3">
              Choose Your Eco-Mission
            </h3>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Complete challenges, upload proof, and earn GreenPoints to climb the leaderboard.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {weeklyActivities.map((activity) => (
              <Card key={activity.id} className="group hover:scale-[1.02] transition-all duration-300 shadow-soft hover:shadow-medium border-border/50 overflow-hidden">
                <div className="h-2 bg-gradient-hero"></div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-lg bg-gradient-success/10 text-primary">
                      {activity.icon}
                    </div>
                    <Badge className="bg-gradient-success text-white border-0 font-semibold shadow-sm">
                      +{activity.points} pts
                    </Badge>
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-foreground">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 pb-3 border-b border-border/50">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {activity.participants}
                    </span>
                    <span>•</span>
                    <span>⏰ {activity.timeLeft}</span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">{activity.difficulty}</Badge>
                  </div>
                  <Button size="sm" className="w-full bg-gradient-hero hover:opacity-90 text-white shadow-sm" onClick={() => handleJoinChallenge(activity)}>
                    {user ? 'Submit Now' : 'Join Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Points & Leaderboard */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-3 bg-gradient-success text-white border-0 shadow-medium px-4 py-1.5">
                🏆 Monthly Leaderboard
              </Badge>
              <h3 className="text-3xl font-bold mb-4">
                Become a Green Champion
              </h3>
              <p className="text-base text-muted-foreground mb-6">
                Top performers each month win eco-friendly prizes and recognition as Green Champions. Track your progress and compete with the community!
              </p>
              
              <div className="space-y-3 mb-6">
                {displayLeaderboard.slice(0, 5).map((team, index) => (
                  <div key={team.rank} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    index < 3 ? 'bg-gradient-success/10 border-2 border-primary/20' : 'bg-muted/50 border border-border/50'
                  }`}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shadow-sm ${
                      index === 0 ? 'bg-warning text-warning-foreground' :
                      index === 1 ? 'bg-muted text-muted-foreground' :
                      index === 2 ? 'bg-accent/20 text-accent' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>
                      {team.rank}
                    </div>
                    <Avatar className="w-9 h-9 border-2 border-background">
                      <AvatarImage src={team.avatar} />
                      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{team.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(team.points / 2500) * 100} className="flex-1 h-1.5" />
                        <span className="text-xs font-bold bg-gradient-success bg-clip-text text-transparent whitespace-nowrap">{team.points} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto">
                <Trophy className="w-4 h-4" />
                View Full Rankings
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-2xl blur-3xl opacity-20"></div>
              <img 
                src={leaderboardImage} 
                alt="Community leaderboard" 
                className="relative rounded-2xl shadow-strong w-full"
              />
              <div className="absolute -top-3 -right-3 bg-gradient-hero p-3 rounded-xl shadow-medium">
                <div className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5" />
                  <span className="font-bold text-sm">Win Prizes!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Feed Preview */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-gradient-success text-white border-0 shadow-medium px-4 py-1.5">
              Community Feed
            </Badge>
            <h3 className="text-3xl font-bold mb-3">
              Share Your Impact
            </h3>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Upload proof of your eco-actions and inspire others in the community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 border-border/50">
                <div className="aspect-square bg-gradient-success relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Camera className="w-12 h-12 opacity-60" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/95 text-primary border-0 font-bold shadow-sm text-xs">
                      +{5 + i * 2} pts
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3 bg-card">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar className="w-7 h-7 bg-gradient-hero">
                      <AvatarFallback className="text-white text-xs font-bold">U{i}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm text-foreground">GreenChamp{i}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed {['recycling', 'tree planting', 'beach cleanup'][i-1]} challenge! 🌱
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors & Rewards */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-warning/10 text-warning border-warning/20 px-4 py-1.5">
              🎁 Monthly Rewards
            </Badge>
            <h3 className="text-3xl font-bold mb-3">
              Amazing Prizes Await
            </h3>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Top Green Champions win eco-friendly prizes from our sustainability partners.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {sponsors.map((sponsor) => (
              <Card key={sponsor.name} className="text-center p-6 shadow-soft hover:shadow-medium transition-all duration-300 bg-card border-border/50">
                <div className="text-5xl mb-3">{sponsor.logo}</div>
                <h4 className="text-lg font-bold mb-2 text-foreground">{sponsor.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{sponsor.reward}</p>
                <Badge className="bg-gradient-success/10 text-primary border-primary/20 font-semibold">
                  Sustainability Partner
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h3>
          <p className="text-base text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of Green Champions making environmental impact through community sustainability challenges.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-10 shadow-strong" onClick={handleStartJourney}>
            <Leaf className="w-5 h-5 mr-2" />
            {user ? 'View My Activities' : 'Get Started'}
          </Button>
          <p className="text-white/75 mt-3 text-sm">
            Free to join • Available in the UAE
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={ecoIcon} alt="GreenSpark" className="w-7 h-7 rounded" />
              <span className="text-base font-semibold">GreenSpark</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 GreenSpark. Making the world greener, one spark at a time.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      
      <GeneralSubmission 
        open={generalSubmissionOpen}
        onOpenChange={setGeneralSubmissionOpen}
      />
      
      <ActivitySubmission
        activity={selectedActivity}
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        onSuccess={handleActivitySuccess}
      />
    </div>
  );
};

export default Index;