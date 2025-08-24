interface HomePageProps {
  onNavigate: (page: 'plan' | 'start' | 'progress' | 'history') => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="px-6 pt-6">
      {/* Quote box */}
      <div className="max-w-md mx-auto mb-6">
        <div className="bg-black border-2 border-red-700 rounded-xl p-4 text-center">
          <p className="text-white font-medium italic">
            "Success is not final, failure is not fatal: it is the courage to continue that counts."
          </p>
          <p className="text-red-400 text-sm mt-2">- Winston Churchill</p>
        </div>
      </div>
      
      {/* Quick action buttons */}
      <div className="space-y-4 max-w-md mx-auto">
        <button 
          onClick={() => onNavigate('plan')}
          className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl border-2 border-red-700 transition-colors"
        >
          Plan Workout
        </button>
        
        <button 
          onClick={() => onNavigate('start')}
          className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl border-2 border-red-700 transition-colors"
        >
          Start Workout
        </button>
        
        <button 
          onClick={() => onNavigate('progress')}
          className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl border-2 border-red-700 transition-colors"
        >
          Progress
        </button>
        
        <button 
          onClick={() => onNavigate('history')}
          className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-4 px-6 rounded-xl border-2 border-red-700 transition-colors"
        >
          History
        </button>
      </div>
    </div>
  )
}
