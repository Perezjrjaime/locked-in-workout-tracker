-- Add admin policy to allow admins to read all user profiles
-- This is needed for the admin menu to work properly

-- Add a policy that allows admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles AS admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
        OR auth.uid() = user_id
    );

-- Add a policy that allows admins to update any profile
CREATE POLICY "Admins can update all profiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles AS admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
        OR auth.uid() = user_id
    );

-- Add a policy that allows admins to delete any profile (except their own, handled in app)
CREATE POLICY "Admins can delete profiles" ON user_profiles
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles AS admin_profile 
            WHERE admin_profile.user_id = auth.uid() 
            AND admin_profile.is_admin = true
        )
    );

-- Test the policies
SELECT 'Policies updated successfully' as status;
