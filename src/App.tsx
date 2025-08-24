import './index.css'

import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { supabase } from './lib/supabase'
import LoginScreen from './components/LoginScreen'
import HomePage from './components/HomePage'
import PlanWorkout from './components/PlanWorkout'
import StartWorkout from './components/StartWorkout'
import Progress from './components/Progress'
import History from './components/History'
import UserProfile from './components/UserProfile'
import AdminMenu from './components/AdminMenu'
import PendingApprovalScreen from './components/PendingApprovalScreen'

type Page = 'home' | 'plan' | 'start' | 'progress' | 'history'

function AuthenticatedApp() {
  const { signOut, user } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !supabase) {
        console.log('No user or supabase available for admin check')
        return
      }

      console.log('=== CHECKING ADMIN STATUS ===')
      console.log('User ID:', user.id)
      console.log('User Email:', user.email)

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('is_admin, email, full_name, is_approved')
          .eq('user_id', user.id)
          .single()

        console.log('Admin check result:', { data, error })

        if (error) {
          console.error('Error checking admin status:', error)
          setIsAdmin(false)
          setIsApproved(false)
        } else if (data) {
          console.log(`User ${data.email} admin: ${data.is_admin}, approved: ${data.is_approved}`)
          setIsAdmin(data.is_admin === true)
          setIsApproved(data.is_approved === true)
        } else {
          console.log('No user profile found')
          setIsAdmin(false)
          setIsApproved(false)
        }
      } catch (error) {
        console.error('Unexpected error checking admin status:', error)
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user?.id]) // Use user.id instead of user object

  // Also check admin status when the component mounts
  useEffect(() => {
    if (user?.id) {
      console.log('User changed, checking admin status...')
      // Small delay to ensure profile creation is complete
      setTimeout(() => {
        const checkAdminStatus = async () => {
          if (!user || !supabase) return

          console.log('=== DELAYED ADMIN CHECK ===')
          try {
            const { data, error } = await supabase
              .from('user_profiles')
              .select('is_admin, email, full_name, is_approved')
              .eq('user_id', user.id)
              .single()

            console.log('Delayed admin check result:', { data, error })

            if (!error && data) {
              console.log(`Delayed check - User ${data.email} admin: ${data.is_admin}, approved: ${data.is_approved}`)
              setIsAdmin(data.is_admin === true)
              setIsApproved(data.is_approved === true)
            }
          } catch (error) {
            console.error('Delayed admin check error:', error)
          }
        }
        checkAdminStatus()
      }, 2000) // 2 second delay
    }
  }, [user?.email]) // Trigger on email change too

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'plan':
        return <PlanWorkout />
      case 'start':
        return <StartWorkout />
      case 'progress':
        return <Progress />
      case 'history':
        return <History />
      default:
        return <HomePage onNavigate={setCurrentPage} />
    }
  }

  // If user is not approved and not admin, show pending approval screen
  if (!isApproved && !isAdmin) {
    return <PendingApprovalScreen />
  }

  return (
    <WorkoutProvider>
      <div className="min-h-screen bg-gradient-to-b from-black via-black via-33% to-red-900 pb-20">
        {/* Header with logo and user icon */}
        <div className="relative pt-6 text-center">
          <img src="/locked-in-logo.png" alt="Locked In" className="h-40 mx-auto" />
          
          {/* User Profile Icon - Top Right */}
          <button
            onClick={() => setShowUserProfile(true)}
            className="absolute top-6 right-6 p-3 bg-red-700 hover:bg-red-600 rounded-full transition-colors"
            title="User Profile"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>

          {/* Admin Menu Button - Only show for admins */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminMenu(true)}
              className="absolute top-6 right-20 p-3 bg-yellow-600 hover:bg-yellow-500 rounded-full transition-colors"
              title="Admin Panel"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          )}

          {/* Sign Out Button - Top Left */}
          <button
            onClick={signOut}
            className="absolute top-6 left-6 p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            title="Sign Out"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>

        {/* Page Content */}
        {renderCurrentPage()}

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-red-700">
          <div className="max-w-md mx-auto">
            <div className="flex justify-around py-3">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'home'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('plan')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'plan'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Plan
              </button>
              <button
                onClick={() => setCurrentPage('start')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'start'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Start
              </button>
              <button
                onClick={() => setCurrentPage('progress')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'progress'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 'history'
                    ? 'bg-red-700 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                History
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Modal */}
        {showUserProfile && (
          <UserProfile 
            isOpen={showUserProfile}
            onClose={() => setShowUserProfile(false)} 
          />
        )}

        {/* Admin Menu Modal */}
        {showAdminMenu && (
          <AdminMenu
            isOpen={showAdminMenu}
            onClose={() => setShowAdminMenu(false)}
          />
        )}

        {/* Toast Container */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #dc2626',
            },
          }}
        />
      </div>
    </WorkoutProvider>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <img src="/locked-in-logo.png" alt="Locked In" className="w-24 h-24 mx-auto mb-4" />
          <div className="w-8 h-8 border-2 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <AuthenticatedApp />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
