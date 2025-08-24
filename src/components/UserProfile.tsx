import { useState } from 'react'
import { useWorkouts } from '../contexts/WorkoutContext'
import toast from 'react-hot-toast'

interface UserProfileProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { weightLogs, saveWeightLog, deleteWeightLog, loading } = useWorkouts()
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [goalWeight, setGoalWeight] = useState('')

  const handleSaveWeight = async () => {
    if (!weight) {
      toast.error('Please enter your weight')
      return
    }

    try {
      await saveWeightLog(parseFloat(weight), notes)
      toast.success('Weight logged successfully!')
      setWeight('')
      setNotes('')
    } catch (error) {
      toast.error('Failed to log weight')
    }
  }

  const handleDeleteWeight = async (id: string, weightValue: number) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-gray-900">
          Delete weight entry ({weightValue} lbs)?
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
                await deleteWeightLog(id)
                toast.success('Weight entry deleted!')
              } catch (error) {
                toast.error('Failed to delete weight entry')
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
      day: 'numeric',
      year: 'numeric'
    })
  }

  const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : null
  const previousWeight = weightLogs.length > 1 ? weightLogs[1].weight : null
  const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-black border-2 border-red-700 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-red-700">
          <h2 className="text-white text-xl font-bold">User Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Stats */}
          {currentWeight && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Current Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-red-400 text-lg font-bold">{currentWeight} lbs</p>
                  <p className="text-gray-400 text-xs">Current Weight</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${
                    weightChange === null ? 'text-gray-400' :
                    weightChange > 0 ? 'text-yellow-400' : 
                    weightChange < 0 ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {weightChange === null ? '--' : 
                     weightChange > 0 ? `+${weightChange.toFixed(1)}` :
                     weightChange.toFixed(1)} lbs
                  </p>
                  <p className="text-gray-400 text-xs">Last Change</p>
                </div>
              </div>
            </div>
          )}

          {/* Log Weight */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Log Weight</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white"
                  placeholder="Enter weight..."
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white"
                  placeholder="Morning weigh-in, after workout..."
                />
              </div>
              <button
                onClick={handleSaveWeight}
                disabled={loading || !weight}
                className="w-full py-3 bg-red-700 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Saving...' : 'Log Weight'}
              </button>
            </div>
          </div>

          {/* Weight History */}
          {weightLogs.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Weight History</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {weightLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex justify-between items-center p-2 bg-black rounded-lg">
                    <div>
                      <p className="text-white font-medium">{log.weight} lbs</p>
                      <p className="text-gray-400 text-xs">{formatDate(log.logged_at)}</p>
                      {log.notes && (
                        <p className="text-gray-500 text-xs mt-1">{log.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteWeight(log.id || '', log.weight)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 rounded transition-colors"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Profile Settings (Future Enhancement) */}
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-3">Profile Settings</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Height (ft)</label>
                  <input
                    type="number"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Height (in)</label>
                  <input
                    type="number"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white"
                    placeholder="9"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Goal Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={goalWeight}
                  onChange={(e) => setGoalWeight(e.target.value)}
                  className="w-full p-3 bg-black border border-gray-600 rounded-lg text-white"
                  placeholder="Target weight..."
                />
              </div>
              <p className="text-gray-500 text-xs">
                Profile settings coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
