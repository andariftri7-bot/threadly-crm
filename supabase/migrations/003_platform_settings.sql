-- ==============================================================================
-- THREADLY - MIGRATION 003: PLATFORM METADATA SETTINGS (SUPERADMIN)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can manage platform settings" ON public.platform_settings;
CREATE POLICY "Super admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (public.is_superadmin());
