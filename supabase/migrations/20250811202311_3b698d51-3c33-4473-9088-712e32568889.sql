-- Create missing triggers to keep profiles in sync with auth and set first admin
-- and backfill profiles for existing auth users without a profile.

-- 1) Trigger: when a new auth user is created, insert into public.profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END$$;

-- 2) Trigger: ensure the very first profile becomes admin (if none exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_first_admin'
  ) THEN
    CREATE TRIGGER set_first_admin
    BEFORE INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.ensure_first_admin();
  END IF;
END$$;

-- 3) Optional but recommended: keep profiles.updated_at fresh on updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at'
  ) THEN
    CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END$$;

-- 4) Backfill: create profiles for any existing auth users missing a profile
INSERT INTO public.profiles (id, nome, email)
SELECT u.id,
       COALESCE(u.raw_user_meta_data ->> 'nome', u.email),
       u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;