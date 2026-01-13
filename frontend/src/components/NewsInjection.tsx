import React, { useState } from 'react'
import { Send } from 'lucide-react'

interface NewsInjectionProps {
  onSubmit: (news: {
    headline: string
    description: string
    sentiment: number
    optics: number
    source: string
    target: string
  }) => void
  isLoading?: boolean
}

export const NewsInjection: React.FC<NewsInjectionProps> = ({ onSubmit, isLoading = false }) => {
  const [headline, setHeadline] = useState('')
  const [description, setDescription] = useState('')
  const [sentiment, setSentiment] = useState('0')
  const [optics, setOptics] = useState('0.5')
  const [source, setSource] = useState('breaking')
  const [target, setTarget] = useState('market')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (headline && description) {
      onSubmit({
        headline,
        description,
        sentiment: parseFloat(sentiment),
        optics: parseFloat(optics),
        source,
        target
      })
      setHeadline('')
      setDescription('')
      setSentiment('0')
      setOptics('0.5')
      setSource('breaking')
      setTarget('market')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border-2 border-purple-600 rounded-lg p-4 space-y-4"
    >
      <h3 className="text-lg font-bold text-purple-500">Inject News Event</h3>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Headline</label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Market-moving headline..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-400">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed news context..."
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 h-20 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Sentiment
            <span className="text-purple-400 font-semibold"> ({sentiment})</span>
          </label>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Optics (Prominence)
            <span className="text-purple-400 font-semibold"> ({parseFloat(optics).toFixed(1)})</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={optics}
            onChange={(e) => setOptics(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Source Type</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
          >
            <option value="breaking">Breaking News</option>
            <option value="analysis">Analysis</option>
            <option value="rumor">Rumor</option>
            <option value="earnings">Earnings Report</option>
            <option value="economic">Economic Data</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Target</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-gray-600"
          >
            <option value="market">Entire Market</option>
            <option value="TECH">Tech Sector</option>
            <option value="ENERGY">Energy Sector</option>
            <option value="FINANCE">Finance Sector</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!headline || !description || isLoading}
        className="w-full bg-purple-600 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Send size={16} />
        {isLoading ? 'Injecting...' : 'Inject News'}
      </button>
    </form>
  )
}

export default NewsInjection
