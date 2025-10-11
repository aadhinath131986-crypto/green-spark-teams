-- The proper fix: Use the leaderboard view for public queries and ensure
-- the main profiles table RLS is properly configured

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view non-sensitive profile data" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON public.profiles;

-- Create policy: users can ONLY view their own profile from the profiles table
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- The leaderboard_profiles VIEW is already created and accessible to everyone
-- It only exposes: id, username, points, team_name, avatar_url (NO email)
-- This solves the security issue while keeping leaderboard functionality