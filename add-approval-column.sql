-- Add the is_approved column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;

-- Set your admin account as approved
UPDATE user_profiles 
SET is_approved = TRUE 
WHERE is_admin = TRUE;
