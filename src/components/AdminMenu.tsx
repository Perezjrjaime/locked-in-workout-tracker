import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  is_admin: boolean
  is_approved: boolean
  created_at: string
}

interface AdminMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminMenu({ isOpen, onClose }: AdminMenuProps) {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user || !supabase) return

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .single()

        if (!error && data) {
          setIsAdmin(data.is_admin)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
      }
    }

    checkAdminStatus()
  }, [user])

  // Load all users (only if admin)
  const loadUsers = async () => {
    if (!isAdmin || !supabase) return

    setLoading(true)
    try {
      // Use RPC function to bypass RLS for admin operations
      const { data, error } = await supabase.rpc('get_all_user_profiles')

      if (error) {
        console.error('Error loading users:', error)
        // Fallback: try direct query
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (fallbackError) {
          toast.error('Error loading users')
        } else {
          setUsers(fallbackData || [])
        }
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Toggle approval status
  const toggleApprovalStatus = async (userId: string, currentStatus: boolean) => {
    if (!supabase) return

    try {
      const rpcFunction = currentStatus ? 'reject_user' : 'approve_user'
      const { error } = await supabase.rpc(rpcFunction, {
        target_user_id: userId
      })

      if (error) {
        console.error('Error updating approval status:', error)
        toast.error('Failed to update approval status')
      } else {
        toast.success(`User ${!currentStatus ? 'approved' : 'rejected'} successfully`)
        loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Failed to update user')
    }
  }

  // Toggle admin status
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    if (!supabase) return

    try {
      const { error } = await supabase.rpc('update_user_admin_status', {
        target_user_id: userId,
        new_admin_status: !currentStatus
      })

      if (error) {
        console.error('Error updating admin status:', error)
        toast.error('Failed to update admin status')
      } else {
        toast.success(`User ${!currentStatus ? 'promoted to' : 'removed from'} admin`)
        loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Failed to update user')
    }
  }

  // Delete user profile
  const deleteUser = async (userId: string, email: string) => {
    if (!supabase) return

    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return
    }

    try {
      const { error } = await supabase.rpc('delete_user_profile', {
        target_user_id: userId
      })

      if (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      } else {
        toast.success('User deleted successfully')
        loadUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Failed to delete user')
    }
  }

  // Load users when menu opens
  useEffect(() => {
    if (isOpen && isAdmin) {
      loadUsers()
    }
  }, [isOpen, isAdmin])

  // Don't show menu if not admin
  if (!isAdmin || !isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-700 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">User Management</h3>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Users List */}
          <div className="overflow-auto max-h-[60vh]">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-red-700 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No users found
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((userProfile) => (
                  <div
                    key={userProfile.user_id}
                    className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {userProfile.full_name}
                      </h4>
                      <p className="text-gray-600 text-sm">{userProfile.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            userProfile.is_admin
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {userProfile.is_admin ? 'Admin' : 'User'}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            userProfile.is_approved
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {userProfile.is_approved ? 'Approved' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleApprovalStatus(userProfile.user_id, userProfile.is_approved)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          userProfile.is_approved
                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {userProfile.is_approved ? 'Reject' : 'Approve'}
                      </button>
                      
                      <button
                        onClick={() => toggleAdminStatus(userProfile.user_id, userProfile.is_admin)}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          userProfile.is_admin
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {userProfile.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      
                      {userProfile.user_id !== user?.id && (
                        <button
                          onClick={() => deleteUser(userProfile.user_id, userProfile.email)}
                          className="px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
