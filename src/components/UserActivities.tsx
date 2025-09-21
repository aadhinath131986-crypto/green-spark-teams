import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Clock, CheckCircle, XCircle, Camera, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'

interface UserActivity {
  id: string
  activity: {
    title: string
    description: string
    points: number
  }
  proof_image_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  points_awarded: number
  submitted_at: string
  reviewed_at: string | null
}

export const UserActivities: React.FC = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    totalPoints: 0
  })

  useEffect(() => {
    if (user) {
      fetchUserActivities()
    }
  }, [user])

  const fetchUserActivities = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          id,
          proof_image_url,
          status,
          points_awarded,
          submitted_at,
          reviewed_at,
          activities (
            title,
            description,
            points
          )
        `)
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          activity: item.activities as any,
          proof_image_url: item.proof_image_url,
          status: item.status as 'pending' | 'approved' | 'rejected',
          points_awarded: item.points_awarded,
          submitted_at: item.submitted_at,
          reviewed_at: item.reviewed_at
        }))

        setActivities(formattedData)

        // Calculate stats
        const stats = {
          total: formattedData.length,
          pending: formattedData.filter(a => a.status === 'pending').length,
          approved: formattedData.filter(a => a.status === 'approved').length,
          totalPoints: formattedData
            .filter(a => a.status === 'approved')
            .reduce((sum, a) => sum + a.points_awarded, 0)
        }
        setStats(stats)
      }
    } catch (error) {
      console.error('Error fetching user activities:', error)
    }

    setLoading(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/30'
      case 'approved':
        return 'bg-success/10 text-success border-success/30'
      case 'rejected':
        return 'bg-destructive/10 text-destructive border-destructive/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse">Loading your activities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{stats.approved}</div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-success" />
              <span className="text-2xl font-bold text-success">{stats.totalPoints}</span>
            </div>
            <div className="text-sm text-muted-foreground">Points Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Your Activity Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No activities submitted yet!</p>
              <p className="text-sm">Start participating in challenges to earn points.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-4 rounded-lg border bg-gradient-card"
                >
                  {/* Activity Image */}
                  <div className="flex-shrink-0">
                    {activity.proof_image_url ? (
                      <img 
                        src={activity.proof_image_url} 
                        alt="Activity proof"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                        <Camera className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Activity Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{activity.activity.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.activity.description}
                        </p>
                      </div>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusIcon(activity.status)}
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>Submitted: {formatDate(activity.submitted_at)}</span>
                        {activity.reviewed_at && (
                          <span>Reviewed: {formatDate(activity.reviewed_at)}</span>
                        )}
                      </div>
                      
                      {activity.status === 'approved' && (
                        <Badge className="bg-success/10 text-success border-success/30">
                          +{activity.points_awarded} points
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}