-- Add approval system to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;

-- Update existing users to be approved (so current users aren't locked out)
UPDATE user_profiles SET is_approved = TRUE WHERE is_admin = TRUE;

-- Create RPC function to approve users (admin only)
CREATE OR REPLACE FUNCTION approve_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calling_user_profile user_profiles%ROWTYPE;
BEGIN
    -- Get the calling user's profile
    SELECT * INTO calling_user_profile
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    -- Check if calling user is admin
    IF calling_user_profile.is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Approve the target user
    UPDATE user_profiles 
    SET is_approved = TRUE 
    WHERE user_id = target_user_id;
    
    RETURN FOUND;
END;
$$;

-- Create RPC function to reject/unapprove users (admin only)
CREATE OR REPLACE FUNCTION reject_user(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calling_user_profile user_profiles%ROWTYPE;
BEGIN
    -- Get the calling user's profile
    SELECT * INTO calling_user_profile
    FROM user_profiles 
    WHERE user_id = auth.uid();
    
    -- Check if calling user is admin
    IF calling_user_profile.is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Access denied: Admin privileges required';
    END IF;
    
    -- Reject the target user
    UPDATE user_profiles 
    SET is_approved = FALSE 
    WHERE user_id = target_user_id;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION approve_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user(UUID) TO authenticated;
