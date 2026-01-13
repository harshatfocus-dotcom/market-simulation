import React, { useEffect } from 'react'
import { useStore } from '@/lib/store'
import { authenticateUser, getUserData } from '@/lib/api'
import Dashboard from './Dashboard'
import AdminDashboard from './AdminDashboard'
import { Zap } from 'lucide-react'

export const App: React.FC = () => {
  const { user, setUser, isLoading, setLoading, error, setError } = useStore()

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true)
      try {
        const uid = await authenticateUser()
        const userData = await getUserData(uid)
        if (userData) {
          setUser(userData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize')
      } finally {
        setLoading(false)
      }
    }

    if (!user) {
      initializeApp()
    }
  }, [user, setUser, setLoading, setError])

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-2">Market Simulation</h1>
          <p className="text-gray-400">Initializing your session...</p>
        </div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Connection Error</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Route based on role
  return user.role === 'admin' ? <AdminDashboard /> : <Dashboard />
}

export default App
