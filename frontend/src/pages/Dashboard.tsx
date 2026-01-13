import React, { useEffect, useState } from 'react'
import { useStore, Stock, News } from '@/lib/store'
import { submitTrade } from '@/lib/api'
import PriceTicker from '@/components/PriceTicker'
import NewsCard from '@/components/NewsCard'
import TradeForm from '@/components/TradeForm'
import Portfolio from '@/components/Portfolio'
import PriceChart from '@/components/PriceChart'
import { onSnapshot, collection, doc, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AlertCircle, Zap } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { user, market, setMarket, isLoading, setLoading } = useStore()
  const [selectedStock, setSelectedStock] = useState('TECH')
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [lastNews, setLastNews] = useState<News | null>(null)
  const [tradingError, setTradingError] = useState<string | null>(null)

  // Subscribe to market state
  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(doc(db, `artifacts/${user.id}/public/data/market_state/main`), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setMarket(data as any)
      }
    })

    return () => unsubscribe()
  }, [user, setMarket])

  // Load price history
  useEffect(() => {
    if (!selectedStock) return

    const loadHistory = async () => {
      try {
        const q = query(
          collection(db, 'price_history'),
          orderBy('timestamp', 'desc'),
          limit(60)
        )
        const snapshot = await getDocs(q)
        const history = snapshot.docs
          .map((d) => d.data())
          .filter((d) => d.symbol === selectedStock)
          .reverse()

        setPriceHistory(
          history.map((h) => ({
            time: new Date(h.timestamp).toLocaleTimeString(),
            price: h.price
          }))
        )
      } catch (error) {
        console.error('Failed to load price history:', error)
      }
    }

    loadHistory()
  }, [selectedStock])

  // Subscribe to latest news
  useEffect(() => {
    if (!user) return

    const unsubscribe = onSnapshot(
      query(collection(db, 'news'), orderBy('timestamp', 'desc'), limit(1)),
      (snapshot) => {
        if (!snapshot.empty) {
          setLastNews(snapshot.docs[0].data() as News)
        }
      }
    )

    return () => unsubscribe()
  }, [user])

  const handleTrade = async (quantity: number, type: 'buy' | 'sell') => {
    if (!user || !market) return

    setLoading(true)
    setTradingError(null)

    try {
      const stock = market.prices[selectedStock]
      if (!stock) throw new Error('Stock not found')

      const sentiment = lastNews?.sentiment || 0
      const newsContext = lastNews ? [lastNews.id] : []

      await submitTrade(
        user.id,
        selectedStock,
        quantity,
        stock.price,
        type,
        sentiment,
        newsContext
      )

      setTradingError(null)
    } catch (error) {
      setTradingError(error instanceof Error ? error.message : 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user || !market) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-2">Initializing Market...</h1>
          <p className="text-gray-400">Connecting to live market feed</p>
        </div>
      </div>
    )
  }

  const currentStock = market.prices[selectedStock]

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-800 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Market Simulation</h1>
              <p className="text-gray-400 mt-1">
                Session: <span className="text-yellow-500 font-semibold">{market.sessionStatus}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">${user.totalValue.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Total Portfolio Value</p>
            </div>
          </div>
        </div>

        {/* Market Status Warning */}
        {market.sessionStatus !== 'active' && (
          <div className="bg-orange-900/20 border border-orange-600/50 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-semibold text-orange-500">Market {market.sessionStatus}</h3>
              <p className="text-gray-400 text-sm">Trading is currently {market.sessionStatus}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Prices & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Tickers */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Market Prices</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(market.prices).map((stock: Stock) => (
                  <PriceTicker
                    key={stock.symbol}
                    stock={stock}
                    onClick={() => setSelectedStock(stock.symbol)}
                  />
                ))}
              </div>
            </div>

            {/* Price Chart */}
            {priceHistory.length > 0 && (
              <PriceChart data={priceHistory} symbol={selectedStock} />
            )}

            {/* News Feed */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Market News</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {market.news && market.news.length > 0 ? (
                  market.news.slice(0, 5).map((news: News) => (
                    <NewsCard key={news.id} news={news} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">Awaiting market news...</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Trade & Portfolio */}
          <div className="space-y-6">
            {/* Trade Form */}
            {currentStock && (
              <>
                <TradeForm
                  symbol={selectedStock}
                  currentPrice={currentStock.price}
                  cash={user.cash}
                  onSubmit={handleTrade}
                  isLoading={isLoading}
                />

                {tradingError && (
                  <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-3 text-sm text-red-400">
                    {tradingError}
                  </div>
                )}
              </>
            )}

            {/* Portfolio */}
            <Portfolio
              user={user}
              prices={Object.fromEntries(
                Object.entries(market.prices).map(([k, v]: [string, any]) => [k, v.price])
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
