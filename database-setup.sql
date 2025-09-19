-- GreenPoints Database Setup Script
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    points INTEGER DEFAULT 0,
    team_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    icon TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_activities table (for tracking submissions)
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
    proof_image_url TEXT,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    points_awarded INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, activity_id)
);

-- Create storage bucket for activity proof images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('activity-proofs', 'activity-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Activities policies (public read)
CREATE POLICY "Anyone can view activities" ON activities
    FOR SELECT USING (active = true);

-- User activities policies
CREATE POLICY "Users can view all user activities" ON user_activities
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own activities" ON user_activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" ON user_activities
    FOR UPDATE USING (auth.uid() = user_id);

-- Storage policies for activity proofs
CREATE POLICY "Anyone can view activity proofs" ON storage.objects
    FOR SELECT USING (bucket_id = 'activity-proofs');

CREATE POLICY "Authenticated users can upload activity proofs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'activity-proofs' 
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update own activity proofs" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'activity-proofs' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Insert sample activities
INSERT INTO activities (title, description, points, icon, week_start, week_end) VALUES
    ('Bottle Recycling Challenge', 'Collect and recycle plastic bottles in your neighborhood', 5, 'recycle', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
    ('Community Tree Planting', 'Plant native trees in designated community areas', 15, 'tree', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
    ('Park Cleanup Drive', 'Help clean local parks and public spaces', 10, 'heart', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
    ('Plastic-Free Shopping', 'Shop without using single-use plastic bags or containers', 8, 'shopping', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days'),
    ('Public Transport Day', 'Use public transport instead of personal vehicles', 6, 'bus', CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT DO NOTHING;

-- Function to automatically update points when activity is approved
CREATE OR REPLACE FUNCTION update_user_points()
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

-- Create trigger for automatic point updates
DROP TRIGGER IF EXISTS trigger_update_user_points ON user_activities;
CREATE TRIGGER trigger_update_user_points
    BEFORE UPDATE ON user_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_user_points();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();