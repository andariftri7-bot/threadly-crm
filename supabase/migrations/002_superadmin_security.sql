-- ==============================================================================
-- THREADLY - MIGRATION 002: SUPERADMIN SECURITY & ACCESS ISOLATION
-- ==============================================================================

-- 1. Trigger to reject client-side updates to is_superadmin
CREATE OR REPLACE FUNCTION public.protect_is_superadmin_flag()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_superadmin IS DISTINCT FROM OLD.is_superadmin THEN
        -- Only service_role can alter is_superadmin
        IF current_setting('request.jwt.claim.role', true) != 'service_role' THEN
            RAISE EXCEPTION 'Akses Ditolak: Penanda is_superadmin hanya dapat diatur melalui migrasi atau skrip seed khusus.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_is_superadmin ON public.profiles;
CREATE TRIGGER trg_protect_is_superadmin
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_is_superadmin_flag();

-- 2. Constraint: Super admin accounts cannot have memberships in any store
CREATE OR REPLACE FUNCTION public.check_superadmin_no_membership()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = NEW.user_id AND p.is_superadmin = true
    ) THEN
        RAISE EXCEPTION 'Akses Ditolak: Akun Super Admin tidak boleh memiliki keanggotaan pada toko mana pun.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_check_superadmin_no_membership ON public.store_members;
CREATE TRIGGER trg_check_superadmin_no_membership
    BEFORE INSERT OR UPDATE ON public.store_members
    FOR EACH ROW
    EXECUTE FUNCTION public.check_superadmin_no_membership();

-- 3. Dedicated RLS Function verifying both is_superadmin and official email in verified JWT
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
    claim_email TEXT;
    is_super BOOLEAN;
BEGIN
    claim_email := current_setting('request.jwt.claim.email', true);
    SELECT is_superadmin INTO is_super
    FROM public.profiles
    WHERE id = auth.uid() AND LOWER(email) = 'andariftri7@gmail.com';
    RETURN COALESCE(is_super, false) AND LOWER(claim_email) = 'andariftri7@gmail.com';
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
