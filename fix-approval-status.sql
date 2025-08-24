-- Just update your admin account to be approved
UPDATE user_profiles 
SET is_approved = TRUE 
WHERE is_admin = TRUE;

-- Check the result
SELECT email, is_admin, is_approved FROM user_profiles;
