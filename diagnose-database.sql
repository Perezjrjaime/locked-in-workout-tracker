-- Diagnostic queries to check current database state

-- 1. Check if user_profiles table exists and its structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 2. Check current trigger and function
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Check if the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 4. Check current users in auth.users (first 5)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Check current user profiles (without email column)
SELECT user_id, full_name, is_admin, created_at 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Test the trigger manually (this will help us see the exact error)
-- Don't run this unless you want to test - it will try to insert a test user
/*
DO $$
BEGIN
  RAISE NOTICE 'Testing trigger functionality...';
  -- This would test the trigger but let's not actually create a user
END $$;
*/
