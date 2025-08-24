-- Supabase Database Schema for Locked In Workout Tracker
-- Run this in your Supabase SQL editor to create the necessary tables

-- Create planned_workouts table
CREATE TABLE planned_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create planned_exercises table
CREATE TABLE planned_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_id UUID REFERENCES planned_workouts(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create completed_workouts table
CREATE TABLE completed_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  planned_workout_id UUID REFERENCES planned_workouts(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_minutes INTEGER NOT NULL DEFAULT 0
);

-- Create completed_sets table
CREATE TABLE completed_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  completed_workout_id UUID REFERENCES completed_workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_name VARCHAR(255) NOT NULL,
  set_number INTEGER NOT NULL,
  weight DECIMAL(6,2) NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_weight_logs table for tracking body weight over time
CREATE TABLE user_weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight DECIMAL(5,2) NOT NULL, -- e.g., 180.50 lbs
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes VARCHAR(500) -- Optional notes about the weigh-in
);

-- Create user_profiles table for additional user information
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_planned_workouts_user_id ON planned_workouts(user_id);
CREATE INDEX idx_planned_exercises_workout_id ON planned_exercises(workout_id);
CREATE INDEX idx_planned_exercises_order ON planned_exercises(workout_id, order_index);
CREATE INDEX idx_completed_workouts_user_id ON completed_workouts(user_id);
CREATE INDEX idx_completed_sets_workout_id ON completed_sets(completed_workout_id);
CREATE INDEX idx_completed_sets_order ON completed_sets(completed_workout_id, order_index);
CREATE INDEX idx_user_weight_logs_user_id ON user_weight_logs(user_id);
CREATE INDEX idx_user_weight_logs_date ON user_weight_logs(logged_at);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE planned_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own data
-- Planned workouts policies
CREATE POLICY "Users can view their own planned workouts" ON planned_workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own planned workouts" ON planned_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own planned workouts" ON planned_workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own planned workouts" ON planned_workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Planned exercises policies (linked to user's workouts)
CREATE POLICY "Users can view exercises from their own workouts" ON planned_exercises
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM planned_workouts 
    WHERE planned_workouts.id = planned_exercises.workout_id 
    AND planned_workouts.user_id = auth.uid()
  ));
CREATE POLICY "Users can create exercises for their own workouts" ON planned_exercises
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM planned_workouts 
    WHERE planned_workouts.id = planned_exercises.workout_id 
    AND planned_workouts.user_id = auth.uid()
  ));
CREATE POLICY "Users can update exercises from their own workouts" ON planned_exercises
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM planned_workouts 
    WHERE planned_workouts.id = planned_exercises.workout_id 
    AND planned_workouts.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete exercises from their own workouts" ON planned_exercises
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM planned_workouts 
    WHERE planned_workouts.id = planned_exercises.workout_id 
    AND planned_workouts.user_id = auth.uid()
  ));

-- Completed workouts policies
CREATE POLICY "Users can view their own completed workouts" ON completed_workouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own completed workouts" ON completed_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own completed workouts" ON completed_workouts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completed workouts" ON completed_workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Completed sets policies (linked to user's completed workouts)
CREATE POLICY "Users can view sets from their own completed workouts" ON completed_sets
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM completed_workouts 
    WHERE completed_workouts.id = completed_sets.completed_workout_id 
    AND completed_workouts.user_id = auth.uid()
  ));
CREATE POLICY "Users can create sets for their own completed workouts" ON completed_sets
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM completed_workouts 
    WHERE completed_workouts.id = completed_sets.completed_workout_id 
    AND completed_workouts.user_id = auth.uid()
  ));
CREATE POLICY "Users can update sets from their own completed workouts" ON completed_sets
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM completed_workouts 
    WHERE completed_workouts.id = completed_sets.completed_workout_id 
    AND completed_workouts.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete sets from their own completed workouts" ON completed_sets
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM completed_workouts 
    WHERE completed_workouts.id = completed_sets.completed_workout_id 
    AND completed_workouts.user_id = auth.uid()
  ));

-- User weight logs policies
CREATE POLICY "Users can view their own weight logs" ON user_weight_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weight logs" ON user_weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weight logs" ON user_weight_logs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weight logs" ON user_weight_logs
  FOR DELETE USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
    AND user_profiles.is_admin = TRUE
  ));

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, is_admin)
  VALUES (NEW.id, FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Helper functions for admin management
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION make_admin(target_email TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can make other users admin';
  END IF;
  
  -- Get target user ID
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Create or update profile
  INSERT INTO user_profiles (user_id, is_admin) 
  VALUES (target_user_id, TRUE)
  ON CONFLICT (user_id) 
  DO UPDATE SET is_admin = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
