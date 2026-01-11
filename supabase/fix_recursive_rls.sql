-- FIX: Infinite Recursion in RLS Policies
-- The previous policies caused a 500 Error because checking "Is Admin" queried the 'users' table,
-- which triggered the 'users' policy, which checked "Is Admin" again... ad infinitum.

-- 1. Create a secure function to check admin status (Bypasses RLS due to SECURITY DEFINER)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update 'users' Admin Policy to use the function
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (is_admin());

-- 3. Update 'businesses' Policy to use the function
DROP POLICY IF EXISTS "Partners can manage their own business" ON businesses;
CREATE POLICY "Partners can manage their own business"
  ON businesses FOR ALL
  USING (
    owner_id = auth.uid() OR is_admin()
  );

-- 4. Update other Admin policies just to be safe and consistent
-- Appointments
DROP POLICY IF EXISTS "Admins can view all appointments" ON appointments;
CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (is_admin());

-- Vouchers
DROP POLICY IF EXISTS "Admins can manage all vouchers" ON vouchers;
CREATE POLICY "Admins can manage all vouchers"
  ON vouchers FOR ALL
  USING (is_admin());

-- Crisis Logs
DROP POLICY IF EXISTS "Admins can view all crisis logs" ON crisis_logs;
CREATE POLICY "Admins can view all crisis logs"
  ON crisis_logs FOR SELECT
  USING (is_admin());

-- Check-ins
DROP POLICY IF EXISTS "Admins can view all check-ins" ON check_ins;
CREATE POLICY "Admins can view all check-ins"
  ON check_ins FOR SELECT
  USING (is_admin());

-- Partner Apps
DROP POLICY IF EXISTS "Admins can view all partner applications" ON partner_applications;
CREATE POLICY "Admins can view all partner applications"
  ON partner_applications FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can update partner applications" ON partner_applications;
CREATE POLICY "Admins can update partner applications"
  ON partner_applications FOR UPDATE
  USING (is_admin());

DROP POLICY IF EXISTS "Admins can manage invite codes" ON invite_codes;
CREATE POLICY "Admins can manage invite codes"
  ON invite_codes FOR ALL
  USING (is_admin());
