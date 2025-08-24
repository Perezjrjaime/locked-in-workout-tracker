import { useState } from 'react'
import { useWorkouts } from '../contexts/WorkoutContext'
import toast from 'react-hot-toast'

interface WorkoutSet {
  setNumber: number
  weight: number
  reps: number
  completed: boolean
}

interface WorkoutExercise {
  id: string
  name: string
  sets: WorkoutSet[]
  completed: boolean
}

interface PlannedWorkout {
  id: string
  name: string
  exercises: WorkoutExercise[]
  created_at: string
}

export default function StartWorkout() {
  const { plannedWorkouts, saveCompletedWorkout } = useWorkouts()
  const [activeWorkout, setActiveWorkout] = useState<PlannedWorkout | null>(null)
  const [currentWorkout, setCurrentWorkout] = useState<PlannedWorkout | null>(null)

  const startWorkout = (workout: any) => {
    // Transform planned workout into active workout format
    const transformedWorkout = {
      ...workout,
      exercises: (workout.exercises || []).map((exercise: any) => ({
        id: exercise.id || Date.now().toString(),
        name: exercise.name,
        completed: false,
        sets: Array.from({ length: exercise.sets }, (_, index) => ({
          setNumber: index + 1,
          weight: 0,
          reps: 0,
          completed: false
        }))
      }))
    }
    
    setActiveWorkout(transformedWorkout)
    setCurrentWorkout(JSON.parse(JSON.stringify(transformedWorkout))) // Deep copy
  }

  const updateSet = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    if (!currentWorkout) return

    setCurrentWorkout(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((set, index) =>
                  index === setIndex
                    ? { ...set, [field]: value }
                    : set
                )
              }
            : ex
        )
      }
    })
  }

  const completeSet = (exerciseId: string, setIndex: number) => {
    if (!currentWorkout) return

    setCurrentWorkout(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map(ex =>
          ex.id === exerciseId
            ? {
                ...ex,
                sets: ex.sets.map((set, index) =>
                  index === setIndex
                    ? { ...set, completed: true }
                    : set
                )
              }
            : ex
        )
      }
    })
  }

  const completeWorkout = async () => {
    if (!currentWorkout) return
    
    try {
      // Calculate workout duration (for now, use a fixed value)
      const durationMinutes = 45 // TODO: Track actual time
      
      // Transform exercises to completed format
      const completedExercises = currentWorkout.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.filter(set => set.completed).map(set => ({
          setNumber: set.setNumber,
          weight: set.weight,
          reps: set.reps
        }))
      })).filter(exercise => exercise.sets.length > 0) // Only include exercises with completed sets
      
      await saveCompletedWorkout(
        currentWorkout.id, 
        currentWorkout.name, 
        completedExercises, 
        durationMinutes
      )
      
      toast.success('Workout completed! Check your history to see the results.')
      setActiveWorkout(null)
      setCurrentWorkout(null)
    } catch (err) {
      toast.error('Failed to save completed workout. Please try again.')
    }
  }

  if (activeWorkout && currentWorkout) {
    return (
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                setActiveWorkout(null)
                setCurrentWorkout(null)
              }}
              className="text-red-400 hover:text-red-300"
            >
              ← Back
            </button>
            <h1 className="text-white text-xl font-bold">{currentWorkout.name}</h1>
            <div></div>
          </div>

          <div className="space-y-4 mb-6">
            {currentWorkout.exercises.map((exercise) => (
              <div key={exercise.id} className="bg-black border-2 border-red-700 rounded-xl p-4">
                <h3 className="text-white font-semibold mb-3">{exercise.name}</h3>
                
                <div className="space-y-3">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="bg-gray-900 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">Set {set.setNumber}</span>
                        {set.completed && (
                          <span className="text-green-400 text-sm">✓ Complete</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="text-gray-300 text-xs block mb-1">Weight (lbs)</label>
                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSet(exercise.id, setIndex, 'weight', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-red-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-400"
                            disabled={set.completed}
                          />
                        </div>
                        <div>
                          <label className="text-gray-300 text-xs block mb-1">Reps</label>
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => updateSet(exercise.id, setIndex, 'reps', parseInt(e.target.value) || 0)}
                            className="w-full bg-black border border-red-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-red-400"
                            disabled={set.completed}
                          />
                        </div>
                        <div className="flex items-end">
                          {!set.completed ? (
                            <button
                              onClick={() => completeSet(exercise.id, setIndex)}
                              disabled={!set.weight || !set.reps}
                              className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm py-1 rounded transition-colors"
                            >
                              Done
                            </button>
                          ) : (
                            <div className="w-full bg-green-600 text-white text-sm py-1 rounded text-center">
                              ✓
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Complete Workout Button */}
          <button
            onClick={completeWorkout}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            Complete Workout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-6">
      <div className="max-w-md mx-auto">
        {plannedWorkouts.length === 0 ? (
          <div className="bg-black border-2 border-red-700 rounded-xl p-6 text-center">
            <p className="text-white font-medium mb-2">
              No workouts planned yet
            </p>
            <p className="text-gray-400 text-sm">
              Create a workout in the Plan Workout tab first
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">Ready to Start:</h2>
            {plannedWorkouts.map((workout: any) => (
              <div key={workout.id} className="bg-black border-2 border-red-700 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">{workout.name}</h3>
                  <span className="text-gray-400 text-sm">
                    {workout.created_at ? new Date(workout.created_at).toLocaleDateString() : 'Today'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-300 text-sm mb-1">
                    {(workout.exercises || []).length} exercises
                  </p>
                  <div className="text-gray-400 text-xs">
                    {(workout.exercises || []).map((ex: any) => ex.name).join(', ') || 'No exercises'}
                  </div>
                </div>

                <button
                  onClick={() => startWorkout(workout)}
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Start Workout
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
