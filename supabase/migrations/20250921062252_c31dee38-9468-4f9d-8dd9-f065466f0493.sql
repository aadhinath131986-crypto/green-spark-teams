-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  team_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table for available eco activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL,
  icon TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table for activity submissions
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  points_awarded INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for activities
CREATE POLICY "Anyone can view activities" ON public.activities FOR SELECT USING (active = true);

-- Create RLS policies for user_activities
CREATE POLICY "Users can view all user activities" ON public.user_activities FOR SELECT USING (true);
CREATE POLICY "Users can insert own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activities" ON public.user_activities FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update user points when activity is approved
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changed to approved and points weren't awarded yet
    IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.points_awarded = 0 THEN
        -- Get points from activity
        SELECT points INTO NEW.points_awarded FROM activities WHERE id = NEW.activity_id;
        
        -- Update user's total points
        UPDATE profiles 
        SET points = points + NEW.points_awarded,
            updated_at = NOW()
        WHERE id = NEW.user_id;
        
        -- Set reviewed timestamp
        NEW.reviewed_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating points
CREATE TRIGGER update_user_points_trigger
    BEFORE UPDATE ON public.user_activities
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_points();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample activities for this week
INSERT INTO public.activities (title, description, points, icon, week_start, week_end) VALUES
('Recycle Plastic Bottles', 'Collect and recycle at least 5 plastic bottles', 10, 'recycle', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
('Plant a Tree', 'Plant a tree or seedling in your community', 25, 'tree-pine', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
('Use Public Transport', 'Use public transportation instead of driving for one day', 15, 'bus', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
('Energy Conservation', 'Unplug electronics when not in use for a full day', 8, 'zap-off', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE),
('Compost Food Scraps', 'Start composting organic waste', 12, 'leaf', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE);