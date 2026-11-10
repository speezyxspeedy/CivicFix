-- ==============================================================================
-- CIVICFIX — Smart Citizen Issue Reporting & Resolution Management Platform
-- Database Schema, Functions, Row Level Security (RLS) & Storage Configuration
-- PostgreSQL / Supabase
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CITIZEN', 'ADMIN', 'WORKER');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM (
        'SUBMITTED',
        'UNDER REVIEW',
        'VERIFIED',
        'ASSIGNED',
        'IN PROGRESS',
        'RESOLUTION SUBMITTED',
        'RESOLVED',
        'REOPENED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE assignment_status AS ENUM ('PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'REASSIGNED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE resolution_decision AS ENUM ('APPROVED', 'REJECTED', 'ADDITIONAL_INFO_REQUESTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'CITIZEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_name TEXT DEFAULT 'AlertCircle',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sla_critical_hours INTEGER NOT NULL DEFAULT 24,
    sla_high_hours INTEGER NOT NULL DEFAULT 72,
    sla_medium_hours INTEGER NOT NULL DEFAULT 168, -- 7 days
    sla_low_hours INTEGER NOT NULL DEFAULT 336,    -- 14 days
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. COMPLAINT CODE SEQUENCE & FUNCTION
CREATE SEQUENCE IF NOT EXISTS complaint_code_seq START 100;

CREATE OR REPLACE FUNCTION public.generate_complaint_code()
RETURNS TEXT AS $$
DECLARE
    current_yr TEXT;
    next_num TEXT;
BEGIN
    current_yr := to_char(CURRENT_DATE, 'YYYY');
    next_num := LPAD(nextval('complaint_code_seq')::TEXT, 6, '0');
    RETURN 'CF-' || current_yr || '-' || next_num;
END;
$$ LANGUAGE plpgsql;

-- 6. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_code TEXT NOT NULL UNIQUE DEFAULT public.generate_complaint_code(),
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    locality VARCHAR(120) NOT NULL,
    street VARCHAR(150),
    landmark VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    priority complaint_priority NOT NULL DEFAULT 'MEDIUM',
    status complaint_status NOT NULL DEFAULT 'SUBMITTED',
    rejection_reason TEXT,
    internal_admin_notes TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON public.complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_locality ON public.complaints(locality);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_code ON public.complaints(complaint_code);

-- 7. COMPLAINT MEDIA TABLE (Photos for Before, During, After)
CREATE TABLE IF NOT EXISTS public.complaint_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    media_type TEXT NOT NULL CHECK (media_type IN ('BEFORE', 'DURING_WORK', 'AFTER', 'FEEDBACK')),
    storage_path TEXT NOT NULL,
    file_name TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_media_complaint ON public.complaint_media(complaint_id);

-- 8. WORKERS DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    worker_code TEXT UNIQUE,
    specialization VARCHAR(100) NOT NULL, -- e.g. Road Maintenance, Sanitation, Drainage, Electrical, Water Supply, General Maintenance
    assigned_area VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    availability BOOLEAN NOT NULL DEFAULT true,
    active_assignment_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE RESTRICT,
    assigned_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    accepted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status assignment_status NOT NULL DEFAULT 'PENDING',
    instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assignments_worker ON public.assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_complaint ON public.assignments(complaint_id);

-- 10. COMPLAINT UPDATES (Audit Timeline)
CREATE TABLE IF NOT EXISTS public.complaint_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    updated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    previous_status complaint_status,
    new_status complaint_status NOT NULL,
    update_note TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_updates_complaint ON public.complaint_updates(complaint_id);

-- 11. DUPLICATE LINKS TABLE
CREATE TABLE IF NOT EXISTS public.duplicate_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    related_complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    similarity_score NUMERIC(5,2),
    similarity_reason TEXT,
    reviewed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    decision TEXT NOT NULL CHECK (decision IN ('LINKED_AS_DUPLICATE', 'DISMISSED', 'RELATED_SUB_ISSUE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_duplicate_pair UNIQUE(primary_complaint_id, related_complaint_id)
);

-- 12. RESOLUTION REVIEWS TABLE (Admin Verification)
CREATE TABLE IF NOT EXISTS public.resolution_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE RESTRICT,
    reviewed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    decision resolution_decision NOT NULL,
    review_notes TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. CITIZEN FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
    citizen_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    quality_assessment TEXT,
    comment TEXT,
    photo_storage_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    related_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resolution_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get Current User Role securely
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles:
-- Users can read their own profile, Admins can read all profiles
CREATE POLICY "Profiles self view or admin view" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Profiles self update non-role" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

-- Categories:
-- Anyone can view active categories; only Admins can create/update
CREATE POLICY "Categories viewable by all authenticated" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Categories manageable only by admin" ON public.categories
    FOR ALL USING (public.current_user_role() = 'ADMIN');

-- Complaints:
-- Citizen can view own complaints. Admin can view all. Worker can view assigned complaints.
CREATE POLICY "Citizen view own complaints" ON public.complaints
    FOR SELECT USING (
        citizen_id = auth.uid()
        OR public.current_user_role() = 'ADMIN'
        OR (
            public.current_user_role() = 'WORKER'
            AND id IN (
                SELECT complaint_id FROM public.assignments a
                JOIN public.workers w ON a.worker_id = w.id
                WHERE w.profile_id = auth.uid()
            )
        )
    );

-- Citizens can only insert their own complaints
CREATE POLICY "Citizen insert own complaints" ON public.complaints
    FOR INSERT WITH CHECK (
        auth.uid() = citizen_id
        AND status = 'SUBMITTED'
    );

-- Only Admins and specialized functions can update complaint status/priority
CREATE POLICY "Admin update complaints" ON public.complaints
    FOR UPDATE USING (public.current_user_role() = 'ADMIN');

-- Complaint Media:
CREATE POLICY "View complaint media" ON public.complaint_media
    FOR SELECT USING (
        uploaded_by = auth.uid()
        OR public.current_user_role() = 'ADMIN'
        OR complaint_id IN (SELECT id FROM public.complaints WHERE citizen_id = auth.uid())
        OR complaint_id IN (
            SELECT complaint_id FROM public.assignments a
            JOIN public.workers w ON a.worker_id = w.id
            WHERE w.profile_id = auth.uid()
        )
    );

CREATE POLICY "Insert complaint media" ON public.complaint_media
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Workers directory:
CREATE POLICY "Workers viewable by Admin and self" ON public.workers
    FOR SELECT USING (profile_id = auth.uid() OR public.current_user_role() = 'ADMIN');

CREATE POLICY "Workers manageable by Admin" ON public.workers
    FOR ALL USING (public.current_user_role() = 'ADMIN');

-- Assignments:
CREATE POLICY "View assignments" ON public.assignments
    FOR SELECT USING (
        public.current_user_role() = 'ADMIN'
        OR worker_id IN (SELECT id FROM public.workers WHERE profile_id = auth.uid())
    );

CREATE POLICY "Admin manage assignments" ON public.assignments
    FOR ALL USING (public.current_user_role() = 'ADMIN');

CREATE POLICY "Worker update own assignment status" ON public.assignments
    FOR UPDATE USING (
        worker_id IN (SELECT id FROM public.workers WHERE profile_id = auth.uid())
    );

-- Complaint Updates:
CREATE POLICY "View complaint updates" ON public.complaint_updates
    FOR SELECT USING (
        (is_public = true AND complaint_id IN (SELECT id FROM public.complaints WHERE citizen_id = auth.uid()))
        OR public.current_user_role() = 'ADMIN'
        OR (
            public.current_user_role() = 'WORKER'
            AND complaint_id IN (
                SELECT complaint_id FROM public.assignments a
                JOIN public.workers w ON a.worker_id = w.id
                WHERE w.profile_id = auth.uid()
            )
        )
    );

-- Notifications:
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Feedback:
CREATE POLICY "Citizen view and manage own feedback" ON public.feedback
    FOR ALL USING (citizen_id = auth.uid());

CREATE POLICY "Admin view all feedback" ON public.feedback
    FOR SELECT USING (public.current_user_role() = 'ADMIN');

-- ==============================================================================
-- 17. SECURE DATABASE RPC FUNCTIONS
-- ==============================================================================

-- Admin: Verify complaint
CREATE OR REPLACE FUNCTION public.rpc_verify_complaint(
    p_complaint_id UUID,
    p_priority complaint_priority,
    p_admin_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_old_status complaint_status;
    v_citizen_id UUID;
BEGIN
    IF public.current_user_role() != 'ADMIN' THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.';
    END IF;

    SELECT status, citizen_id INTO v_old_status, v_citizen_id
    FROM public.complaints WHERE id = p_complaint_id;

    UPDATE public.complaints
    SET status = 'VERIFIED',
        priority = p_priority,
        internal_admin_notes = p_admin_notes,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_complaint_id;

    INSERT INTO public.complaint_updates (
        complaint_id, updated_by, previous_status, new_status, update_note
    ) VALUES (
        p_complaint_id, auth.uid(), v_old_status, 'VERIFIED',
        'Complaint verified with priority ' || p_priority::text
    );

    -- Notify Citizen
    INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
    VALUES (
        v_citizen_id,
        'Issue Report Verified',
        'Your civic complaint has been verified by the municipal desk and marked for action.',
        p_complaint_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Reject complaint
CREATE OR REPLACE FUNCTION public.rpc_reject_complaint(
    p_complaint_id UUID,
    p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
    v_old_status complaint_status;
    v_citizen_id UUID;
BEGIN
    IF public.current_user_role() != 'ADMIN' THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.';
    END IF;

    IF p_reason IS NULL OR trim(p_reason) = '' THEN
        RAISE EXCEPTION 'Rejection reason is mandatory.';
    END IF;

    SELECT status, citizen_id INTO v_old_status, v_citizen_id
    FROM public.complaints WHERE id = p_complaint_id;

    UPDATE public.complaints
    SET status = 'REJECTED',
        rejection_reason = p_reason,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_complaint_id;

    INSERT INTO public.complaint_updates (
        complaint_id, updated_by, previous_status, new_status, update_note
    ) VALUES (
        p_complaint_id, auth.uid(), v_old_status, 'REJECTED',
        'Report rejected: ' || p_reason
    );

    -- Notify Citizen
    INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
    VALUES (
        v_citizen_id,
        'Issue Report Declined',
        'Your report was reviewed and marked as rejected. Reason: ' || p_reason,
        p_complaint_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Assign Worker
CREATE OR REPLACE FUNCTION public.rpc_assign_worker(
    p_complaint_id UUID,
    p_worker_id UUID,
    p_instructions TEXT
)
RETURNS VOID AS $$
DECLARE
    v_old_status complaint_status;
    v_worker_profile UUID;
    v_citizen_id UUID;
BEGIN
    IF public.current_user_role() != 'ADMIN' THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.';
    END IF;

    SELECT status, citizen_id INTO v_old_status, v_citizen_id
    FROM public.complaints WHERE id = p_complaint_id;

    SELECT profile_id INTO v_worker_profile
    FROM public.workers WHERE id = p_worker_id;

    -- Update or Insert assignment
    INSERT INTO public.assignments (
        complaint_id, worker_id, assigned_by, instructions, status
    ) VALUES (
        p_complaint_id, p_worker_id, auth.uid(), p_instructions, 'PENDING'
    );

    -- Increment active worker assignments
    UPDATE public.workers
    SET active_assignment_count = active_assignment_count + 1
    WHERE id = p_worker_id;

    -- Update complaint status
    UPDATE public.complaints
    SET status = 'ASSIGNED',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_complaint_id;

    INSERT INTO public.complaint_updates (
        complaint_id, updated_by, previous_status, new_status, update_note
    ) VALUES (
        p_complaint_id, auth.uid(), v_old_status, 'ASSIGNED',
        'Field operations team assigned to site.'
    );

    -- Notify worker
    INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
    VALUES (
        v_worker_profile,
        'New Task Assignment',
        'You have been assigned to complaint #' || p_complaint_id::text,
        p_complaint_id
    );

    -- Notify citizen
    INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
    VALUES (
        v_citizen_id,
        'Field Team Dispatched',
        'A field worker has been assigned to investigate and resolve your report.',
        p_complaint_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Worker: Accept and Start Task
CREATE OR REPLACE FUNCTION public.rpc_start_work(
    p_complaint_id UUID,
    p_progress_note TEXT
)
RETURNS VOID AS $$
DECLARE
    v_worker_id UUID;
    v_citizen_id UUID;
    v_old_status complaint_status;
BEGIN
    SELECT id INTO v_worker_id FROM public.workers WHERE profile_id = auth.uid();
    IF v_worker_id IS NULL THEN
        RAISE EXCEPTION 'User is not registered as an active field worker.';
    END IF;

    SELECT status, citizen_id INTO v_old_status, v_citizen_id
    FROM public.complaints WHERE id = p_complaint_id;

    UPDATE public.assignments
    SET accepted_at = coalesce(accepted_at, timezone('utc'::text, now())),
        status = 'IN_PROGRESS'
    WHERE complaint_id = p_complaint_id AND worker_id = v_worker_id;

    UPDATE public.complaints
    SET status = 'IN PROGRESS',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_complaint_id;

    INSERT INTO public.complaint_updates (
        complaint_id, updated_by, previous_status, new_status, update_note
    ) VALUES (
        p_complaint_id, auth.uid(), v_old_status, 'IN PROGRESS',
        coalesce(p_progress_note, 'Worker commenced repair and field operations on site.')
    );

    INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
    VALUES (
        v_citizen_id,
        'Work In Progress',
        'Field operations have started on your reported issue: ' || coalesce(p_progress_note, 'Repairs underway.'),
        p_complaint_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Worker: Submit Resolution Evidence
CREATE OR REPLACE FUNCTION public.rpc_submit_resolution(
    p_complaint_id UUID,
    p_completion_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_worker_id UUID;
    v_old_status complaint_status;
    v_admin_rec RECORD;
BEGIN
    SELECT id INTO v_worker_id FROM public.workers WHERE profile_id = auth.uid();
    IF v_worker_id IS NULL THEN
        RAISE EXCEPTION 'User is not registered as an active field worker.';
    END IF;

    SELECT status INTO v_old_status FROM public.complaints WHERE id = p_complaint_id;

    UPDATE public.assignments
    SET completed_at = timezone('utc'::text, now()),
        status = 'COMPLETED'
    WHERE complaint_id = p_complaint_id AND worker_id = v_worker_id;

    UPDATE public.complaints
    SET status = 'RESOLUTION SUBMITTED',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_complaint_id;

    INSERT INTO public.complaint_updates (
        complaint_id, updated_by, previous_status, new_status, update_note
    ) VALUES (
        p_complaint_id, auth.uid(), v_old_status, 'RESOLUTION SUBMITTED',
        'Field work completed. Resolution evidence submitted for administrative review: ' || p_completion_notes
    );

    -- Notify Admins
    FOR v_admin_rec IN SELECT id FROM public.profiles WHERE role = 'ADMIN' LOOP
        INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
        VALUES (
            v_admin_rec.id,
            'Resolution Awaiting Verification',
            'Worker has submitted resolution evidence for complaint #' || p_complaint_id::text,
            p_complaint_id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin: Approve or Reject Resolution
CREATE OR REPLACE FUNCTION public.rpc_review_resolution(
    p_complaint_id UUID,
    p_decision resolution_decision,
    p_review_notes TEXT
)
RETURNS VOID AS $$
DECLARE
    v_old_status complaint_status;
    v_citizen_id UUID;
    v_worker_id UUID;
    v_worker_profile UUID;
BEGIN
    IF public.current_user_role() != 'ADMIN' THEN
        RAISE EXCEPTION 'Unauthorized: Administrator privileges required.';
    END IF;

    SELECT status, citizen_id INTO v_old_status, v_citizen_id
    FROM public.complaints WHERE id = p_complaint_id;

    SELECT a.worker_id, w.profile_id INTO v_worker_id, v_worker_profile
    FROM public.assignments a
    JOIN public.workers w ON a.worker_id = w.id
    WHERE a.complaint_id = p_complaint_id
    ORDER BY a.assigned_at DESC LIMIT 1;

    INSERT INTO public.resolution_reviews (
        complaint_id, worker_id, reviewed_by, decision, review_notes
    ) VALUES (
        p_complaint_id, v_worker_id, auth.uid(), p_decision, p_review_notes
    );

    IF p_decision = 'APPROVED' THEN
        UPDATE public.complaints
        SET status = 'RESOLVED',
            resolved_at = timezone('utc'::text, now()),
            updated_at = timezone('utc'::text, now())
        WHERE id = p_complaint_id;

        -- Decrement active assignments
        IF v_worker_id IS NOT NULL THEN
            UPDATE public.workers
            SET active_assignment_count = GREATEST(0, active_assignment_count - 1)
            WHERE id = v_worker_id;
        END IF;

        INSERT INTO public.complaint_updates (
            complaint_id, updated_by, previous_status, new_status, update_note
        ) VALUES (
            p_complaint_id, auth.uid(), v_old_status, 'RESOLVED',
            'Resolution verified and approved: ' || p_review_notes
        );

        -- Notify Citizen
        INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
        VALUES (
            v_citizen_id,
            'Complaint Resolved!',
            'Your reported issue has been repaired and verified. Please rate the service quality.',
            p_complaint_id
        );

    ELSE
        -- Return to in progress
        UPDATE public.complaints
        SET status = 'IN PROGRESS',
            updated_at = timezone('utc'::text, now())
        WHERE id = p_complaint_id;

        UPDATE public.assignments
        SET status = 'IN_PROGRESS',
            completed_at = NULL
        WHERE complaint_id = p_complaint_id AND worker_id = v_worker_id;

        INSERT INTO public.complaint_updates (
            complaint_id, updated_by, previous_status, new_status, update_note
        ) VALUES (
            p_complaint_id, auth.uid(), v_old_status, 'IN PROGRESS',
            'Resolution returned for additional work: ' || p_review_notes
        );

        -- Notify Worker
        IF v_worker_profile IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, related_complaint_id)
            VALUES (
                v_worker_profile,
                'Resolution Revision Required',
                'Admin requested revision on complaint resolution: ' || p_review_notes,
                p_complaint_id
            );
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. DEFAULT CATEGORIES SEEDING
INSERT INTO public.categories (name, description, icon_name, sla_critical_hours, sla_high_hours, sla_medium_hours, sla_low_hours)
VALUES
    ('Road Damage / Potholes', 'Potholes, surface cracks, damaged asphalt, missing speed breakers', 'AlertTriangle', 24, 72, 168, 336),
    ('Garbage Collection', 'Overflowing dumpsters, illegal dumping, missed sanitation collection', 'Trash2', 12, 24, 48, 96),
    ('Drainage Problems', 'Blocked storm drains, sewage overflows, street waterlogging', 'Waves', 24, 48, 96, 168),
    ('Water Leakage', 'Broken main pipes, continuous water loss, low pressure leaks', 'Droplets', 12, 24, 72, 120),
    ('Broken Streetlights', 'Unlit fixtures, flickering poles, exposed high-voltage wiring', 'LightbulbOff', 24, 48, 96, 168),
    ('Public Infrastructure', 'Damaged bus stops, broken public benches, compromised sidewalk slabs', 'Building2', 48, 96, 168, 336),
    ('Street Cleaning', 'Fallen tree debris, litter accumulation on footpaths and medians', 'Sparkles', 24, 48, 72, 120),
    ('Traffic Signal Problems', 'Non-functional signals, broken pedestrian pushbuttons, stuck red lights', 'Siren', 6, 12, 24, 48),
    ('Public Safety Infrastructure', 'Missing manhole covers, exposed electrical boxes, dangerous railings', 'ShieldAlert', 6, 12, 24, 48),
    ('Other', 'General public space maintenance and civil observations', 'HelpCircle', 48, 96, 168, 336)
ON CONFLICT (name) DO NOTHING;
