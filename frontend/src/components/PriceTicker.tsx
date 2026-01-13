import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Stock } from '@/lib/store'

interface PriceTickerProps {
  stock: Stock
  onClick?: () => void
}

export const PriceTicker: React.FC<PriceTickerProps> = ({ stock, onClick }) => {
  const isPositive = stock.change >= 0

  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:border-gray-700 transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xl font-bold text-white">{stock.symbol}</h3>
          <p className="text-gray-400 text-sm">Market price</p>
        </div>
        {isPositive ? (
          <TrendingUp className="text-green-500" size={20} />
        ) : (
          <TrendingDown className="text-red-500" size={20} />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-white">${stock.price.toFixed(2)}</p>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-semibold ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
          </span>
        </div>

        {/* Sentiment indicator */}
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-gray-500">Sentiment:</span>
          <div className="flex-1 bg-gray-800 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                stock.sentiment > 0
                  ? 'bg-green-500'
                  : stock.sentiment < 0
                  ? 'bg-red-500'
                  : 'bg-gray-600'
              }`}
              style={{ width: `${Math.abs(stock.sentiment) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PriceTicker
