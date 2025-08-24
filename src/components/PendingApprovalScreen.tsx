import { useAuth } from '../contexts/AuthContext'

export default function PendingApprovalScreen() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/locked-in-logo.png" 
              alt="Locked In" 
              className="w-32 h-32 mx-auto opacity-75"
            />
          </div>
        </div>

        <div className="bg-black border-2 border-yellow-600 rounded-xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <h2 className="text-white text-xl font-semibold mb-2">
              Pending Approval
            </h2>
            <p className="text-gray-300 text-sm mb-4">
              Your account is waiting for admin approval. You'll be able to access the app once an administrator reviews your request.
            </p>
            <p className="text-gray-400 text-xs">
              Please check back later or contact an administrator if you need immediate access.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Check Status
            </button>
            
            <button
              onClick={signOut}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
