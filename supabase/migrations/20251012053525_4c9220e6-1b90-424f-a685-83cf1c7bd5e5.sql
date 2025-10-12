-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create general_submissions table for non-challenge photo uploads
CREATE TABLE public.general_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  reason TEXT NOT NULL,
  photo_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  points_awarded INTEGER DEFAULT 0
);

-- Enable RLS on general_submissions
ALTER TABLE public.general_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can insert general submissions (public form)
CREATE POLICY "Anyone can submit general submissions"
ON public.general_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS Policy: Admins can view all general submissions
CREATE POLICY "Admins can view all general submissions"
ON public.general_submissions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policy: Admins can update general submissions
CREATE POLICY "Admins can update general submissions"
ON public.general_submissions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update user_activities RLS to allow admins to view all
CREATE POLICY "Admins can view all user activities"
ON public.user_activities
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update user_activities RLS to allow admins to update
CREATE POLICY "Admins can update all user activities"
ON public.user_activities
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for general submissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('general-submissions', 'general-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for general submissions
CREATE POLICY "Anyone can upload to general submissions"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'general-submissions');

CREATE POLICY "Admins can view general submission files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'general-submissions' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own uploads in general submissions"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'general-submissions');