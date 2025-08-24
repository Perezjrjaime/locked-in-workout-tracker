import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const createMyProfile = async () => {
    if (!user) {
      toast.error('No user signed in')
      return
    }

    setLoading(true)
    try {
      if (!supabase) {
        toast.error('Supabase not available')
        return
      }

      const profileData = {
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  user.email?.split('@')[0] || 'User',
        is_admin: true // Make yourself admin
      }

      console.log('Creating profile with data:', profileData)

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        toast.error(`Error: ${error.message}`)
      } else {
        console.log('Profile created:', data)
        toast.success('Profile created successfully!')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const makeMyselAdmin = async () => {
    if (!user || !supabase) {
      toast.error('No user or supabase available')
      return
    }

    try {
      // Direct update to make current user admin
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_admin: true })
        .eq('user_id', user.id)

      if (error) {
        console.error('Error making admin:', error)
        toast.error(`Error: ${error.message}`)
      } else {
        toast.success('Made yourself admin! Refresh the page.')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Unexpected error occurred')
    }
  }

  const checkProfile = async () => {
    if (!user) {
      toast.error('No user signed in')
      return
    }

    try {
      if (!supabase) {
        toast.error('Supabase not available')
        return
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        console.error('Error checking profile:', error)
        toast.error(`Error: ${error.message}`)
      } else {
        console.log('Profile data:', data)
        if (data.length === 0) {
          toast.error('No profile found')
        } else {
          toast.success(`Profile found: ${JSON.stringify(data[0])}`)
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Unexpected error occurred')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg border-2 border-yellow-400 z-50">
      <h3 className="text-sm font-bold mb-2">🔧 ADMIN PANEL</h3>
      <p className="text-xs mb-3">Signed in as: {user.email}</p>
      <div className="space-y-2">
        <button
          onClick={checkProfile}
          className="block w-full text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Check Profile
        </button>
        <button
          onClick={createMyProfile}
          disabled={loading}
          className="block w-full text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create My Profile'}
        </button>
        <button
          onClick={makeMyselAdmin}
          className="block w-full text-xs bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
        >
          Make Me Admin
        </button>
        <button
          onClick={() => window.location.reload()}
          className="block w-full text-xs bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
