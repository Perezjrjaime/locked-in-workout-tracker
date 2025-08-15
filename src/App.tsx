import { useState } from 'react'

interface Exercise {
  name: string
  sets: { weight: string, reps: string }[]
}

interface CardioSession {
  exercise: string
  duration: string
  speed?: string
  incline?: string
  distance?: string
  calories?: string
  notes?: string
}

interface Workout {
  id: string
  date: string
  exercises: Exercise[]
  cardio: CardioSession[]
}

// Comprehensive exercise list organized by muscle groups
const EXERCISE_GROUPS = {
  "Chest": [
    "Flat Barbell Bench Press",
    "Flat Dumbbell Bench Press",
    "Incline Barbell Bench Press",
    "Incline Dumbbell Bench Press",
    "Decline Barbell Bench Press",
    "Decline Dumbbell Bench Press",
    "Chest Fly (Flat / Incline / Decline, Dumbbell or Cable)",
    "Push-Ups (Weighted or Bodyweight)",
    "Cable Crossover",
    "Pec Deck Machine"
  ],
  "Back": [
    "Pull-Ups / Chin-Ups (Weighted or Bodyweight)",
    "Lat Pulldown (Wide Grip / Close Grip / Reverse Grip)",
    "Barbell Row (Overhand / Underhand)",
    "Dumbbell Row (One-Arm or Two-Arm)",
    "T-Bar Row",
    "Seated Cable Row",
    "Chest-Supported Row",
    "Inverted Row",
    "Face Pull",
    "Shrugs (Barbell / Dumbbell / Smith Machine)",
    "Deadlift (Conventional / Sumo)"
  ],
  "Shoulders": [
    "Overhead Press (Barbell / Dumbbell / Machine)",
    "Arnold Press",
    "Front Raise (Barbell / Dumbbell / Cable)",
    "Lateral Raise (Dumbbell / Cable)",
    "Reverse Fly (Dumbbell / Cable / Machine)",
    "Upright Row (Barbell / Dumbbell)",
    "Push Press",
    "Behind-the-Neck Press"
  ],
  "Biceps": [
    "Barbell Curl (Straight Bar / EZ Bar)",
    "Dumbbell Curl (Seated / Standing)",
    "Hammer Curl",
    "Incline Dumbbell Curl",
    "Concentration Curl",
    "Preacher Curl (Barbell / Dumbbell / Machine)",
    "Cable Curl (Straight Bar / Rope / Single Arm)",
    "Reverse Curl"
  ],
  "Triceps": [
    "Tricep Pushdown (Straight Bar / Rope / V-Bar)",
    "Overhead Tricep Extension (Barbell / Dumbbell / Cable)",
    "Close-Grip Bench Press",
    "Skull Crusher (EZ Bar / Dumbbell)",
    "Dips (Weighted or Bodyweight)",
    "Kickbacks (Dumbbell / Cable)"
  ],
  "Quads": [
    "Squat (Back / Front / Box / Zercher)",
    "Hack Squat",
    "Leg Press",
    "Bulgarian Split Squat",
    "Lunge (Walking / Stationary / Reverse)",
    "Leg Extension",
    "Step-Up"
  ],
  "Hamstrings": [
    "Romanian Deadlift",
    "Stiff Leg Deadlift",
    "Good Morning",
    "Leg Curl (Lying / Seated / Standing)",
    "Nordic Hamstring Curl"
  ],
  "Glutes": [
    "Hip Thrust (Barbell / Dumbbell)",
    "Glute Bridge",
    "Cable Pull-Through",
    "Reverse Hyperextension",
    "Clamshells",
    "Lateral Band Walk"
  ],
  "Calves": [
    "Standing Calf Raise (Barbell / Dumbbell / Machine)",
    "Seated Calf Raise",
    "Donkey Calf Raise",
    "Single-Leg Calf Raise"
  ],
  "Core": [
    "Plank (Standard / Side / Weighted)",
    "Crunches (Standard / Bicycle / Reverse)",
    "Leg Raise (Hanging / Lying)",
    "Russian Twist",
    "Dead Bug",
    "Mountain Climbers",
    "Ab Wheel Rollout",
    "Cable Crunch",
    "Woodchopper"
  ]
}

const CARDIO_EXERCISES = [
  "Treadmill",
  "Elliptical",
  "Stationary Bike",
  "Rowing Machine",
  "Stair Climber",
  "Running (Outdoor)",
  "Walking",
  "Cycling (Outdoor)",
  "Swimming",
  "Jump Rope"
]

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'weight-training' | 'cardio' | 'history'>('home')
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [currentExercise, setCurrentExercise] = useState('')
  const [currentSets, setCurrentSets] = useState<{weight: string, reps: string}[]>([])
  const [sessionExercises, setSessionExercises] = useState<{name: string, sets: {weight: string, reps: string}[]}[]>([])

  const saveWorkout = () => {
    if (sessionExercises.length === 0) {
      alert('Please add at least one exercise before saving.')
      return
    }

    const workout: Workout = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      exercises: sessionExercises.map(ex => ({
        name: ex.name,
        sets: ex.sets
      })),
      cardio: []
    }

    setWorkouts([...workouts, workout])
    setSessionExercises([])
    setCurrentExercise('')
    setCurrentSets([])
    alert('Workout saved successfully!')
  }

  const deleteWorkout = (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout?')) {
      setWorkouts(workouts.filter(workout => workout.id !== workoutId))
    }
  }

  const getCurrentWeekWorkouts = () => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    startOfWeek.setHours(0, 0, 0, 0)
    
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= startOfWeek
    })
  }

  const weekWorkouts = getCurrentWeekWorkouts()

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900 text-white">
      {/* Header with logo */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-red-900 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <img 
              src="/locked-in-logo.png" 
              alt="Locked In" 
              className="h-12 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = document.createElement('div')
                fallback.innerHTML = '<span class="text-2xl font-bold text-red-400">LOCKED IN</span>'
                target.parentNode?.appendChild(fallback)
              }}
            />
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Progress Stats */}
            <div className="bg-gradient-to-r from-gray-900/80 to-red-900/80 backdrop-blur-sm rounded-xl p-6 border border-red-900/30">
              <h2 className="text-xl font-bold mb-4 text-white">This Week's Progress</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{weekWorkouts.length}</div>
                  <div className="text-sm text-gray-300">Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">
                    {weekWorkouts.reduce((total, workout) => 
                      total + workout.exercises.reduce((exerciseTotal, exercise) => 
                        exerciseTotal + exercise.sets.length, 0), 0)}
                  </div>
                  <div className="text-sm text-gray-300">Total Sets</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button 
                onClick={() => setCurrentView('weight-training')}
                className="w-full bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-900/50"
              >
                <span>Weight Training</span>
              </button>

              <button 
                onClick={() => setCurrentView('cardio')}
                className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-800/50"
              >
                <span>Cardio Workout</span>
              </button>

              <button 
                onClick={() => setCurrentView('history')}
                className="w-full bg-gradient-to-r from-gray-900 to-red-900 hover:from-gray-800 hover:to-red-800 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-red-900/30"
              >
                <span>View History</span>
              </button>
            </div>

            {/* Recent Activity */}
            {workouts.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {workouts.slice(-3).reverse().map((workout) => (
                    <div key={workout.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                      <div>
                        <div className="font-medium">{workout.date}</div>
                        <div className="text-sm text-gray-400">
                          {workout.exercises.length} exercises, {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCurrentView('weight-training')}
                          className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
                        >
                          Start Weight Training
                        </button>
                        <button
                          onClick={() => setCurrentView('cardio')}
                          className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                        >
                          Start Cardio
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'weight-training' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Weight Training</h2>
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Current Exercise Being Added */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-4">Add Exercise</h3>
              
              <div className="space-y-3">
                <select 
                  className="w-full bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                  value={currentExercise}
                  onChange={(e) => setCurrentExercise(e.target.value)}
                >
                  <option value="">Select an exercise...</option>
                  {Object.entries(EXERCISE_GROUPS).map(([group, exercises]) => (
                    <optgroup key={group} label={group} className="bg-gray-700 font-semibold">
                      {exercises.map((exercise) => (
                        <option key={exercise} value={exercise} className="bg-gray-600 pl-4">
                          {exercise}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {currentExercise && (
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="font-medium mb-3">{currentExercise}</h4>
                    
                    {/* Display existing sets */}
                    {currentSets.map((set, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 text-sm mb-2">
                        <div className="text-gray-400 text-center py-2">Set {index + 1}</div>
                        <div className="bg-gray-600 rounded p-2 text-center">{set.weight} lbs</div>
                        <div className="bg-gray-600 rounded p-2 text-center">{set.reps} reps</div>
                        <button 
                          onClick={() => setCurrentSets(currentSets.filter((_, i) => i !== index))}
                          className="bg-red-600 hover:bg-red-700 rounded p-2 transition-colors text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    ))}

                    {/* Add new set */}
                    <div className="grid grid-cols-4 gap-2 text-sm">
                      <div className="text-gray-400 text-center py-2">Set {currentSets.length + 1}</div>
                      <input 
                        type="number" 
                        placeholder="Weight"
                        className="bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const weight = (e.target as HTMLInputElement).value
                            const repsInput = (e.target as HTMLInputElement).nextElementSibling as HTMLInputElement
                            const reps = repsInput?.value
                            if (weight && reps) {
                              setCurrentSets([...currentSets, { weight, reps }])
                              ;(e.target as HTMLInputElement).value = ''
                              repsInput.value = ''
                            }
                          }
                        }}
                      />
                      <input 
                        type="number" 
                        placeholder="Reps"
                        className="bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const reps = (e.target as HTMLInputElement).value
                            const weightInput = (e.target as HTMLInputElement).previousElementSibling as HTMLInputElement
                            const weight = weightInput?.value
                            if (weight && reps) {
                              setCurrentSets([...currentSets, { weight, reps }])
                              weightInput.value = ''
                              ;(e.target as HTMLInputElement).value = ''
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const weightInput = document.querySelector('input[placeholder="Weight"]') as HTMLInputElement
                          const repsInput = document.querySelector('input[placeholder="Reps"]') as HTMLInputElement
                          const weight = weightInput?.value
                          const reps = repsInput?.value
                          if (weight && reps) {
                            setCurrentSets([...currentSets, { weight, reps }])
                            weightInput.value = ''
                            repsInput.value = ''
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 rounded p-2 transition-colors text-xs"
                      >
                        Add Set
                      </button>
                    </div>

                    <button 
                      onClick={() => {
                        if (currentSets.length > 0) {
                          setSessionExercises([...sessionExercises, { name: currentExercise, sets: currentSets }])
                          setCurrentExercise('')
                          setCurrentSets([])
                        }
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-3"
                    >
                      Add to Workout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Session Exercises */}
            {sessionExercises.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium mb-4">Today's Workout</h3>
                
                {sessionExercises.map((exercise, exerciseIndex) => (
                  <div key={exerciseIndex} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-blue-300">{exercise.name}</h4>
                      <button
                        onClick={() => {
                          setSessionExercises(sessionExercises.filter((_, i) => i !== exerciseIndex))
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    <div className="space-y-1">
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-3 gap-2 text-sm bg-gray-700 rounded p-2">
                          <div className="text-gray-400">Set {setIndex + 1}</div>
                          <div>{set.weight} lbs</div>
                          <div>{set.reps} reps</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">
                    Total Weight Lifted: {sessionExercises.reduce((total, exercise) => 
                      total + exercise.sets.reduce((exerciseTotal, set) => 
                        exerciseTotal + (parseFloat(set.weight) * parseFloat(set.reps)), 0), 0).toLocaleString()} lbs
                  </div>
                  <button 
                    onClick={saveWorkout}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Save Workout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'cardio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cardio Workout</h2>
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium mb-4">Record Cardio Session</h3>
              
              <div className="space-y-3">
                <select className="w-full bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white">
                  <option value="">Select cardio exercise...</option>
                  {CARDIO_EXERCISES.map((exercise) => (
                    <option key={exercise} value={exercise}>{exercise}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="Duration (min)"
                    className="bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                  />
                  <input 
                    type="number" 
                    placeholder="Speed (mph)"
                    className="bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="number" 
                    placeholder="Incline (%)"
                    className="bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                  />
                  <input 
                    type="number" 
                    placeholder="Distance (mi)"
                    className="bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                  />
                </div>

                <input 
                  type="number" 
                  placeholder="Calories burned"
                  className="w-full bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white"
                />

                <textarea 
                  placeholder="Notes (optional)"
                  className="w-full bg-gray-600 border border-gray-500 rounded p-2 focus:border-blue-400 outline-none text-white resize-none"
                  rows={3}
                />
              </div>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-lg transition-colors">
              Save Cardio Workout
            </button>
          </div>
        )}

        {currentView === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Workout History</h2>
              <button 
                onClick={() => setCurrentView('home')}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {workouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">No workouts recorded yet</div>
                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentView('weight-training')}
                    className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Start Weight Training
                  </button>
                  <button
                    onClick={() => setCurrentView('cardio')}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Start Cardio
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {workouts.slice().reverse().map((workout) => (
                  <div key={workout.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{workout.date}</h3>
                        <p className="text-sm text-gray-400">
                          {workout.exercises.length} exercises, {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
                        </p>
                      </div>
                      <button
                        onClick={() => deleteWorkout(workout.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {workout.exercises.map((exercise, index) => (
                        <div key={index} className="bg-gray-700 rounded p-3">
                          <h4 className="font-medium text-blue-300 mb-2">{exercise.name}</h4>
                          <div className="space-y-1">
                            {exercise.sets.map((set, setIndex) => (
                              <div key={setIndex} className="grid grid-cols-3 gap-2 text-sm">
                                <div className="text-gray-400">Set {setIndex + 1}</div>
                                <div>{set.weight} lbs</div>
                                <div>{set.reps} reps</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div className="text-sm text-gray-400 pt-2 border-t border-gray-600">
                        Total Weight Lifted: {workout.exercises.reduce((total, exercise) => 
                          total + exercise.sets.reduce((exerciseTotal, set) => 
                            exerciseTotal + (parseFloat(set.weight) * parseFloat(set.reps)), 0), 0).toLocaleString()} lbs
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {workouts.length > 0 && (
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete ALL workouts? This action cannot be undone.')) {
                      setWorkouts([])
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Clear All Workouts
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-red-900">
        <div className="max-w-md mx-auto px-4">
          <div className="flex justify-around py-2">
            <button 
              onClick={() => setCurrentView('home')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'home' ? 'text-red-400' : 'text-white hover:text-red-300'
              }`}
            >
              <span className="text-lg">🏠</span>
              <span className="text-xs mt-1">Home</span>
            </button>
            
            <button 
              onClick={() => setCurrentView('weight-training')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'weight-training' ? 'text-red-400' : 'text-white hover:text-red-300'
              }`}
            >
              <span className="text-lg">💪</span>
              <span className="text-xs mt-1">Weights</span>
            </button>

            <button 
              onClick={() => setCurrentView('cardio')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'cardio' ? 'text-red-400' : 'text-white hover:text-red-300'
              }`}
            >
              <span className="text-lg">🏃</span>
              <span className="text-xs mt-1">Cardio</span>
            </button>
            
            <button 
              onClick={() => setCurrentView('history')}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                currentView === 'history' ? 'text-red-400' : 'text-white hover:text-red-300'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="text-xs mt-1">History</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Add padding to prevent content from being hidden behind bottom nav */}
      <div className="h-20"></div>
    </div>
  )
}

export default App
