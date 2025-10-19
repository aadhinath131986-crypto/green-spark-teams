import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, LogOut, Flame } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { StreakDisplay } from './StreakDisplay'
import { TrophyCabinet } from './TrophyCabinet'
import { ImpactStoryGenerator } from './ImpactStoryGenerator'

interface UserProfileProps {
  onClose?: () => void
}

interface Profile {
  id: string
  username: string
  email: string
  points: number
  team_name: string | null
  avatar_url: string | null
  current_streak: number
  longest_streak: number
  total_waste_kg: number
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await signOut()
    onClose?.()
  }

  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6 text-center">
          <p>Profile not found</p>
        </CardContent>
      </Card>
    )
  }

  const getRank = (points: number) => {
    if (points >= 1000) return 'Eco-Champion'
    if (points >= 500) return 'Green Guardian'
    if (points >= 200) return 'Nature Helper'
    return 'Eco-Starter'
  }

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardContent className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold">{profile.username}</h3>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
          {profile.team_name && (
            <Badge variant="outline" className="mt-2">
              Team: {profile.team_name}
            </Badge>
          )}
        </div>

        {/* Points & Rank */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary">{profile.points}</span>
            <span className="text-muted-foreground">points</span>
          </div>
          
          <StreakDisplay 
            currentStreak={profile.current_streak || 0}
            longestStreak={profile.longest_streak || 0}
            className="justify-center"
          />
          
          <Badge className="bg-primary/10 text-primary border-primary/20">
            <Trophy className="w-3 h-3 mr-1" />
            {getRank(profile.points)}
          </Badge>
          
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-1">Waste Removed</p>
            <p className="text-2xl font-bold text-success">{profile.total_waste_kg?.toFixed(1) || 0} kg</p>
          </div>
        </div>

        {/* Progress to Next Rank */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next rank</span>
            <span>{profile.points % 200}/200</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${((profile.points % 200) / 200) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <TrophyCabinet userId={profile.id} />
            <ImpactStoryGenerator
              totalWasteKg={profile.total_waste_kg || 0}
              currentStreak={profile.current_streak || 0}
              longestStreak={profile.longest_streak || 0}
              points={profile.points}
              username={profile.username}
            />
          </div>
          
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}