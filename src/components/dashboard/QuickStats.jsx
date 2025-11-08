import React from 'react'
import { CheckCircle2, Clock, TrendingUp, Target } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { useTimerStore } from '../../store/timerStore'
import { useGamificationStore } from '../../store/gamificationStore'
import { formatTime, isToday } from '../../utils/formatTime'
import Card from '../ui/Card'

const QuickStats = () => {
  // Subscribe to specific store values - Zustand will automatically re-render when these change
  const tasks = useTaskStore((state) => state.tasks)
  const totalFocusTime = useTimerStore((state) => state.totalFocusTime)
  const sessionsCompleted = useTimerStore((state) => state.sessionsCompleted)
  const streak = useGamificationStore((state) => state.streak)

  // Calculate today's stats
  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    return isToday(task.dueDate) || task.status === 'pending'
  })
  
  const completedTasks = todayTasks.filter(task => task.status === 'completed').length
  const totalTasks = todayTasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Format focus time
  const focusHours = Math.floor(totalFocusTime / 3600)
  const focusMinutes = Math.floor((totalFocusTime % 3600) / 60)
  const focusTimeDisplay = focusHours > 0 
    ? `${focusHours}h ${focusMinutes}m` 
    : `${focusMinutes}m`

  const stats = [
    {
      icon: CheckCircle2,
      label: 'Tasks Completed',
      value: `${completedTasks}/${totalTasks}`,
      subtext: `${completionRate}% done`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Clock,
      label: 'Focus Time',
      value: focusTimeDisplay,
      subtext: `${sessionsCompleted} sessions`,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: TrendingUp,
      label: 'Productivity',
      value: completionRate > 0 ? `${completionRate}%` : '0%',
      subtext: streak > 0 ? `${streak} day streak` : 'Start a streak!',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      icon: Target,
      label: 'Focus Sessions',
      value: sessionsCompleted.toString(),
      subtext: 'Pomodoro completed',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card 
            key={index}
            className="p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-calm-900 dark:text-calm-50">
                {stat.value}
              </p>
              <p className="text-xs font-medium text-calm-600 dark:text-calm-400 uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-xs text-calm-500 dark:text-calm-500 mt-1">
                {stat.subtext}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default QuickStats

