
-- Allow all authenticated users to read admin role entries (needed so owners/scaffolders can trigger admin notifications)
CREATE POLICY "Authenticated can read admin roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (role = 'admin'::app_role);
