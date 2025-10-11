-- Fix Critical Security Issues

-- 1. Fix user_activities public exposure - restrict to own activities only
DROP POLICY IF EXISTS "Users can view all user activities" ON user_activities;

CREATE POLICY "Users can view own activities"
ON user_activities FOR SELECT
USING (auth.uid() = user_id);

-- 2. Make activity-proofs storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'activity-proofs';

-- Update storage policies
DROP POLICY IF EXISTS "Anyone can view activity proofs" ON storage.objects;

CREATE POLICY "Users can view own proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'activity-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Fix update_user_points function - add SECURITY DEFINER and search_path
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If status changed to approved and points weren't awarded yet
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.points_awarded = 0 THEN
    -- Get points from activity
    SELECT points INTO NEW.points_awarded FROM public.activities WHERE id = NEW.activity_id;
    
    -- Update user's total points
    UPDATE public.profiles 
    SET points = points + NEW.points_awarded,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Set reviewed timestamp
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Fix handle_new_user function - add search_path protection
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, points)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    0
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;