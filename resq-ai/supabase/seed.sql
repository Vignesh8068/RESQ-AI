-- ============================================================
-- RESQ AI – Initial Seed Data (Supabase)
-- ============================================================

-- Seed Response Teams
INSERT INTO public.response_teams (name, type, status, location, latitude, longitude, members_count, contact_phone)
VALUES
    ('Fire & Rescue Unit Alpha', 'fire_rescue', 'available', 'Central Fire Station, Chennai', 13.0878, 80.2785, 8, '+91 44 2345 6789'),
    ('Medical Response Team Beta', 'medical_team', 'available', 'Government General Hospital, Chennai', 13.0732, 80.2609, 5, '+91 44 2534 2345'),
    ('Ambulance Squad Delta', 'ambulance', 'available', 'GEM Hospital, Chennai', 13.0631, 80.2411, 3, '108'),
    ('NDRF Disaster Unit', 'disaster_rescue', 'available', 'NDRF Base, Avadi, Chennai', 13.1120, 80.1072, 15, '+91 44 2630 8900'),
    ('Fire & Rescue Unit Bravo', 'fire_rescue', 'offline', 'Adyar Fire Station, Chennai', 13.0067, 80.2574, 7, '101')
ON CONFLICT DO NOTHING;
