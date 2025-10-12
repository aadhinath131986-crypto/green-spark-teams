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
import { supabase } from '@/integrations/supabase/client'
import { Camera as CapCamera } from '@capacitor/camera'
import { CameraResultType, CameraSource } from '@capacitor/camera'
import { z } from 'zod'

const activitySchema = z.object({
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  imageFile: z.instanceof(File)
    .refine(file => file.size <= 5 * 1024 * 1024, 'Image must be under 5MB')
    .refine(file => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type), 'Invalid image type')
})

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

  const handleTakePhoto = async () => {
    try {
      const photo = await CapCamera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90,
        allowEditing: false,
        saveToGallery: true
      })

      if (photo.webPath) {
        // Convert to blob for upload
        const response = await fetch(photo.webPath)
        const blob = await response.blob()
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        setImageFile(file)
        setImagePreview(photo.webPath)
      }
    } catch (error: any) {
      toast({
        title: 'Camera Error',
        description: error.message || 'Failed to take photo',
        variant: 'destructive',
      })
    }
  }

  const handleChooseFromGallery = async () => {
    try {
      const photo = await CapCamera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90
      })

      if (photo.webPath) {
        const response = await fetch(photo.webPath)
        const blob = await response.blob()
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })
        
        setImageFile(file)
        setImagePreview(photo.webPath)
      }
    } catch (error: any) {
      toast({
        title: 'Gallery Error',
        description: error.message || 'Failed to select photo',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !activity) return

    setLoading(true)

    try {
      // Validate input
      if (!imageFile) {
        toast({
          title: 'Validation Error',
          description: 'Please upload a proof image',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const result = activitySchema.safeParse({ description, imageFile })
      if (!result.success) {
        const firstError = result.error.errors[0]
        toast({
          title: 'Validation Error',
          description: firstError.message,
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      let imageUrl = null

      // Upload image if provided
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}/${activity.id}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('activity-proofs')
        .upload(fileName, imageFile)

      if (uploadError) throw uploadError

      // Get signed URL instead of public URL (bucket is now private)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('activity-proofs')
        .createSignedUrl(fileName, 31536000) // 1 year expiry
      
      if (signedError) throw signedError
      imageUrl = signedData.signedUrl

      // Submit activity
      const { error } = await supabase
        .from('user_activities')
        .insert([
          {
            user_id: user.id,
            activity_id: activity.id,
            proof_image_url: imageUrl,
            description: description || null,
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
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
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
                        <p className="text-sm text-muted-foreground mb-3">
                          Capture proof of your completed activity
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button 
                            type="button" 
                            variant="default" 
                            onClick={handleTakePhoto}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Take Photo
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleChooseFromGallery}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Photo
                          </Button>
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="image-upload"
                        />
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