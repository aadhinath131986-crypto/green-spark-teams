import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Leaf, Users, Trophy, Camera, Star, Recycle, TreePine, Heart } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import ecoIcon from "@/assets/eco-icon.jpg";
import leaderboardImage from "@/assets/leaderboard-image.jpg";

const Index = () => {
  const weeklyActivities = [
    {
      id: 1,
      title: "Bottle Recycling Challenge",
      description: "Collect and recycle plastic bottles in your neighborhood",
      points: 5,
      icon: <Recycle className="w-6 h-6" />,
      participants: 245,
      timeLeft: "3 days left"
    },
    {
      id: 2,
      title: "Community Tree Planting",
      description: "Plant native trees in designated community areas",
      points: 15,
      icon: <TreePine className="w-6 h-6" />,
      participants: 89,
      timeLeft: "5 days left"
    },
    {
      id: 3,
      title: "Park Cleanup Drive",
      description: "Help clean local parks and public spaces",
      points: 10,
      icon: <Heart className="w-6 h-6" />,
      participants: 156,
      timeLeft: "2 days left"
    }
  ];

  const leaderboardData = [
    { rank: 1, name: "EcoWarriors Team", points: 2450, avatar: "/api/placeholder/32/32" },
    { rank: 2, name: "Green Guardians", points: 2380, avatar: "/api/placeholder/32/32" },
    { rank: 3, name: "Nature Ninjas", points: 2290, avatar: "/api/placeholder/32/32" },
    { rank: 4, name: "Planet Protectors", points: 2150, avatar: "/api/placeholder/32/32" },
    { rank: 5, name: "Sustainability Squad", points: 2050, avatar: "/api/placeholder/32/32" }
  ];

  const sponsors = [
    { name: "EcoBank", logo: "🏦", reward: "$500 Monthly Winner" },
    { name: "GreenTech", logo: "💚", reward: "Smart Home Package" },
    { name: "Nature Co.", logo: "🌱", reward: "Eco-Friendly Products" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-4 py-6 border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ecoIcon} alt="GreenPoints" className="w-10 h-10 rounded-lg" />
            <h1 className="text-2xl font-bold text-primary">GreenPoints</h1>
          </div>
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            Join Community
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-success/20 text-success border-success/30 animate-pulse-soft">
                🌱 Join 10K+ Eco-Champions
              </Badge>
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Make Every Action Count for the 
                <span className="text-accent block">Planet</span>
              </h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Earn points, compete with friends, and create positive environmental impact through weekly community challenges.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                  <Leaf className="w-5 h-5 mr-2" />
                  Start Your Journey
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6">
                  <Camera className="w-5 h-5 mr-2" />
                  See How It Works
                </Button>
              </div>
            </div>
            <div className="relative animate-float">
              <img 
                src={heroImage} 
                alt="Community eco activities" 
                className="rounded-2xl shadow-strong w-full max-w-lg mx-auto"
              />
              <div className="absolute -bottom-6 -right-6 bg-card p-4 rounded-xl shadow-medium">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">+15 Points Earned!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Activities */}
      <section className="py-20 bg-muted/30">
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
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Join Challenge
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
                {leaderboardData.slice(0, 3).map((team) => (
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
              <Card key={i} className="overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="aspect-square bg-gradient-success relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Camera className="w-12 h-12 opacity-50" />
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-white/20 text-white border-white/30">
                      +{5 + i * 2} points
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">EcoChampion{i}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Just completed the recycling challenge! 🌱
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary">
                      <Heart className="w-4 h-4" />
                      {12 + i * 3}
                    </button>
                    <span>2h ago</span>
                  </div>
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
              <Card key={sponsor.name} className="text-center p-8 shadow-soft hover:shadow-medium transition-all duration-300 bg-gradient-card border-0">
                <div className="text-6xl mb-4">{sponsor.logo}</div>
                <h4 className="text-2xl font-bold mb-2">{sponsor.name}</h4>
                <p className="text-muted-foreground mb-4">{sponsor.reward}</p>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Partner Sponsor
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of eco-champions making positive environmental impact one challenge at a time.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-12 py-6">
            <Leaf className="w-5 h-5 mr-2" />
            Download GreenPoints
          </Button>
          <p className="text-white/70 mt-4">
            Available on iOS and Android • Free to join
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src={ecoIcon} alt="GreenPoints" className="w-8 h-8 rounded" />
              <span className="text-lg font-semibold">GreenPoints</span>
            </div>
            <div className="flex items-center gap-6 text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/30 text-center text-muted-foreground">
            <p>&copy; 2024 GreenPoints. Making the world greener, one point at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;