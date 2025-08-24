import './index.css'

import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { WorkoutProvider } from './contexts/WorkoutContext'
import HomePage from './components/HomePage'
import PlanWorkout from './components/PlanWorkout'
import StartWorkout from './components/StartWorkout'
import Progress from './components/Progress'
import History from './components/History'
import UserProfile from './components/UserProfile'

type Page = 'home' | 'plan' | 'start' | 'progress' | 'history'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [showUserProfile, setShowUserProfile] = useState(false)

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
        </div>
        
        {/* Current page content */}
        {renderCurrentPage()}
        
        {/* Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-red-700 px-6 py-3">
          <div className="flex justify-center">
            <button 
              onClick={() => setCurrentPage('home')}
              className={`flex flex-col items-center p-2 ${currentPage === 'home' ? 'text-red-400' : 'text-white'}`}
            >
              <img src="/locked-in-logo.png" alt="Home" className="h-8 w-8 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </button>
          </div>
        </div>
        
        {/* Basic landing page with black on top 1/3 transitioning to red */}
        
        {/* User Profile Modal */}
        <UserProfile 
          isOpen={showUserProfile} 
          onClose={() => setShowUserProfile(false)} 
        />
      </div>
      
      {/* Modern Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#000',
            color: '#fff',
            border: '2px solid #dc2626',
            borderRadius: '12px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </WorkoutProvider>
  )
}

export default App
