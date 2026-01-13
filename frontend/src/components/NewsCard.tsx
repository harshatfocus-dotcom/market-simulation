import React from 'react'
import { AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { News } from '@/lib/store'

interface NewsCardProps {
  news: News
  onClick?: () => void
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  const sentimentColor =
    news.sentiment > 0
      ? 'text-green-500 bg-green-500/10'
      : news.sentiment < 0
      ? 'text-red-500 bg-red-500/10'
      : 'text-gray-500 bg-gray-500/10'

  const opticsBorder =
    news.optics > 0.7
      ? 'border-2 border-yellow-500'
      : 'border border-gray-700'

  const sourceIcon =
    news.source === 'breaking' ? (
      <AlertCircle size={16} className="text-red-500" />
    ) : news.source === 'analysis' ? (
      <Info size={16} className="text-blue-500" />
    ) : (
      <AlertTriangle size={16} className="text-orange-500" />
    )

  return (
    <div
      onClick={onClick}
      className={`bg-gray-900 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-all ${opticsBorder}`}
    >
      <div className="flex gap-3 mb-2">
        <div className="flex-shrink-0">{sourceIcon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{news.headline}</h4>
          <p className="text-gray-400 text-sm mb-2">{news.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${sentimentColor}`}>
              {news.sentiment > 0 ? 'Bullish' : news.sentiment < 0 ? 'Bearish' : 'Neutral'}
            </span>

            <span className="text-xs text-gray-500">
              Target: <span className="text-gray-300">{news.target}</span>
            </span>

            {/* Decay indicator */}
            <div className="text-xs text-gray-500 ml-auto">
              Decay: <span className={news.decay < 0.3 ? 'text-gray-400' : 'text-yellow-500'}>
                {(news.decay * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewsCard
