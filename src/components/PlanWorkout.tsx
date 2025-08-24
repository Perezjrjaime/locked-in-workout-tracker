import { useState } from 'react'
import { useWorkouts } from '../contexts/WorkoutContext'
import toast from 'react-hot-toast'

interface Exercise {
  id: string
  name: string
  sets: number
}

interface MuscleGroup {
  name: string
  exercises: string[]
}

export default function PlanWorkout() {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([])
  const [workoutName, setWorkoutName] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const { savePlannedWorkout, loading, error } = useWorkouts()

  // Planet Fitness machines and free weights organized by muscle groups
  const muscleGroups: MuscleGroup[] = [
    {
      name: 'Chest',
      exercises: [
        'Chest Press Machine',
        'Incline Chest Press Machine',
        'Pec Fly Machine',
        'Dumbbell Bench Press',
        'Dumbbell Incline Press',
        'Dumbbell Flyes',
        'Push-ups',
        'Chest Dips'
      ]
    },
    {
      name: 'Back',
      exercises: [
        'Lat Pulldown Machine',
        'Seated Row Machine',
        'Assisted Pull-up Machine',
        'T-Bar Row Machine',
        'Dumbbell Rows',
        'Cable Rows',
        'Pull-ups',
        'Reverse Flyes'
      ]
    },
    {
      name: 'Shoulders',
      exercises: [
        'Shoulder Press Machine',
        'Lateral Raise Machine',
        'Rear Delt Machine',
        'Dumbbell Shoulder Press',
        'Dumbbell Lateral Raises',
        'Dumbbell Front Raises',
        'Cable Lateral Raises',
        'Upright Rows'
      ]
    },
    {
      name: 'Arms',
      exercises: [
        'Bicep Curl Machine',
        'Tricep Extension Machine',
        'Cable Bicep Curls',
        'Cable Tricep Pushdowns',
        'Dumbbell Bicep Curls',
        'Dumbbell Tricep Extensions',
        'Hammer Curls',
        'Tricep Dips'
      ]
    },
    {
      name: 'Legs',
      exercises: [
        'Leg Press Machine',
        'Leg Extension Machine',
        'Leg Curl Machine',
        'Calf Raise Machine',
        'Hip Abduction Machine',
        'Hip Adduction Machine',
        'Squats',
        'Lunges',
        'Goblet Squats',
        'Romanian Deadlifts'
      ]
    },
    {
      name: 'Core',
      exercises: [
        'Ab Machine',
        'Captain\'s Chair',
        'Cable Crunches',
        'Planks',
        'Russian Twists',
        'Mountain Climbers',
        'Dead Bug',
        'Bicycle Crunches'
      ]
    },
    {
      name: 'Cardio',
      exercises: [
        'Treadmill',
        'Elliptical',
        'Stationary Bike',
        'Stair Climber',
        'Rowing Machine',
        'Arc Trainer'
      ]
    }
  ]

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: 3 // default to 3 sets
    }
    setSelectedExercises([...selectedExercises, newExercise])
  }

  const updateSets = (id: string, sets: number) => {
    setSelectedExercises(prev =>
      prev.map(ex => ex.id === id ? { ...ex, sets } : ex)
    )
  }

  const removeExercise = (id: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== id))
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    )
  }

  const saveWorkout = async () => {
    if (workoutName && selectedExercises.length > 0) {
      try {
        await savePlannedWorkout(workoutName, selectedExercises)
        toast.success('Workout saved successfully!')
        // Reset form
        setWorkoutName('')
        setSelectedExercises([])
      } catch (err) {
        toast.error('Failed to save workout. Please try again.')
      }
    }
  }

  return (
    <div className="px-6 pt-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-white text-2xl font-bold mb-6 text-center">Plan Workout</h1>
        
        {/* Workout Name Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Workout Name (e.g., Push Day, Leg Day)"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            className="w-full bg-black border-2 border-red-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Selected Exercises */}
        {selectedExercises.length > 0 && (
          <div className="mb-6">
            <h2 className="text-white text-lg font-semibold mb-3">Your Workout:</h2>
            <div className="space-y-3">
              {selectedExercises.map((exercise) => (
                <div key={exercise.id} className="bg-black border-2 border-red-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">{exercise.name}</span>
                    <button
                      onClick={() => removeExercise(exercise.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-300 text-sm">Sets:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateSets(exercise.id, Math.max(1, exercise.sets - 1))}
                        className="bg-red-700 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-white font-bold w-8 text-center">{exercise.sets}</span>
                      <button
                        onClick={() => updateSets(exercise.id, exercise.sets + 1)}
                        className="bg-red-700 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exercise Selection by Muscle Groups */}
        <div className="mb-6">
          <h2 className="text-white text-lg font-semibold mb-3">Add Exercises:</h2>
          <div className="space-y-3">
            {muscleGroups.map((group) => (
              <div key={group.name} className="bg-black border-2 border-red-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(group.name)}
                  className="w-full px-4 py-3 text-white font-medium text-left flex justify-between items-center hover:bg-gray-900"
                >
                  {group.name}
                  <span className="text-red-400">
                    {expandedGroups.includes(group.name) ? '−' : '+'}
                  </span>
                </button>
                
                {expandedGroups.includes(group.name) && (
                  <div className="p-3 border-t border-red-700">
                    <div className="grid grid-cols-1 gap-2">
                      {group.exercises
                        .filter(ex => !selectedExercises.some(sel => sel.name === ex))
                        .map((exercise) => (
                          <button
                            key={exercise}
                            onClick={() => addExercise(exercise)}
                            className="bg-gray-900 hover:bg-gray-800 border border-red-600 hover:border-red-500 text-white text-sm py-2 px-3 rounded-lg transition-colors text-left"
                          >
                            {exercise}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save Workout Button */}
        <div>
          {error && (
            <div className="mb-3 p-3 bg-red-900 border border-red-700 rounded-xl">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          <button
            onClick={saveWorkout}
            disabled={loading || !workoutName || selectedExercises.length === 0}
            className="w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors"
          >
            {loading ? 'Saving...' : 'Save Workout'}
          </button>
          
          {(!workoutName || selectedExercises.length === 0) && (
            <p className="text-gray-400 text-sm mt-2 text-center">
              {!workoutName ? 'Enter a workout name above' : 'Add at least one exercise to save'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
