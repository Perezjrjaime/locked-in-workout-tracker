-- Check what columns actually exist and see the data
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Also check the actual data in the table
SELECT * FROM user_profiles;
