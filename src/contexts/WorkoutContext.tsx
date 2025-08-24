import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, isSupabaseConfigured, PlannedWorkout, CompletedWorkout, UserWeightLog } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface Exercise {
  id: string
  name: string
  sets: number
}

interface WorkoutContextType {
  // Planned workouts
  plannedWorkouts: PlannedWorkout[]
  savePlannedWorkout: (name: string, exercises: Exercise[]) => Promise<void>
  deletePlannedWorkout: (id: string) => Promise<void>
  
  // Completed workouts
  completedWorkouts: CompletedWorkout[]
  saveCompletedWorkout: (plannedWorkoutId: string, name: string, exercises: any[], durationMinutes: number) => Promise<void>
  deleteCompletedWorkout: (id: string) => Promise<void>
  
  // Weight tracking
  weightLogs: UserWeightLog[]
  saveWeightLog: (weight: number, notes?: string) => Promise<void>
  deleteWeightLog: (id: string) => Promise<void>
  
  // Loading states
  loading: boolean
  error: string | null
  isConfigured: boolean
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined)

interface WorkoutProviderProps {
  children: ReactNode
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const { user } = useAuth()
  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>([])
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([])
  const [weightLogs, setWeightLogs] = useState<UserWeightLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isConfigured = isSupabaseConfigured()

  // Load planned workouts
  const loadPlannedWorkouts = async () => {
    if (!supabase || !isConfigured) {
      // Load from localStorage as fallback
      const saved = localStorage.getItem('plannedWorkouts')
      if (saved) {
        setPlannedWorkouts(JSON.parse(saved))
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('planned_workouts')
        .select(`
          *,
          planned_exercises (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to match our interface
      const transformedData = (data || []).map(workout => ({
        ...workout,
        exercises: workout.planned_exercises || []
      }))
      
      setPlannedWorkouts(transformedData)
    } catch (err) {
      console.error('Error loading planned workouts:', err)
      setError('Failed to load planned workouts')
    }
  }

  // Load completed workouts
  const loadCompletedWorkouts = async () => {
    if (!supabase || !isConfigured) {
      // Load from localStorage as fallback
      const saved = localStorage.getItem('completedWorkouts')
      if (saved) {
        setCompletedWorkouts(JSON.parse(saved))
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('completed_workouts')
        .select(`
          *,
          completed_sets (*)
        `)
        .order('completed_at', { ascending: false })

      if (error) throw error
      setCompletedWorkouts(data || [])
    } catch (err) {
      console.error('Error loading completed workouts:', err)
      setError('Failed to load completed workouts')
    }
  }

  // Save planned workout
  const savePlannedWorkout = async (name: string, exercises: Exercise[]) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !isConfigured || !user) {
        // Fallback to localStorage
        const newWorkout = {
          id: Date.now().toString(),
          name,
          created_at: new Date().toISOString(),
          exercises: exercises.map((ex, index) => ({
            ...ex,
            workout_id: Date.now().toString(),
            order_index: index
          }))
        }
        
        const current = [...plannedWorkouts, newWorkout]
        setPlannedWorkouts(current)
        localStorage.setItem('plannedWorkouts', JSON.stringify(current))
        return
      }
      
      // Insert the planned workout with user_id
      const { data: workout, error: workoutError } = await supabase
        .from('planned_workouts')
        .insert({ 
          name,
          user_id: user.id
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Insert the exercises
      const exercisesToInsert = exercises.map((exercise, index) => ({
        workout_id: workout.id,
        name: exercise.name,
        sets: exercise.sets,
        order_index: index
      }))

      const { error: exerciseError } = await supabase
        .from('planned_exercises')
        .insert(exercisesToInsert)

      if (exerciseError) throw exerciseError

      await loadPlannedWorkouts()
    } catch (err) {
      console.error('Error saving planned workout:', err)
      setError('Failed to save workout')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete planned workout
  const deletePlannedWorkout = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !isConfigured) {
        // Fallback to localStorage
        const updated = plannedWorkouts.filter(w => w.id !== id)
        setPlannedWorkouts(updated)
        localStorage.setItem('plannedWorkouts', JSON.stringify(updated))
        return
      }
      
      // Delete exercises first (foreign key constraint)
      await supabase
        .from('planned_exercises')
        .delete()
        .eq('workout_id', id)

      // Delete the workout
      const { error } = await supabase
        .from('planned_workouts')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadPlannedWorkouts()
    } catch (err) {
      console.error('Error deleting planned workout:', err)
      setError('Failed to delete workout')
    } finally {
      setLoading(false)
    }
  }

  // Save completed workout
  const saveCompletedWorkout = async (plannedWorkoutId: string, name: string, exercises: any[], durationMinutes: number) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !isConfigured || !user) {
        // Fallback to localStorage
        const newCompletedWorkout = {
          id: Date.now().toString(),
          planned_workout_id: plannedWorkoutId,
          name,
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          exercises: exercises
        }
        
        const currentCompleted = [...completedWorkouts, newCompletedWorkout]
        setCompletedWorkouts(currentCompleted)
        localStorage.setItem('completedWorkouts', JSON.stringify(currentCompleted))

        // Remove from planned workouts
        await deletePlannedWorkout(plannedWorkoutId)
        return
      }

      // Insert completed workout with user_id
      const { data: completedWorkout, error: workoutError } = await supabase
        .from('completed_workouts')
        .insert({
          planned_workout_id: plannedWorkoutId,
          name,
          completed_at: new Date().toISOString(),
          duration_minutes: durationMinutes,
          user_id: user.id
        })
        .select()
        .single()

      if (workoutError) throw workoutError

      // Insert completed sets
      const setsToInsert: any[] = []
      exercises.forEach((exercise, exerciseIndex) => {
        exercise.sets.forEach((set: any, setIndex: number) => {
          setsToInsert.push({
            completed_workout_id: completedWorkout.id,
            exercise_name: exercise.name,
            set_number: set.setNumber,
            weight: set.weight,
            reps: set.reps,
            order_index: exerciseIndex * 100 + setIndex
          })
        })
      })

      const { error: setsError } = await supabase
        .from('completed_sets')
        .insert(setsToInsert)

      if (setsError) throw setsError

      // Remove from planned workouts after completion
      await deletePlannedWorkout(plannedWorkoutId)
      
      await loadCompletedWorkouts()
    } catch (err) {
      console.error('Error saving completed workout:', err)
      setError('Failed to save completed workout')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete completed workout
  const deleteCompletedWorkout = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !isConfigured) {
        // Fallback to localStorage
        const updated = completedWorkouts.filter(w => w.id !== id)
        setCompletedWorkouts(updated)
        localStorage.setItem('completedWorkouts', JSON.stringify(updated))
        return
      }

      // Delete completed sets first (foreign key constraint)
      await supabase
        .from('completed_sets')
        .delete()
        .eq('completed_workout_id', id)

      // Delete the completed workout
      const { error } = await supabase
        .from('completed_workouts')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadCompletedWorkouts()
    } catch (err) {
      console.error('Error deleting completed workout:', err)
      setError('Failed to delete workout')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Load weight logs
  const loadWeightLogs = async () => {
    if (!supabase || !isConfigured) {
      // Load from localStorage as fallback
      const saved = localStorage.getItem('weightLogs')
      if (saved) {
        setWeightLogs(JSON.parse(saved))
      }
      return
    }

    try {
      const { data, error } = await supabase
        .from('user_weight_logs')
        .select('*')
        .order('logged_at', { ascending: false })

      if (error) throw error
      setWeightLogs(data || [])
    } catch (err) {
      console.error('Error loading weight logs:', err)
      setError('Failed to load weight logs')
    }
  }

  // Save weight log
  const saveWeightLog = async (weight: number, notes?: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !isConfigured || !user) {
        // Fallback to localStorage
        const newLog = {
          id: Date.now().toString(),
          weight,
          logged_at: new Date().toISOString(),
          notes: notes || ''
        }
        const current = [...weightLogs, newLog]
        setWeightLogs(current)
        localStorage.setItem('weightLogs', JSON.stringify(current))
        return
      }

      const { error } = await supabase
        .from('user_weight_logs')
        .insert({
          weight,
          notes: notes || null,
          user_id: user.id
        })

      if (error) throw error
      await loadWeightLogs()
    } catch (err) {
      console.error('Error saving weight log:', err)
      setError('Failed to save weight log')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete weight log
  const deleteWeightLog = async (id: string) => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase || !isConfigured) {
        // Fallback to localStorage
        const updated = weightLogs.filter(w => w.id !== id)
        setWeightLogs(updated)
        localStorage.setItem('weightLogs', JSON.stringify(updated))
        return
      }

      const { error } = await supabase
        .from('user_weight_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      await loadWeightLogs()
    } catch (err) {
      console.error('Error deleting weight log:', err)
      setError('Failed to delete weight log')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadPlannedWorkouts(), loadCompletedWorkouts(), loadWeightLogs()])
      setLoading(false)
    }

    loadData()
  }, [isConfigured])

  const value = {
    plannedWorkouts,
    savePlannedWorkout,
    deletePlannedWorkout,
    completedWorkouts,
    saveCompletedWorkout,
    deleteCompletedWorkout,
    weightLogs,
    saveWeightLog,
    deleteWeightLog,
    loading,
    error,
    isConfigured
  }

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkouts() {
  const context = useContext(WorkoutContext)
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider')
  }
  return context
}
