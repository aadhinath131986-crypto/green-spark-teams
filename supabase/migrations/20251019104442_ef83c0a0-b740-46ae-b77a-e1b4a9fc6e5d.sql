-- Add gamification and tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS total_waste_kg DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak_freeze_tokens INTEGER DEFAULT 0;

-- Create geo_quests table for location-based challenges
CREATE TABLE IF NOT EXISTS public.geo_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_lat DECIMAL(10,8) NOT NULL,
  location_lng DECIMAL(11,8) NOT NULL,
  location_name TEXT NOT NULL,
  points_multiplier INTEGER DEFAULT 10,
  badge_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AR trophies table
CREATE TABLE IF NOT EXISTS public.ar_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  required_kg DECIMAL(10,2) NOT NULL,
  icon TEXT NOT NULL,
  ar_model_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_trophies junction table
CREATE TABLE IF NOT EXISTS public.user_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trophy_id UUID REFERENCES public.ar_trophies(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, trophy_id)
);

-- Create monthly_leaderboard_snapshots for history
CREATE TABLE IF NOT EXISTS public.monthly_leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  points INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Enable RLS on new tables
ALTER TABLE public.geo_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies for geo_quests
CREATE POLICY "Anyone can view active geo quests"
ON public.geo_quests FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage geo quests"
ON public.geo_quests FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for ar_trophies
CREATE POLICY "Anyone can view trophies"
ON public.ar_trophies FOR SELECT
USING (true);

CREATE POLICY "Admins can manage trophies"
ON public.ar_trophies FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_trophies
CREATE POLICY "Users can view own trophies"
ON public.user_trophies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert trophies"
ON public.user_trophies FOR INSERT
WITH CHECK (true);

-- RLS policies for monthly snapshots
CREATE POLICY "Anyone can view leaderboard snapshots"
ON public.monthly_leaderboard_snapshots FOR SELECT
USING (true);

CREATE POLICY "System can insert snapshots"
ON public.monthly_leaderboard_snapshots FOR INSERT
WITH CHECK (true);

-- Insert default AR trophies
INSERT INTO public.ar_trophies (name, description, tier, required_kg, icon) VALUES
('Bronze Guardian', 'Removed 100kg of waste from the environment', 'bronze', 100, '🥉'),
('Silver Champion', 'Removed 500kg of waste from the environment', 'silver', 500, '🥈'),
('Gold Legend', 'Removed 1000kg of waste from the environment', 'gold', 1000, '🥇'),
('Platinum Hero', 'Removed 5000kg of waste from the environment', 'platinum', 5000, '💎')
ON CONFLICT DO NOTHING;

-- Function to update streak when user completes activity
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_last_activity DATE;
  user_current_streak INTEGER;
BEGIN
  -- Only process approved activities
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Get user's current streak and last activity
    SELECT last_activity_date, current_streak 
    INTO user_last_activity, user_current_streak
    FROM public.profiles 
    WHERE id = NEW.user_id;
    
    -- Update streak logic
    IF user_last_activity IS NULL THEN
      -- First activity ever
      UPDATE public.profiles 
      SET current_streak = 1,
          longest_streak = 1,
          last_activity_date = CURRENT_DATE
      WHERE id = NEW.user_id;
    ELSIF user_last_activity = CURRENT_DATE THEN
      -- Same day activity, no streak change
      NULL;
    ELSIF user_last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Consecutive day, increment streak
      UPDATE public.profiles 
      SET current_streak = current_streak + 1,
          longest_streak = GREATEST(longest_streak, current_streak + 1),
          last_activity_date = CURRENT_DATE
      WHERE id = NEW.user_id;
    ELSE
      -- Streak broken, reset to 1
      UPDATE public.profiles 
      SET current_streak = 1,
          last_activity_date = CURRENT_DATE
      WHERE id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for streak updates
DROP TRIGGER IF EXISTS update_streak_on_activity ON public.user_activities;
CREATE TRIGGER update_streak_on_activity
  AFTER UPDATE ON public.user_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_streak();

-- Function to check and award trophies
CREATE OR REPLACE FUNCTION public.check_and_award_trophies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  trophy RECORD;
BEGIN
  -- Check all trophies user qualifies for
  FOR trophy IN 
    SELECT t.id, t.required_kg
    FROM public.ar_trophies t
    WHERE t.required_kg <= NEW.total_waste_kg
    AND NOT EXISTS (
      SELECT 1 FROM public.user_trophies ut 
      WHERE ut.user_id = NEW.id AND ut.trophy_id = t.id
    )
  LOOP
    -- Award trophy
    INSERT INTO public.user_trophies (user_id, trophy_id)
    VALUES (NEW.id, trophy.id)
    ON CONFLICT (user_id, trophy_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for trophy awards
DROP TRIGGER IF EXISTS award_trophies_on_waste_update ON public.profiles;
CREATE TRIGGER award_trophies_on_waste_update
  AFTER UPDATE OF total_waste_kg ON public.profiles
  FOR EACH ROW
  WHEN (NEW.total_waste_kg > OLD.total_waste_kg)
  EXECUTE FUNCTION public.check_and_award_trophies();

-- Add estimated_kg to user_activities for waste tracking
ALTER TABLE public.user_activities 
ADD COLUMN IF NOT EXISTS estimated_kg DECIMAL(10,2) DEFAULT 0;

-- Update the existing points function to also track waste
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.points_awarded = 0 THEN
    SELECT points INTO NEW.points_awarded FROM public.activities WHERE id = NEW.activity_id;
    
    -- Update user's total points and waste
    UPDATE public.profiles 
    SET points = points + NEW.points_awarded,
        total_waste_kg = total_waste_kg + COALESCE(NEW.estimated_kg, 0),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;