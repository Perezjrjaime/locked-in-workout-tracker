import { useState } from 'react'
import { useWorkouts } from '../contexts/WorkoutContext'
import toast from 'react-hot-toast'

export default function History() {
  const { completedWorkouts, deleteCompletedWorkout, loading } = useWorkouts()
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)

  const toggleWorkoutExpansion = (workoutId: string) => {
    setExpandedWorkout(prev => prev === workoutId ? null : workoutId)
  }

  const handleDeleteWorkout = async (workoutId: string, workoutName: string) => {
    // Show a confirmation toast with action buttons
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-gray-900">
          Delete "{workoutName}"?
        </div>
        <div className="text-xs text-gray-600">
          This action cannot be undone.
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id)
              try {
                await deleteCompletedWorkout(workoutId)
                toast.success('Workout deleted successfully!')
              } catch (error) {
                toast.error('Failed to delete workout')
              }
            }}
            className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: 'top-center',
      style: {
        background: 'white',
        color: 'black',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        maxWidth: '350px',
      }
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }

  const getWorkoutStats = (workout: any) => {
    if (!workout.completed_sets) {
      return {
        totalWeight: '0',
        avgReps: 0,
        totalSets: 0,
        totalReps: 0
      }
    }

    const totalWeight = workout.completed_sets.reduce((total: number, set: any) => {
      return total + (set.weight * set.reps)
    }, 0)
    
    const totalReps = workout.completed_sets.reduce((total: number, set: any) => {
      return total + set.reps
    }, 0)

    const totalSets = workout.completed_sets.length
    
    return {
      totalWeight: totalWeight.toLocaleString(),
      avgReps: totalSets > 0 ? Math.round(totalReps / totalSets) : 0,
      totalSets,
      totalReps
    }
  }

  const getExercisesFromSets = (workout: any) => {
    if (!workout.completed_sets) return []
    
    const exerciseMap = new Map()
    
    workout.completed_sets.forEach((set: any) => {
      if (!exerciseMap.has(set.exercise_name)) {
        exerciseMap.set(set.exercise_name, {
          name: set.exercise_name,
          sets: []
        })
      }
      exerciseMap.get(set.exercise_name).sets.push({
        setNumber: set.set_number,
        weight: set.weight,
        reps: set.reps
      })
    })
    
    // Sort sets within each exercise
    exerciseMap.forEach((exercise) => {
      exercise.sets.sort((a: any, b: any) => a.setNumber - b.setNumber)
    })
    
    return Array.from(exerciseMap.values())
  }

  if (loading) {
    return (
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-bold mb-6 text-center">History</h1>
          <div className="bg-black border-2 border-red-700 rounded-xl p-6 text-center">
            <p className="text-white font-medium">Loading workouts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">History</h1>
        
        {completedWorkouts.length === 0 ? (
          <div className="bg-black border-2 border-red-700 rounded-xl p-6 text-center">
            <p className="text-white font-medium mb-2">
              No workouts completed yet
            </p>
            <p className="text-gray-400 text-sm">
              Complete your first workout to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedWorkouts.map((workout: any) => {
              const stats = getWorkoutStats(workout)
              const exercises = getExercisesFromSets(workout)
              const isExpanded = expandedWorkout === workout.id
              
              return (
                <div key={workout.id} className="bg-black border-2 border-red-700 rounded-xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <button
                        onClick={() => toggleWorkoutExpansion(workout.id || '')}
                        className="flex-1 text-left"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-white font-semibold text-lg">{workout.name}</h3>
                          <span className="text-red-400">
                            {isExpanded ? '−' : '+'}
                          </span>
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteWorkout(workout.id || '', workout.name)}
                        className="ml-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete workout"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">{formatDate(workout.completed_at)}</span>
                      <span className="text-gray-300 text-sm">{workout.duration_minutes} min</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-red-400 text-sm font-medium">{exercises.length}</p>
                        <p className="text-gray-400 text-xs">Exercises</p>
                      </div>
                      <div>
                        <p className="text-red-400 text-sm font-medium">{stats.totalSets}</p>
                        <p className="text-gray-400 text-xs">Sets</p>
                      </div>
                      <div>
                        <p className="text-red-400 text-sm font-medium">{stats.totalWeight}</p>
                        <p className="text-gray-400 text-xs">Total lbs</p>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-red-700 p-4">
                      <div className="space-y-4">
                        {exercises.map((exercise: any, exerciseIndex: number) => (
                          <div key={exerciseIndex} className="bg-gray-900 rounded-lg p-3">
                            <h4 className="text-white font-medium mb-2">{exercise.name}</h4>
                            
                            <div className="space-y-2">
                              {exercise.sets.map((set: any, setIndex: number) => (
                                <div key={setIndex} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-300">Set {set.setNumber}</span>
                                  <div className="flex space-x-4">
                                    <span className="text-white">{set.weight} lbs</span>
                                    <span className="text-white">{set.reps} reps</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-400">
                                  {exercise.sets.length} sets
                                </span>
                                <span className="text-gray-400">
                                  {exercise.sets.reduce((total: number, set: any) => total + set.reps, 0)} total reps
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
