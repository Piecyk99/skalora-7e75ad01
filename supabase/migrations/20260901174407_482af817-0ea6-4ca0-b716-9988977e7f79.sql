CREATE OR REPLACE FUNCTION public.grant_admin_to_owner()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT u.id, 'admin'::public.app_role
  FROM auth.users u
  WHERE lower(u.email) = 'dpsolutionsbusiness@gmail.com'
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_admin_to_owner() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.grant_admin_to_owner() TO authenticated;

SELECT public.grant_admin_to_owner();

DROP FUNCTION IF EXISTS public.bootstrap_first_admin();

CREATE FUNCTION public.bootstrap_first_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_email text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_uid;

  IF v_email IS DISTINCT FROM 'dpsolutionsbusiness@gmail.com' THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_uid, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_first_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_first_admin() TO authenticated;