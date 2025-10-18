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
      id: "recycle-bottles",
      title: "Bottle Recycling Challenge",
      description: "Collect and recycle plastic bottles in your neighborhood",
      points: 5,
      icon: <Recycle className="w-6 h-6" />,
      participants: 245,
      timeLeft: "3 days left"
    },
    {
      id: "plant-trees",
      title: "Community Tree Planting",
      description: "Plant native trees in designated community areas",
      points: 15,
      icon: <TreePine className="w-6 h-6" />,
      participants: 89,
      timeLeft: "5 days left"
    },
    {
      id: "park-cleanup",
      title: "Park Cleanup Drive",
      description: "Help clean local parks and public spaces",
      points: 10,
      icon: <Heart className="w-6 h-6" />,
      participants: 156,
      timeLeft: "2 days left"
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
        .limit(5);

      if (data) {
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
      <header className="px-4 py-6 bg-primary/5 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-primary">GreenSpark</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button variant="outline" className="gap-2" onClick={() => navigate("/admin")}>
                    <Shield className="w-4 h-4" />
                    Admin
                  </Button>
                )}
                <div className="flex items-center gap-2 text-success font-semibold">
                  <Star className="w-5 h-5" />
                  <span className="text-lg">{userProfile?.points || 0} pts</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      {userProfile?.username || 'Profile'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <UserProfile onClose={() => setUserProfileOpen(false)} />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Button variant="outline" className="gap-2" onClick={handleJoinCommunity}>
                <Users className="w-4 h-4" />
                Join Community
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Make Every Action Count
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Turn Eco-Actions into
              <span className="text-primary"> Green Champions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our community-driven sustainability movement. Complete weekly eco-challenges,
              earn GreenPoints, and compete to become a Green Champion while making real environmental impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8"
                onClick={handleStartJourney}
              >
                {user ? 'View Challenges' : 'Get Started'}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8"
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
      <section id="activities" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              This Week's Challenges
            </Badge>
            <h3 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Eco-Mission
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every week brings new opportunities to make a difference. Pick activities that match your schedule and interests.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {weeklyActivities.map((activity) => (
              <Card key={activity.id} className="group hover:scale-105 transition-all duration-300 shadow-soft hover:shadow-medium bg-gradient-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {activity.icon}
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      +{activity.points} pts
                    </Badge>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{activity.title}</h4>
                  <p className="text-muted-foreground mb-4">{activity.description}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>👥 {activity.participants} joined</span>
                    <span>⏰ {activity.timeLeft}</span>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleJoinChallenge(activity)}>
                    {user ? 'Submit Activity' : 'Join Challenge'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Points & Leaderboard */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
                Competitive Impact
              </Badge>
              <h3 className="text-4xl font-bold mb-6">
                Climb the Green Leaderboard
              </h3>
              <p className="text-xl text-muted-foreground mb-8">
                Track your progress, compete with teams, and see your environmental impact grow with every challenge completed.
              </p>
              
              <div className="space-y-4 mb-8">
                {displayLeaderboard.slice(0, 3).map((team) => (
                  <div key={team.rank} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-card border">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                      {team.rank}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={team.avatar} />
                      <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{team.name}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(team.points / 2500) * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-success">{team.points} pts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button size="lg" variant="outline" className="gap-2">
                <Trophy className="w-5 h-5" />
                View Full Leaderboard
              </Button>
            </div>
            
            <div className="relative">
              <img 
                src={leaderboardImage} 
                alt="Community leaderboard" 
                className="rounded-2xl shadow-medium w-full animate-float"
              />
              <div className="absolute -top-4 -left-4 bg-card p-4 rounded-xl shadow-medium">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-warning" />
                  <span className="font-semibold">Monthly Winner!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Feed Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Community Feed
            </Badge>
            <h3 className="text-4xl font-bold mb-4">
              Share Your Impact
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Inspire others and get inspired by sharing photos and stories from your eco-adventures.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-green-500 to-green-300 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Camera className="w-16 h-16" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/90 text-green-700 border-0 font-semibold">
                      +{5 + i * 2} points
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 bg-white">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8 bg-primary text-white">
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-foreground">EcoChampion{i}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Just completed the recycling challenge! 🌱
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors & Rewards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-warning/10 text-warning border-warning/20">
              Monthly Rewards
            </Badge>
            <h3 className="text-4xl font-bold mb-4">
              Amazing Prizes Await
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our incredible sponsors support the community with fantastic rewards for top performers every month.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {sponsors.map((sponsor) => (
              <Card key={sponsor.name} className="text-center p-8 shadow-md hover:shadow-lg transition-all duration-300 bg-white border">
                <div className="text-6xl mb-4">{sponsor.logo}</div>
                <h4 className="text-2xl font-bold mb-2 text-foreground">{sponsor.name}</h4>
                <p className="text-muted-foreground mb-4">{sponsor.reward}</p>
                <Badge className="bg-green-100 text-green-700 border-green-200 font-semibold">
                  Partner Sponsor
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-green-500 to-cyan-500">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Green Champions making positive environmental impact through community-based sustainability challenges.
          </p>
          <Button size="lg" className="bg-white text-green-700 hover:bg-white/90 text-lg px-12 py-6" onClick={handleStartJourney}>
            <Leaf className="w-5 h-5 mr-2" />
            {user ? 'View My Activities' : 'Get Started'}
          </Button>
          <p className="text-white/80 mt-4 text-sm">
            Available on iOS and Android • Free to join
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src={ecoIcon} alt="GreenSpark" className="w-8 h-8 rounded" />
              <span className="text-lg font-semibold">GreenSpark</span>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/30 text-center text-muted-foreground">
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