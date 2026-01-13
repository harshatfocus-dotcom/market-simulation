import React, { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { claimController } from '@/lib/api'
import AdminControls from '@/components/AdminControls'
import NewsInjection from '@/components/NewsInjection'
import Dashboard from './Dashboard'
import { doc, setDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Download, LogOut } from 'lucide-react'

export const AdminDashboard: React.FC = () => {
  const { user, setUser, isLoading, setLoading, setError } = useStore()
  const [isController, setIsController] = useState(false)
  const [sessionStatus, setSessionStatus] = useState('idle')
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setIsController(user.isController || false)
  }, [user])

  const handleClaimController = async () => {
    if (!user) return
    setLoading(true)

    try {
      const sessionId = await claimController(user.id)
      
      // Update user as controller
      if (user) {
        await setDoc(
          doc(db, 'users', user.id),
          { isController: true },
          { merge: true }
        )
        
        setUser({ ...user, isController: true })
        setIsController(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim control')
    } finally {
      setLoading(false)
    }
  }

  const handleStartSession = async () => {
    if (!user?.isController) return
    setLoading(true)

    try {
      const sessionId = `session-${Date.now()}`
      await setDoc(
        doc(db, 'sessions', sessionId),
        {
          id: sessionId,
          controllerId: user.id,
          active: true,
          status: 'active',
          startTime: Date.now()
        }
      )

      await setDoc(
        doc(db, `artifacts/${user.id}/public/data/market_state/main`),
        {
          prices: {
            TECH: { symbol: 'TECH', price: 100, change: 0, changePercent: 0, sentiment: 0, optics: 0 },
            ENERGY: { symbol: 'ENERGY', price: 80, change: 0, changePercent: 0, sentiment: 0, optics: 0 },
            FINANCE: { symbol: 'FINANCE', price: 120, change: 0, changePercent: 0, sentiment: 0, optics: 0 }
          },
          news: [],
          time: Date.now(),
          sessionStatus: 'active',
          controllerId: user.id,
          lastUpdate: Date.now()
        }
      )

      setSessionStatus('active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start session')
    } finally {
      setLoading(false)
    }
  }

  const handlePauseSession = async () => {
    if (!user?.isController) return
    setLoading(true)

    try {
      await setDoc(
        doc(db, `artifacts/${user.id}/public/data/market_state/main`),
        { sessionStatus: 'paused' },
        { merge: true }
      )
      setSessionStatus('paused')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause session')
    } finally {
      setLoading(false)
    }
  }

  const handleResetMarket = async () => {
    if (!user?.isController) return
    setLoading(true)

    try {
      await setDoc(
        doc(db, `artifacts/${user.id}/public/data/market_state/main`),
        {
          prices: {
            TECH: { symbol: 'TECH', price: 100, change: 0, changePercent: 0, sentiment: 0, optics: 0 },
            ENERGY: { symbol: 'ENERGY', price: 80, change: 0, changePercent: 0, sentiment: 0, optics: 0 },
            FINANCE: { symbol: 'FINANCE', price: 120, change: 0, changePercent: 0, sentiment: 0, optics: 0 }
          },
          news: [],
          time: Date.now(),
          sessionStatus: 'idle',
          controllerId: null,
          lastUpdate: Date.now()
        }
      )

      // Reset all trades and price history
      const tradesRef = collection(db, 'trades')
      const q = query(tradesRef, where('userId', '==', user.id))
      const querySnapshot = await getDocs(q)

      for (const doc of querySnapshot.docs) {
        await setDoc(doc.ref, { archived: true }, { merge: true })
      }

      setSessionStatus('idle')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset market')
    } finally {
      setLoading(false)
    }
  }

  const handleInjectNews = async (newsData: any) => {
    if (!user?.isController) return
    setLoading(true)

    try {
      const newsId = `news-${Date.now()}`
      await setDoc(doc(db, 'news', newsId), {
        id: newsId,
        ...newsData,
        timestamp: Date.now(),
        decay: 1,
        injectedBy: user.id
      })

      // Update market state
      await setDoc(
        doc(db, `artifacts/${user.id}/public/data/market_state/main`),
        { lastUpdate: Date.now() },
        { merge: true }
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to inject news')
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    if (!user?.isController) return
    setExportLoading(true)

    try {
      const tradesRef = collection(db, 'trades')
      const tradesSnapshot = await getDocs(tradesRef)
      const trades = tradesSnapshot.docs.map((d) => d.data())

      const newsRef = collection(db, 'news')
      const newsSnapshot = await getDocs(newsRef)
      const news = newsSnapshot.docs.map((d) => d.data())

      const data = {
        exportDate: new Date().toISOString(),
        trades,
        news,
        metadata: {
          totalTrades: trades.length,
          totalNewsItems: news.length
        }
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `market-data-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export data')
    } finally {
      setExportLoading(false)
    }
  }

  if (!user || !user.role || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You do not have admin permissions</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Admin Header */}
        <div className="border-b-2 border-yellow-600 pb-4">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Market Controller Panel</h1>
          <p className="text-gray-400">Experiment orchestration interface</p>
        </div>

        {/* Admin Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Controls */}
          <div className="lg:col-span-1">
            <AdminControls
              isController={isController}
              sessionStatus={sessionStatus}
              onStart={handleStartSession}
              onPause={handlePauseSession}
              onReset={handleResetMarket}
              onClaimController={handleClaimController}
              isLoading={isLoading}
            />
          </div>

          {/* News Injection */}
          <div className="lg:col-span-1">
            <NewsInjection onSubmit={handleInjectNews} isLoading={isLoading} />
          </div>

          {/* Data Export */}
          <div className="lg:col-span-1">
            <button
              onClick={handleExportData}
              disabled={!isController || exportLoading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50 transition-all h-full"
            >
              <Download size={20} />
              <div className="text-left">
                <div>Export Data</div>
                <div className="text-xs opacity-75">All trades & news</div>
              </div>
            </button>
          </div>

          {/* Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Info</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <p>Status: <span className="text-yellow-500">{sessionStatus}</span></p>
              <p>Mode: <span className={isController ? 'text-green-500' : 'text-orange-500'}>
                {isController ? 'ACTIVE' : 'STANDBY'}
              </span></p>
            </div>
          </div>
        </div>

        {/* Full Dashboard Below */}
        <div className="border-t border-gray-800 pt-6">
          <Dashboard />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
