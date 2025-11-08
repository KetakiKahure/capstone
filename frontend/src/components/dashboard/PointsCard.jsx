import React from 'react'
import { Star } from 'lucide-react'
import { useGamificationStore } from '../../store/gamificationStore'
import Card from '../ui/Card'

const PointsCard = () => {
  // Subscribe to gamification values - Zustand will automatically re-render when these change
  const points = useGamificationStore((state) => state.points)
  const level = useGamificationStore((state) => state.level)
  const totalPoints = useGamificationStore((state) => state.totalPoints)
  const pointsNeeded = level * 1000
  const progress = (totalPoints % 1000) / 10

  return (
    <Card variant="gradient" className="p-6 border-primary-200 dark:border-primary-800/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="p-2 rounded-xl"
          style={{ backgroundColor: 'var(--color-primary-100)' }}
        >
          <Star 
            className="w-6 h-6" 
            style={{ color: 'var(--color-primary-600)' }}
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-50">
            Level {level}
          </h3>
          <p className="text-sm text-calm-600 dark:text-calm-400 font-medium">
            {points} points
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-calm-600 dark:text-calm-400 font-medium">
            Progress to Level {level + 1}
          </span>
          <span className="text-calm-600 dark:text-calm-400 font-bold">
            {progress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-calm-200 dark:bg-calm-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-500 shadow-lg"
            style={{ 
              width: `${progress}%`,
              background: `linear-gradient(to right, var(--color-primary-600), var(--color-primary-400))`,
            }}
          />
        </div>
      </div>
    </Card>
  )
}

export default PointsCard

