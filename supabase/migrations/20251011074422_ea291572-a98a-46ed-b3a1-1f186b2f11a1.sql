-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive policy: users can only view their own full profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Create a public view for leaderboard that excludes sensitive data
CREATE OR REPLACE VIEW public.leaderboard_profiles AS
SELECT 
  id,
  username,
  points,
  team_name,
  avatar_url,
  created_at
FROM public.profiles
ORDER BY points DESC;

-- Allow anyone to view the leaderboard
GRANT SELECT ON public.leaderboard_profiles TO authenticated;
GRANT SELECT ON public.leaderboard_profiles TO anon;