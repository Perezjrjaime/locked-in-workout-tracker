import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Only create the client if we have real credentials
const hasValidCredentials = 
  supabaseUrl !== 'https://placeholder.supabase.co' && 
  supabaseAnonKey !== 'placeholder-key' &&
  supabaseUrl.includes('supabase.co')

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: 'locked-in-workout-auth',
        storage: window.localStorage,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null

export const isSupabaseConfigured = () => hasValidCredentials

// Database types for TypeScript
export interface PlannedWorkout {
  id?: string
  name: string
  created_at?: string
  user_id?: string
}

export interface PlannedExercise {
  id?: string
  workout_id: string
  name: string
  sets: number
  order_index: number
}

export interface CompletedWorkout {
  id?: string
  planned_workout_id: string
  name: string
  completed_at: string
  duration_minutes: number
  user_id?: string
}

export interface CompletedSet {
  id?: string
  completed_workout_id: string
  exercise_name: string
  set_number: number
  weight: number
  reps: number
  order_index: number
}

export interface UserWeightLog {
  id?: string
  weight: number
  logged_at: string
  notes?: string
}

export interface UserProfile {
  id?: string
  height_feet?: number
  height_inches?: number
  current_weight?: number
  goal_weight?: number
  created_at?: string
  updated_at?: string
}

export interface UserWeightLog {
  id?: string
  weight: number
  logged_at: string
  notes?: string
}
