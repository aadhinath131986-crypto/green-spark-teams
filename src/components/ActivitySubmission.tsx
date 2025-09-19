import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface Activity {
  id: string
  title: string
  description: string
  points: number
  icon: React.ReactNode
}

interface ActivitySubmissionProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const ActivitySubmission: React.FC<ActivitySubmissionProps> = ({ 
  activity, 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !activity) return

    setLoading(true)

    try {
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${user.id}-${activity.id}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('activity-proofs')
          .upload(fileName, imageFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('activity-proofs')
          .getPublicUrl(fileName)
        
        imageUrl = publicUrl
      }

      // Submit activity
      const { error } = await supabase
        .from('user_activities')
        .insert([
          {
            user_id: user.id,
            activity_id: activity.id,
            proof_image_url: imageUrl,
            status: 'pending',
            points_awarded: 0,
            submitted_at: new Date().toISOString(),
          },
        ])

      if (error) throw error

      toast({
        title: 'Activity Submitted!',
        description: `Your ${activity.title} submission is under review. You'll receive points once approved!`,
      })

      onSuccess()
      onClose()
      resetForm()
    } catch (error: any) {
      toast({
        title: 'Submission Error',
        description: error.message || 'Failed to submit activity',
        variant: 'destructive',
      })
    }

    setLoading(false)
  }

  const resetForm = () => {
    setDescription('')
    setImageFile(null)
    setImagePreview(null)
  }

  if (!activity) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activity.icon}
            Submit: {activity.title}
          </DialogTitle>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardContent className="space-y-6 pt-4">
            {/* Activity Info */}
            <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <Badge className="bg-success/10 text-success border-success/30">
                +{activity.points} pts
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Proof Photo (Required)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-full h-32 object-cover rounded mx-auto"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview(null)
                        }}
                      >
                        Change Photo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Camera className="w-8 h-8 text-muted-foreground mx-auto" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Upload a photo showing your completed activity
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                          required
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" className="mt-2">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Photo
                          </Button>
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your eco-activity..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !imageFile}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    'Submitting...'
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      Submit Activity
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}