import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Mail, Lock, User, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'

const signUpSchema = z.object({
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username too long').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  teamName: z.string().max(50, 'Team name too long').optional()
})

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('signin')
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  })

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
    teamName: '',
  })

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    console.log('[AuthModal] Attempting sign in with email:', signInData.email)

    const { error } = await signIn(signInData.email, signInData.password)

    if (error) {
      console.error('[AuthModal] Sign in failed:', error.message)
      
      let errorMessage = error.message
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again. Click "Forgot password?" to reset.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'
      }
      
      toast({
        title: 'Sign In Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } else {
      console.log('[AuthModal] Sign in successful')
      toast({
        title: 'Welcome back!',
        description: 'Successfully signed in to GreenPoints',
      })
      onClose()
    }

    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate input
    const result = signUpSchema.safeParse(signUpData)
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

    const { error } = await signUp(signUpData.email, signUpData.password, signUpData.username)

    if (error) {
      toast({
        title: 'Sign Up Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Welcome to GreenPoints!',
        description: 'Please check your email to verify your account',
      })
      onClose()
    }

    setLoading(false)
  }

  const handlePasswordReset = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    console.log('[AuthModal] Sending password reset email to:', resetEmail)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/`,
    })

    if (error) {
      console.error('[AuthModal] Password reset error:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      console.log('[AuthModal] Password reset email sent successfully')
      toast({
        title: 'Check Your Email',
        description: 'Password reset link has been sent to your email address',
      })
      setShowPasswordReset(false)
      setResetEmail('')
    }

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <Leaf className="w-5 h-5 text-primary" />
            {showPasswordReset ? 'Reset Password' : 'Join GreenPoints'}
          </DialogTitle>
          <DialogDescription>
            {showPasswordReset 
              ? 'Enter your email to receive a password reset link' 
              : 'Sign in or create an account to start earning points'}
          </DialogDescription>
        </DialogHeader>

        {showPasswordReset ? (
          <Card className="border-0 shadow-none">
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => {
                    setShowPasswordReset(false)
                    setResetEmail('')
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 pt-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowPasswordReset(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border-0 shadow-none">
              <CardContent className="space-y-4 pt-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-username"
                        type="text"
                        placeholder="EcoChampion123"
                        className="pl-9"
                        value={signUpData.username}
                        onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-9"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-team">Team Name (Optional)</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-team"
                        type="text"
                        placeholder="Green Warriors"
                        className="pl-9"
                        value={signUpData.teamName}
                        onChange={(e) => setSignUpData({ ...signUpData, teamName: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}