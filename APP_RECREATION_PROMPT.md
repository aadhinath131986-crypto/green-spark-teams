# GreenSpark - Comprehensive App Recreation Prompt

## 🎯 App Overview

Create **GreenSpark**, a community-driven sustainability platform for the UAE that gamifies eco-friendly actions through weekly challenges, points, and leaderboards. Users complete real-world environmental tasks, upload proof, earn GreenPoints, and compete to become Green Champions.

---

## 🛠️ Technical Stack

**Frontend:**
- React 18.3+ with TypeScript
- Vite for build tooling
- React Router DOM for routing
- Tailwind CSS for styling
- Shadcn/ui component library
- Lucide React for icons
- React Hook Form + Zod for validation
- Capacitor Camera for photo capture

**Backend:**
- Supabase (PostgreSQL database)
- Supabase Authentication (email/password)
- Supabase Storage (image uploads)
- Row Level Security (RLS) policies

---

## 🎨 Design System

**Color Palette (HSL):**
- Primary Green: `150 80% 40%`
- Secondary Cyan: `200 90% 50%`
- Accent Teal: `170 60% 50%`
- Background: `150 30% 98%`
- Success: `150 80% 40%`
- Warning: `45 90% 55%`

**Gradients:**
- Hero Gradient: `linear-gradient(135deg, hsl(150 80% 40%) 0%, hsl(170 70% 45%) 50%, hsl(190 80% 50%) 100%)`
- Success Gradient: `linear-gradient(to bottom right, hsl(150 70% 50%) 0%, hsl(150 80% 40%) 100%)`

**Shadows:**
- Soft: `0 2px 8px rgba(0, 0, 0, 0.04)`
- Medium: `0 4px 16px rgba(0, 0, 0, 0.08)`
- Strong: `0 8px 32px rgba(0, 0, 0, 0.12)`

**Border Radius:** `0.75rem` (12px)

**Design Principles:**
- Modern, clean interface with minimal white space
- Gradient buttons and hero sections
- Smooth hover transitions (scale, opacity)
- Card-based layouts with shadows
- Sticky navigation header with backdrop blur
- Responsive design (mobile-first)

---

## 🗄️ Database Schema

### Tables:

**1. profiles**
```sql
- id: uuid (primary key, references auth.users)
- email: text (not null)
- username: text (not null)
- points: integer (default 0)
- team_name: text (nullable)
- avatar_url: text (nullable)
- created_at: timestamp with time zone (default now())
- updated_at: timestamp with time zone (default now())
```

**2. activities**
```sql
- id: uuid (primary key, default uuid_generate_v4())
- title: text (not null)
- description: text (not null)
- points: integer (not null)
- icon: text (not null)
- week_start: date (not null)
- week_end: date (not null)
- active: boolean (default true)
- created_at: timestamp with time zone (default now())
```

**3. user_activities**
```sql
- id: uuid (primary key, default uuid_generate_v4())
- user_id: uuid (foreign key to profiles.id)
- activity_id: uuid (foreign key to activities.id)
- proof_image_url: text (nullable)
- description: text (nullable)
- status: text (default 'pending') - values: 'pending', 'approved', 'rejected'
- points_awarded: integer (default 0)
- submitted_at: timestamp with time zone (default now())
- reviewed_at: timestamp with time zone (nullable)
```

**4. general_submissions**
```sql
- id: uuid (primary key, default gen_random_uuid())
- full_name: text (not null)
- phone_number: text (not null)
- email: text (nullable)
- reason: text (not null)
- photo_url: text (not null)
- status: text (default 'pending')
- points_awarded: integer (default 0)
- submitted_at: timestamp with time zone (default now())
- reviewed_at: timestamp with time zone (nullable)
```

**5. user_roles**
```sql
- id: uuid (primary key, default gen_random_uuid())
- user_id: uuid (foreign key to auth.users)
- role: app_role (enum: 'admin', 'moderator', 'user')
- created_at: timestamp with time zone (default now())
- UNIQUE constraint on (user_id, role)
```

### Enums:
```sql
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
```

### Views:

**leaderboard_profiles**
```sql
SELECT 
  id, username, team_name, points, avatar_url, created_at
FROM profiles
ORDER BY points DESC
```

### Functions:

**has_role(user_id uuid, role app_role)**
```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**handle_new_user()**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**update_user_points()**
```sql
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.points_awarded = 0 THEN
    SELECT points INTO NEW.points_awarded FROM public.activities WHERE id = NEW.activity_id;
    
    UPDATE public.profiles 
    SET points = points + NEW.points_awarded,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger
CREATE TRIGGER update_user_activity_points
  BEFORE UPDATE ON user_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points();
```

### Storage Buckets:

**activity-proofs** (Private bucket)
- For challenge submission photos
- RLS policies: Users can upload/view own files

**general-submissions** (Private bucket)
- For general eco-action submissions
- Anyone can insert, admins can view all

---

## 🔐 Row Level Security (RLS) Policies

**profiles:**
- Users can view only their own profile
- Users can insert/update only their own profile
- System can insert via trigger

**activities:**
- Everyone can view active activities
- Only admins can insert/update/delete

**user_activities:**
- Users can view/insert/update only their own activities
- Admins can view/update all activities

**general_submissions:**
- Anyone can insert (public submissions)
- Admins can view/update all submissions

**user_roles:**
- Users can view their own roles
- Admins can view/insert all roles

---

## ✨ Core Features

### 1. Landing Page (/)

**Header:**
- Sticky header with backdrop blur
- GreenSpark logo with gradient
- User status: 
  - Logged out: "Join Community" button
  - Logged in: Points badge + Profile dropdown + Admin button (if admin)

**Hero Section:**
- Large title: "Turn Eco-Actions into Green Champion Status"
- Subtitle explaining the platform
- Two CTAs: "Get Started" / "View Challenges" and "Share Your Action"
- Badge: "🌍 Community-Driven Sustainability"

**Weekly Activities Section:**
- Grid of 6 challenge cards
- Each card shows:
  - Challenge icon
  - Title and description
  - Points reward badge
  - Participant count
  - Time remaining
  - Difficulty level (Easy/Medium/Hard)
  - "Submit Now" or "Join Challenge" button
- Pre-defined challenges:
  1. **Project Evergreen** - Plant native trees (20 pts, Medium)
  2. **Trash to Treasure** - Recycling drives (10 pts, Easy)
  3. **Blue Horizon Cleanup** - Beach cleanup (15 pts, Easy)
  4. **Solar Switch Challenge** - Solar alternatives (25 pts, Hard)
  5. **Water Warrior** - Water conservation (15 pts, Medium)
  6. **Zero Waste Week** - 7-day waste-free (30 pts, Hard)

**Leaderboard Section:**
- Title: "Become a Green Champion"
- Top 5 leaderboard entries
- Each entry shows: rank badge, avatar, username/team, progress bar, points
- Top 3 have special styling (gold, silver, bronze themes)
- "View Full Rankings" button
- Leaderboard image with "Win Prizes!" badge

**Community Feed Preview:**
- Grid of 3 sample activity cards
- Each shows: user info, activity description, photo, points earned
- Inspires participation

**Sponsors & Rewards:**
- 3 sponsor cards showing:
  - Company name/logo
  - Monthly prize offering
- Clean white cards with shadow

**Call to Action:**
- Green-to-cyan gradient background
- "Ready to Make an Impact?"
- "Start Your Journey Today" button

**Footer:**
- Two columns: Quick Links, Connect
- Copyright notice
- Minimal, clean design

### 2. Authentication System

**Auth Modal:**
- Dual mode: Login / Sign Up
- Sign Up fields:
  - Username (required)
  - Email (required, validated)
  - Password (required, min 6 chars)
- Login fields:
  - Email
  - Password
- Input validation using Zod
- Error handling with toast notifications
- Auto-redirect after successful auth
- Smooth transitions between modes

**Session Management:**
- Use Supabase auth.onAuthStateChange
- Store both user and session in context
- Auto-refresh tokens
- Persistent sessions via localStorage

### 3. Challenge Submission Flow

**Activity Submission Modal:**
- Shows selected challenge details
- Photo upload options:
  - Take photo with camera (Capacitor Camera)
  - Choose from gallery
  - Browse files
- Optional description field (max 500 chars)
- Image validation:
  - Max 5MB
  - Formats: JPEG, PNG, WebP
- Upload to Supabase Storage (activity-proofs bucket)
- Insert record into user_activities table
- Status: 'pending' by default
- Success toast: "Activity submitted! Points will be added once reviewed"

### 4. General Submission Flow

**General Submission Modal:**
- For non-registered users or ad-hoc eco-actions
- Fields:
  - Full name (required)
  - Phone number (required)
  - Email (optional)
  - Description of action (required)
  - Photo (required)
- Upload to general-submissions bucket
- Insert into general_submissions table
- Success notification

### 5. User Profile

**Profile Popover:**
- Avatar (if set)
- Username, email
- Total points display
- "My Activities" section showing recent submissions with status
- "Edit Profile" button (future feature)
- "Sign Out" button

**Profile Management:**
- Fetch user data from profiles table
- Display user activities with status badges
- Real-time points updates

### 6. Admin Dashboard (/admin)

**Access Control:**
- Check user_roles table for admin role
- Redirect non-admins to home
- Show "Access Denied" toast if unauthorized

**Two Tabs:**

**Tab 1: Challenge Submissions**
- List all pending user_activities
- Each card shows:
  - Activity title
  - User info (username, email)
  - Description
  - Proof photo
  - Submission timestamp
- Actions: Approve (awards points) or Reject
- Approval triggers point update via database trigger

**Tab 2: General Submissions**
- List all pending general_submissions
- Each card shows:
  - Submitter name, phone, email
  - Action description
  - Photo
  - Submission timestamp
- Actions: Approve (+10 pts) or Reject

**Features:**
- Real-time data fetching
- Toast notifications for actions
- Loading states
- "Back to Home" button

### 7. Leaderboard System

**Data Source:**
- Query leaderboard_profiles view
- Order by points DESC
- Limit to top 10

**Display:**
- Show top 5 on home page
- Full leaderboard accessible via button
- Each entry shows:
  - Rank number
  - Avatar
  - Username or team name
  - Points with progress bar
  - Special styling for top 3

**Updates:**
- Refresh after activity approval
- Show default data if database empty

---

## 🔒 Security Requirements

**Critical Rules:**
1. **Role-based access:** Never store roles in profiles table - use separate user_roles table
2. **RLS policies:** All tables must have RLS enabled
3. **Input validation:** Use Zod schemas for all form inputs
4. **Image validation:** Check file size and type before upload
5. **Admin verification:** Always verify admin role server-side using has_role() function
6. **Signed URLs:** Use signed URLs for private storage buckets
7. **SQL injection prevention:** Never use raw SQL - use Supabase client methods
8. **Authentication checks:** Require auth.uid() in RLS policies for user-specific data

---

## 📱 Responsive Design

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Considerations:**
- Stack hero CTAs vertically
- Single column activity grid
- Collapsible navigation
- Touch-friendly button sizes
- Optimized image sizes

---

## 🎭 User Experience

**Loading States:**
- Spinners for async operations
- Skeleton screens for data fetching
- Disabled buttons during submission

**Toast Notifications:**
- Success: Green theme
- Error: Red theme
- Info: Blue theme
- Position: Top-right
- Auto-dismiss after 3-5 seconds

**Animations:**
- Hover scale on cards (1.02x)
- Smooth transitions (300ms)
- Backdrop blur effects
- Gradient animations

**Error Handling:**
- Friendly error messages
- Validation feedback
- Network error recovery
- Graceful fallbacks

---

## 📋 Implementation Checklist

**Phase 1: Setup**
- [ ] Initialize React + Vite project
- [ ] Install dependencies (Supabase, Tailwind, Shadcn, etc.)
- [ ] Configure Tailwind with custom design tokens
- [ ] Set up Supabase project and get credentials

**Phase 2: Database**
- [ ] Create all tables with proper types
- [ ] Set up enums (app_role)
- [ ] Create leaderboard_profiles view
- [ ] Implement database functions (has_role, handle_new_user, update_user_points)
- [ ] Configure all RLS policies
- [ ] Create storage buckets with policies

**Phase 3: Authentication**
- [ ] Create AuthContext with session management
- [ ] Build AuthModal component (login/signup)
- [ ] Set up auth triggers for profile creation
- [ ] Implement sign out functionality
- [ ] Add email redirect URLs

**Phase 4: Core Features**
- [ ] Build Index page with all sections
- [ ] Create ActivitySubmission component
- [ ] Create GeneralSubmission component
- [ ] Implement UserProfile component
- [ ] Add camera integration (Capacitor)
- [ ] Build leaderboard display

**Phase 5: Admin Panel**
- [ ] Create Admin page with routing
- [ ] Implement admin role checking
- [ ] Build submission review UI
- [ ] Add approve/reject functionality
- [ ] Set up real-time updates

**Phase 6: Polish**
- [ ] Add all animations and transitions
- [ ] Implement responsive design
- [ ] Add loading states
- [ ] Configure toast notifications
- [ ] Test all user flows
- [ ] Optimize images and performance

**Phase 7: Testing**
- [ ] Test authentication flow
- [ ] Test activity submission
- [ ] Test admin approval
- [ ] Verify points calculation
- [ ] Check RLS policies
- [ ] Test on mobile devices

---

## 🚀 Deployment

**Supabase:**
- Deploy database migrations
- Configure authentication providers
- Set up storage buckets
- Add production URLs to redirect list

**Frontend:**
- Build production bundle
- Deploy to hosting platform (Vercel, Netlify, etc.)
- Configure environment variables
- Set up custom domain (optional)

---

## 📝 Additional Notes

**Pre-populated Data:**
- Add sample activities to activities table
- Create at least one admin user via user_roles
- Add default leaderboard entries for testing

**Future Enhancements:**
- Social sharing features
- Team competitions
- Monthly challenges reset
- Push notifications
- Achievement badges
- Community forum
- Ecosolutions innovation challenge section
- Integration with local authorities
- Sponsor dashboard
- Advanced analytics

**Documentation:**
- User guide for participants
- Admin manual
- API documentation
- Database schema diagrams

---

## 🎯 Success Criteria

The app is complete when:
1. Users can sign up and log in securely
2. Users can view and join weekly challenges
3. Users can submit photos and earn pending points
4. Admins can review and approve/reject submissions
5. Points are automatically awarded on approval
6. Leaderboard updates in real-time
7. General submissions work for non-registered users
8. All pages are responsive and performant
9. Security policies prevent unauthorized access
10. UI matches the modern, clean design system

---

**Build this app with attention to detail, focusing on security, user experience, and the environmental mission of making sustainability engaging and rewarding for the UAE community.**
