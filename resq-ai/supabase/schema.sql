-- ============================================================
-- RESQ AI – PostgreSQL Database Schema (Supabase)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('citizen', 'admin')) DEFAULT 'citizen',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT CHECK (category IN ('fire', 'road_accident', 'medical', 'flood', 'building_collapse', 'other')) NOT NULL,
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('reported', 'pending', 'verified', 'in_progress', 'resolved')) DEFAULT 'reported',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location TEXT NOT NULL,
    affected_people INTEGER DEFAULT 1,
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT NOT NULL,
    ai_summary TEXT,
    ai_confidence DOUBLE PRECISION,
    ai_risk_indicators JSONB DEFAULT '[]'::jsonb,
    ai_recommended_actions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    response_started_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. INCIDENT MEDIA
CREATE TABLE IF NOT EXISTS public.incident_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'audio')) DEFAULT 'image',
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RESPONSE TEAMS
CREATE TABLE IF NOT EXISTS public.response_teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('ambulance', 'fire_rescue', 'medical_team', 'disaster_rescue')) NOT NULL,
    status TEXT CHECK (status IN ('available', 'assigned', 'offline')) DEFAULT 'available',
    location TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    members_count INTEGER DEFAULT 4,
    contact_phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.response_teams(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('dispatched', 'on_scene', 'completed')) DEFAULT 'dispatched',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'warning', 'critical', 'success')) DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. INCIDENT HISTORY (AUDIT LOG)
CREATE TABLE IF NOT EXISTS public.incident_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details TEXT,
    performed_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. INCIDENT VERIFICATIONS
CREATE TABLE IF NOT EXISTS public.incident_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON public.incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_coordinates ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_history ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- Profiles: Users can view their own profile; admins can view all
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Incidents: Anyone can submit incidents, all can view (for emergency awareness)
CREATE POLICY "Anyone can view incidents" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "Anyone can report an incident" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can update incidents" ON public.incidents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Teams: Everyone can view teams, only admins can modify
CREATE POLICY "Teams viewable by everyone" ON public.response_teams FOR SELECT USING (true);
CREATE POLICY "Admins manage teams" ON public.response_teams FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
