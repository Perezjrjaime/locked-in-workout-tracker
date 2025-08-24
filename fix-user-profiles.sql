-- Fix the user profile creation trigger to handle all fields properly

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  -- Get email from the new user
  user_email := NEW.email;
  
  -- Get name from user metadata, fallback to email prefix
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insert user profile with all necessary fields
  INSERT INTO user_profiles (user_id, email, full_name, is_admin)
  VALUES (NEW.id, user_email, user_name, FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also update the make_admin function to handle email field properly
CREATE OR REPLACE FUNCTION make_admin(target_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get target user ID
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Create or update profile
  INSERT INTO user_profiles (user_id, email, full_name, is_admin) 
  VALUES (
    target_user_id, 
    target_email,
    COALESCE(
      (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = target_user_id),
      (SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = target_user_id),
      split_part(target_email, '@', 1)
    ),
    TRUE
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_admin = TRUE,
    email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
