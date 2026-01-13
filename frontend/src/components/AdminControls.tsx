import React, { useState } from 'react'
import { Play, Pause, RotateCcw, Zap } from 'lucide-react'

interface AdminControlsProps {
  isController: boolean
  sessionStatus: string
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onClaimController: () => void
  isLoading?: boolean
}

export const AdminControls: React.FC<AdminControlsProps> = ({
  isController,
  sessionStatus,
  onStart,
  onPause,
  onReset,
  onClaimController,
  isLoading = false
}) => {
  const [showConfirm, setShowConfirm] = useState<string | null>(null)

  const handleAction = (action: () => void, confirmKey: string) => {
    if (showConfirm === confirmKey) {
      action()
      setShowConfirm(null)
    } else {
      setShowConfirm(confirmKey)
    }
  }

  return (
    <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
          <Zap size={20} />
          Admin Market Control
        </h3>
        <div className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-600/20 text-yellow-500">
          {isController ? 'CONTROLLING' : 'STANDBY'}
        </div>
      </div>

      {!isController && (
        <button
          onClick={onClaimController}
          disabled={isLoading}
          className="w-full bg-yellow-600 text-white py-2 rounded font-semibold hover:bg-yellow-700 disabled:opacity-50 transition-all"
        >
          {isLoading ? 'Claiming...' : 'Claim Market Control'}
        </button>
      )}

      {isController && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAction(onStart, 'start')}
              className={`py-2 rounded font-semibold flex items-center justify-center gap-2 transition-all ${
                showConfirm === 'start'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              disabled={isLoading || sessionStatus === 'active'}
            >
              <Play size={16} />
              Start Session
            </button>

            <button
              onClick={() => handleAction(onPause, 'pause')}
              className={`py-2 rounded font-semibold flex items-center justify-center gap-2 transition-all ${
                showConfirm === 'pause'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              disabled={isLoading || sessionStatus !== 'active'}
            >
              <Pause size={16} />
              Pause Session
            </button>
          </div>

          <button
            onClick={() => handleAction(onReset, 'reset')}
            className={`w-full py-2 rounded font-semibold flex items-center justify-center gap-2 transition-all ${
              showConfirm === 'reset'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            disabled={isLoading}
          >
            <RotateCcw size={16} />
            {showConfirm === 'reset' ? 'Confirm Reset?' : 'Reset Market'}
          </button>
        </div>
      )}

      {showConfirm && (
        <button
          onClick={() => setShowConfirm(null)}
          className="w-full text-sm text-gray-400 hover:text-gray-300 py-1"
        >
          Cancel
        </button>
      )}

      <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
        <p>Current session status: <span className="text-gray-300 font-semibold">{sessionStatus}</span></p>
      </div>
    </div>
  )
}

export default AdminControls
