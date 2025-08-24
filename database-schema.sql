-- Supabase Database Schema for Locked In Workout Tracker
-- Run this in your Supabase SQL editor to create the necessary tables

-- Create planned_workouts table
CREATE TABLE planned_workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  weight DECIMAL(5,2) NOT NULL, -- e.g., 180.50 lbs
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes VARCHAR(500) -- Optional notes about the weigh-in
);

-- Create indexes for better performance
CREATE INDEX idx_planned_exercises_workout_id ON planned_exercises(workout_id);
CREATE INDEX idx_planned_exercises_order ON planned_exercises(workout_id, order_index);
CREATE INDEX idx_completed_sets_workout_id ON completed_sets(completed_workout_id);
CREATE INDEX idx_completed_sets_order ON completed_sets(completed_workout_id, order_index);
CREATE INDEX idx_user_weight_logs_date ON user_weight_logs(logged_at);
