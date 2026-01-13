import React, { useState } from 'react'
import { Send } from 'lucide-react'

interface TradeFormProps {
  symbol: string
  currentPrice: number
  cash: number
  onSubmit: (quantity: number, type: 'buy' | 'sell') => void
  isLoading?: boolean
}

export const TradeForm: React.FC<TradeFormProps> = ({
  symbol,
  currentPrice,
  cash,
  onSubmit,
  isLoading = false
}) => {
  const [quantity, setQuantity] = useState('')
  const [type, setType] = useState<'buy' | 'sell'>('buy')

  const total = parseFloat(quantity || '0') * currentPrice
  const canAfford = total <= cash

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (quantity && canAfford) {
      onSubmit(parseFloat(quantity), type)
      setQuantity('')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4"
    >
      <h3 className="text-lg font-bold text-white">Trade {symbol}</h3>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Order Type</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType('buy')}
            className={`flex-1 py-2 rounded font-semibold transition-all ${
              type === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setType('sell')}
            className={`flex-1 py-2 rounded font-semibold transition-all ${
              type === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Sell
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0"
          min="0"
          step="1"
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
        />
      </div>

      <div className="bg-gray-800 rounded p-3 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Price per unit</span>
          <span className="text-white font-semibold">${currentPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total cost</span>
          <span className={`font-semibold ${canAfford ? 'text-white' : 'text-red-500'}`}>
            ${total.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t border-gray-700 pt-2 mt-2">
          <span className="text-gray-400">Cash available</span>
          <span className="text-white font-semibold">${cash.toFixed(2)}</span>
        </div>
      </div>

      {!canAfford && (
        <p className="text-xs text-red-500">Insufficient funds for this trade</p>
      )}

      <button
        type="submit"
        disabled={!quantity || !canAfford || isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Send size={16} />
        {isLoading ? 'Processing...' : 'Execute Trade'}
      </button>
    </form>
  )
}

export default TradeForm
