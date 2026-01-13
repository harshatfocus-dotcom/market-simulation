import React from 'react'
import { User } from '@/lib/store'

interface PortfolioProps {
  user: User | null
  prices: Record<string, number>
}

export const Portfolio: React.FC<PortfolioProps> = ({ user, prices }) => {
  if (!user) return null

  const positions = Object.entries(user.portfolio).map(([symbol, quantity]) => {
    const currentPrice = prices[symbol] || 0
    const value = quantity * currentPrice

    return { symbol, quantity, currentPrice, value }
  })

  const stockValue = positions.reduce((sum, p) => sum + p.value, 0)
  const totalValue = user.cash + stockValue

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-bold text-white">Portfolio</h3>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded p-3">
          <p className="text-gray-400 text-sm">Cash</p>
          <p className="text-2xl font-bold text-white">${user.cash.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <p className="text-gray-400 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-green-500">${totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Positions */}
      {positions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-400">Holdings</p>
          <div className="space-y-2">
            {positions.map((pos) => (
              <div key={pos.symbol} className="bg-gray-800 rounded p-2 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-white">{pos.symbol}</span>
                  <span className="text-green-500">${pos.value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>{pos.quantity} @ ${pos.currentPrice.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-4">No holdings yet</p>
      )}
    </div>
  )
}

export default Portfolio
