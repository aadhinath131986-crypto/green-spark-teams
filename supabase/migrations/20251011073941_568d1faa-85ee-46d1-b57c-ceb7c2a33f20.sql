-- Create a separate policy that allows the service role (used by the trigger) to insert profiles
CREATE POLICY "Service role can insert profiles" 
ON public.profiles 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Also allow anon role for the trigger function context
CREATE POLICY "System can insert new user profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id IN (SELECT id FROM auth.users WHERE id = profiles.id));