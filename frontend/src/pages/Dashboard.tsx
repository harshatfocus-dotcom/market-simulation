import React, { useEffect, useState } from 'react'
import { useStore, Stock, News } from '@/lib/store'
import { submitTrade } from '@/lib/api'
import { marketEngine } from '@/lib/market-engine'
import PriceTicker from '@/components/PriceTicker'
import NewsCard from '@/components/NewsCard'
import TradeForm from '@/components/TradeForm'
import Portfolio from '@/components/Portfolio'
import PriceChart from '@/components/PriceChart'
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { AlertCircle, Zap } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { user, isLoading, setLoading } = useStore()
  const [selectedStock, setSelectedStock] = useState('TECH')
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [currentPrice, setCurrentPrice] = useState(100)
  const [news, setNews] = useState<News[]>([])
  const [tradingError, setTradingError] = useState<string | null>(null)
  const [stocks, setStocks] = useState<Record<string, Stock>>({
    TECH: { symbol: 'TECH', price: 100, change: 0, changePercent: 0, sentiment: 0, optics: 0 },
    BIO: { symbol: 'BIO', price: 95, change: 0, changePercent: 0, sentiment: 0, optics: 0 },
    FINA: { symbol: 'FINA', price: 102, change: 0, changePercent: 0, sentiment: 0, optics: 0 }
  })

  // Initialize market engine
  useEffect(() => {
    const init = async () => {
      await marketEngine.initialize()
      setCurrentPrice(marketEngine.getCurrentPrice())
    }
    init()
  }, [])

  // Client-side market ticking (every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrice = marketEngine.updatePrice()
      setCurrentPrice(newPrice)
      
      // Update price history
      setPriceHistory(prev => [...prev.slice(-59), {
        time: new Date().toLocaleTimeString(),
        price: newPrice
      }])

      // Update stocks display
      setStocks(prev => ({
        ...prev,
        [selectedStock]: {
          ...prev[selectedStock],
          price: newPrice,
          change: newPrice - 100,
          changePercent: ((newPrice - 100) / 100) * 100
        }
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [selectedStock])

  // Subscribe to news updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'news'), orderBy('timestamp', 'desc'), limit(10)),
      (snapshot) => {
        const newsItems = snapshot.docs.map(doc => doc.data() as News)
        setNews(newsItems)
        
        // Apply latest news to market
        if (newsItems.length > 0) {
          marketEngine.injectNews(newsItems[0].sentiment)
        }
      }
    )

    return () => unsubscribe()
  }, [])

  const handleTrade = async (quantity: number, type: 'buy' | 'sell') => {
    if (!user) return

    setLoading(true)
    setTradingError(null)

    try {
      const stock = stocks[selectedStock]
      if (!stock) throw new Error('Stock not found')

      await submitTrade(
        user.id,
        selectedStock,
        quantity,
        stock.price,
        type,
        0,
        []
      )

      setTradingError(null)
    } catch (error) {
      setTradingError(error instanceof Error ? error.message : 'Trade failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-white mb-2">Initializing...</h1>
          <p className="text-gray-400">Connecting to market</p>
        </div>
      </div>
    )
  }

  const currentStock = stocks[selectedStock]

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-800 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Market Simulation</h1>
              <p className="text-gray-400 mt-1">
                Behavioral Finance Trading Platform
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-500">${user.totalValue.toFixed(2)}</p>
              <p className="text-gray-400 text-sm">Total Portfolio Value</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Prices & Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Price Tickers */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4">Market Prices (Live)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.values(stocks).map((stock: Stock) => (
                  <div
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock.symbol)}
                    className={`p-4 rounded-lg cursor-pointer transition ${
                      selectedStock === stock.symbol
                        ? 'bg-blue-900/50 border border-blue-500'
                        : 'bg-gray-900 border border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-bold">{stock.symbol}</h3>
                      <span className={stock.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white">${stock.price.toFixed(2)}</p>
                  </div>
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
                {news.length > 0 ? (
                  news.slice(0, 5).map((n: News) => (
                    <NewsCard key={n.id} news={n} />
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
                Object.entries(stocks).map(([k, v]: [string, Stock]) => [k, v.price])
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
