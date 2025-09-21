import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

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
    <Card className="w-full max-w-sm mx-auto shadow-medium">
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
            <Badge variant="outline" className="mt-2 bg-secondary/10 text-secondary border-secondary/30">
              Team: {profile.team_name}
            </Badge>
          )}
        </div>

        {/* Points & Rank */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-success" />
            <span className="text-2xl font-bold text-success">{profile.points}</span>
            <span className="text-muted-foreground">points</span>
          </div>
          <Badge className="bg-gradient-success text-white border-0">
            <Trophy className="w-3 h-3 mr-1" />
            {getRank(profile.points)}
          </Badge>
        </div>

        {/* Progress to Next Rank */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to next rank</span>
            <span>{profile.points % 200}/200</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-success h-2 rounded-full transition-all duration-500"
              style={{ width: `${((profile.points % 200) / 200) * 100}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
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