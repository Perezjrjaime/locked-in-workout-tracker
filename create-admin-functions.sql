-- Create RPC functions for admin operations to bypass RLS safely

-- Function to get all user profiles (admin only)
CREATE OR REPLACE FUNCTION get_all_user_profiles()
RETURNS TABLE (
    id UUID,
    user_id UUID,
    email TEXT,
    full_name TEXT,
    is_admin BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the calling user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Return all user profiles if admin
    RETURN QUERY
    SELECT 
        up.id,
        up.user_id,
        up.email,
        up.full_name,
        up.is_admin,
        up.created_at,
        up.updated_at
    FROM user_profiles up
    ORDER BY up.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update user admin status (admin only)
CREATE OR REPLACE FUNCTION update_user_admin_status(target_user_id UUID, new_admin_status BOOLEAN)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the calling user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Update the target user's admin status
    UPDATE user_profiles 
    SET is_admin = new_admin_status,
        updated_at = NOW()
    WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to delete user profile (admin only)
CREATE OR REPLACE FUNCTION delete_user_profile(target_user_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the calling user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = auth.uid() 
        AND user_profiles.is_admin = true
    ) THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Prevent admins from deleting themselves
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Cannot delete your own profile';
    END IF;
    
    -- Delete the target user's profile
    DELETE FROM user_profiles WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Admin RPC functions created successfully' as status;
