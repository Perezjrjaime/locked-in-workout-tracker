import { useState, useMemo } from 'react'
import { useWorkouts } from '../contexts/WorkoutContext'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface ExerciseProgress {
  name: string
  sessions: {
    date: string
    maxWeight: number
    totalReps: number
    totalSets: number
    totalVolume: number // weight * reps
    weekNumber: number
  }[]
}

export default function Progress() {
  const { completedWorkouts, weightLogs, loading } = useWorkouts()
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [timeframe, setTimeframe] = useState<'1month' | '2months' | '3months' | 'alltime'>('2months')

  // Process workout data into exercise progress
  const exerciseProgress = useMemo(() => {
    if (!completedWorkouts || completedWorkouts.length === 0) return []

    const progressMap = new Map<string, ExerciseProgress>()
    
    completedWorkouts.forEach((workout: any) => {
      if (!workout.completed_sets) return
      
      const workoutDate = new Date(workout.completed_at)
      const weekNumber = Math.floor((Date.now() - workoutDate.getTime()) / (1000 * 60 * 60 * 24 * 7))
      
      // Group sets by exercise
      const exerciseMap = new Map()
      workout.completed_sets.forEach((set: any) => {
        if (!exerciseMap.has(set.exercise_name)) {
          exerciseMap.set(set.exercise_name, [])
        }
        exerciseMap.get(set.exercise_name).push(set)
      })

      // Process each exercise
      exerciseMap.forEach((sets, exerciseName) => {
        if (!progressMap.has(exerciseName)) {
          progressMap.set(exerciseName, {
            name: exerciseName,
            sessions: []
          })
        }

        const maxWeight = Math.max(...sets.map((s: any) => s.weight))
        const totalReps = sets.reduce((sum: number, s: any) => sum + s.reps, 0)
        const totalSets = sets.length
        const totalVolume = sets.reduce((sum: number, s: any) => sum + (s.weight * s.reps), 0)

        progressMap.get(exerciseName)!.sessions.push({
          date: workoutDate.toISOString().split('T')[0],
          maxWeight,
          totalReps,
          totalSets,
          totalVolume,
          weekNumber
        })
      })
    })

    // Sort sessions by date and limit by timeframe
    const daysToShow = timeframe === '1month' ? 30 : timeframe === '2months' ? 60 : timeframe === '3months' ? 90 : Infinity
    
    return Array.from(progressMap.values()).map(exercise => ({
      ...exercise,
      sessions: exercise.sessions
        .filter(session => {
          if (timeframe === 'alltime') return true
          const sessionDate = new Date(session.date)
          const daysAgo = (Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
          return daysAgo <= daysToShow
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })).filter(exercise => exercise.sessions.length >= 2) // Only show exercises with multiple sessions
  }, [completedWorkouts, timeframe])

  // Process weight data for charts
  const weightProgress = useMemo(() => {
    if (!weightLogs || weightLogs.length === 0) return []

    const daysToShow = timeframe === '1month' ? 30 : timeframe === '2months' ? 60 : timeframe === '3months' ? 90 : Infinity
    
    return weightLogs
      .filter(log => {
        if (timeframe === 'alltime') return true
        const logDate = new Date(log.logged_at)
        const daysAgo = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysAgo <= daysToShow
      })
      .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())
      .map(log => ({
        date: log.logged_at.split('T')[0],
        weight: log.weight,
        notes: log.notes
      }))
  }, [weightLogs, timeframe])

  // Get overall stats
  const overallStats = useMemo(() => {
    if (completedWorkouts.length === 0) return null

    const totalWorkouts = completedWorkouts.length
    const totalVolume = completedWorkouts.reduce((sum, workout: any) => {
      if (!workout.completed_sets) return sum
      return sum + workout.completed_sets.reduce((wSum: number, set: any) => 
        wSum + (set.weight * set.reps), 0)
    }, 0)

    const recentWorkouts = completedWorkouts
      .filter((w: any) => {
        const date = new Date(w.completed_at)
        const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
        return daysAgo <= 30
      })

    const avgWorkoutsPerWeek = (recentWorkouts.length / 4.3).toFixed(1) // 30 days / 7 days

    return {
      totalWorkouts,
      totalVolume: totalVolume.toLocaleString(),
      avgWorkoutsPerWeek
    }
  }, [completedWorkouts])

  const selectedExerciseData = exerciseProgress.find(ex => ex.name === selectedExercise)

  if (loading) {
    return (
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-bold mb-6 text-center">Progress</h1>
          <div className="bg-black border-2 border-red-700 rounded-xl p-6 text-center">
            <p className="text-white font-medium">Loading progress data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!completedWorkouts || completedWorkouts.length === 0) {
    return (
      <div className="px-6 pt-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-bold mb-6 text-center">Progress</h1>
          <div className="bg-black border-2 border-red-700 rounded-xl p-6 text-center">
            <p className="text-white font-medium mb-2">No progress data yet</p>
            <p className="text-gray-400 text-sm">Complete a few workouts to see your progress!</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-6 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-white text-2xl font-bold text-center">Progress</h1>

        {/* Overall Stats */}
        {overallStats && (
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h2 className="text-white font-semibold mb-3">Overall Stats</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-red-400 text-lg font-bold">{overallStats.totalWorkouts}</p>
                <p className="text-gray-400 text-xs">Total Workouts</p>
              </div>
              <div>
                <p className="text-red-400 text-lg font-bold">{overallStats.totalVolume}</p>
                <p className="text-gray-400 text-xs">Total Volume (lbs)</p>
              </div>
              <div>
                <p className="text-red-400 text-lg font-bold">{overallStats.avgWorkoutsPerWeek}</p>
                <p className="text-gray-400 text-xs">Workouts/Week</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeframe Selector */}
        <div className="bg-black border-2 border-red-700 rounded-xl p-4">
          <h3 className="text-white font-semibold mb-3">Timeframe</h3>
          <div className="flex gap-2">
            {(['1month', '2months', '3months', 'alltime'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  timeframe === period
                    ? 'bg-red-700 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {period === '1month' ? '1 Month' : 
                 period === '2months' ? '2 Months' : 
                 period === '3months' ? '3 Months' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Selector */}
        {exerciseProgress.length > 0 && (
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Select Exercise</h3>
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="">Choose an exercise...</option>
              {exerciseProgress.map((exercise) => (
                <option key={exercise.name} value={exercise.name}>
                  {exercise.name} ({exercise.sessions.length} sessions)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Progress Chart */}
        {selectedExerciseData && (
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">
              {selectedExerciseData.name} - Max Weight Progress
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedExerciseData.sessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${value} lbs`, 'Max Weight']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="maxWeight" 
                    stroke="#EF4444" 
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#DC2626' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Progress Summary */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-red-400 font-bold">
                    {selectedExerciseData.sessions[selectedExerciseData.sessions.length - 1]?.maxWeight}
                    <span className="text-gray-400"> lbs</span>
                  </p>
                  <p className="text-gray-400 text-xs">Current Max</p>
                </div>
                <div>
                  <p className="text-green-400 font-bold">
                    +{selectedExerciseData.sessions[selectedExerciseData.sessions.length - 1]?.maxWeight - 
                      selectedExerciseData.sessions[0]?.maxWeight}
                    <span className="text-gray-400"> lbs</span>
                  </p>
                  <p className="text-gray-400 text-xs">Total Gain</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Volume Chart */}
        {selectedExerciseData && (
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">
              {selectedExerciseData.name} - Volume Progress
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={selectedExerciseData.sessions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toLocaleString()} lbs`, 'Total Volume']}
                  />
                  <Bar dataKey="totalVolume" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weight Progress Chart */}
        {weightProgress.length > 0 && (
          <div className="bg-black border-2 border-red-700 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Body Weight Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number) => [`${value} lbs`, 'Body Weight']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Weight Progress Summary */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-green-400 font-bold">
                    {weightProgress[weightProgress.length - 1]?.weight}
                    <span className="text-gray-400"> lbs</span>
                  </p>
                  <p className="text-gray-400 text-xs">Current Weight</p>
                </div>
                <div>
                  <p className={`font-bold ${
                    (weightProgress[weightProgress.length - 1]?.weight - weightProgress[0]?.weight) > 0 
                      ? 'text-yellow-400' 
                      : 'text-green-400'
                  }`}>
                    {(weightProgress[weightProgress.length - 1]?.weight - weightProgress[0]?.weight) > 0 ? '+' : ''}
                    {(weightProgress[weightProgress.length - 1]?.weight - weightProgress[0]?.weight).toFixed(1)}
                    <span className="text-gray-400"> lbs</span>
                  </p>
                  <p className="text-gray-400 text-xs">Total Change</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {exerciseProgress.length === 0 && (
          <div className="bg-black border-2 border-red-700 rounded-xl p-6 text-center">
            <p className="text-white font-medium mb-2">Not enough data yet</p>
            <p className="text-gray-400 text-sm">Complete the same exercises multiple times to see progress!</p>
          </div>
        )}
      </div>
    </div>
  )
}
