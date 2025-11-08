import React, { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Coffee, Briefcase, Sparkles } from 'lucide-react'
import { useTimerStore } from '../store/timerStore'
import { useGamificationStore } from '../store/gamificationStore'
import { formatTime } from '../utils/formatTime'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Textarea from '../components/ui/Textarea'

const PomodoroTimer = () => {
  // Subscribe to timer store values - Zustand will automatically re-render when these change
  const isRunning = useTimerStore((state) => state.isRunning)
  const isPaused = useTimerStore((state) => state.isPaused)
  const timeRemaining = useTimerStore((state) => state.timeRemaining)
  const currentSession = useTimerStore((state) => state.currentSession)
  const workDuration = useTimerStore((state) => state.workDuration)
  const breakDuration = useTimerStore((state) => state.breakDuration)
  const longBreakDuration = useTimerStore((state) => state.longBreakDuration)
  const sessionsCompleted = useTimerStore((state) => state.sessionsCompleted)
  const startTimer = useTimerStore((state) => state.startTimer)
  const pauseTimer = useTimerStore((state) => state.pauseTimer)
  const resumeTimer = useTimerStore((state) => state.resumeTimer)
  const resetTimer = useTimerStore((state) => state.resetTimer)
  const setSession = useTimerStore((state) => state.setSession)
  const fetchMLRecommendations = useTimerStore((state) => state.fetchMLRecommendations)

  const [notes, setNotes] = useState('')
  const [mlRecommendation, setMlRecommendation] = useState(null)
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false)

  // Fetch ML recommendations on component mount and when sessions complete
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!isRunning && currentSession === 'work') {
        setIsLoadingRecommendation(true)
        try {
          const recommendation = await fetchMLRecommendations('medium')
          if (recommendation) {
            setMlRecommendation(recommendation)
          }
        } catch (error) {
          console.error('Error loading ML recommendations:', error)
        } finally {
          setIsLoadingRecommendation(false)
        }
      }
    }

    loadRecommendations()
  }, [sessionsCompleted, isRunning, currentSession, fetchMLRecommendations])

  // Timer is handled by the store
  // Points are awarded automatically when work sessions complete

  const handleStart = () => {
    if (isPaused) {
      resumeTimer()
    } else {
      startTimer()
    }
  }

  const sessionConfig = {
    work: {
      label: 'Focus Time',
      icon: Briefcase,
      color: 'primary',
      duration: workDuration,
    },
    shortBreak: {
      label: 'Short Break',
      icon: Coffee,
      color: 'green',
      duration: breakDuration,
    },
    longBreak: {
      label: 'Long Break',
      icon: Coffee,
      color: 'purple',
      duration: longBreakDuration,
    },
  }

  const config = sessionConfig[currentSession]
  const Icon = config.icon

  const progress = config.duration > 0
    ? ((config.duration - timeRemaining) / config.duration) * 100
    : 0

  return (
    <div className="max-w-4xl mx-auto animate-fade-in px-2 sm:px-4">
      <div className="mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-primary-200/20 dark:bg-primary-800/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2 sm:mb-3">
            Pomodoro Timer
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-calm-600 dark:text-calm-400 font-medium">
            Focus for 25 minutes, then take a break
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card variant="gradient" className="lg:col-span-2 p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-indigo-500/5" />
          <div className="relative z-10">
            {/* Session selector */}
            <div className="flex justify-center gap-3 mb-8">
              {Object.keys(sessionConfig).map((session) => {
                const sessionIcon = sessionConfig[session].icon
                const SessionIcon = sessionIcon
                const isActive = currentSession === session
                return (
                  <button
                    key={session}
                    onClick={() => !isRunning && setSession(session)}
                    disabled={isRunning}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold transition-all duration-300
                      ${isActive
                        ? 'text-white shadow-glow transform scale-105'
                        : 'bg-white/60 dark:bg-calm-700/60 backdrop-blur-sm text-calm-600 dark:text-calm-400 border-2 border-transparent'
                      }
                      ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white dark:hover:bg-calm-600 hover:border-primary-300 dark:hover:border-primary-700 hover:scale-105'}
                      focus-ring
                    `}
                    style={isActive ? {
                      background: `linear-gradient(to right, var(--color-primary-500), var(--color-primary-400), var(--color-accent))`,
                      boxShadow: `0 0 20px var(--glow-color)`,
                    } : {}}
                  >
                    <SessionIcon className="w-4 h-4" />
                    {sessionConfig[session].label}
                  </button>
                )
              })}
            </div>

            {/* Timer display */}
            <div className="text-center">
              <div className="relative w-80 h-80 mx-auto mb-10">
                <svg className="transform -rotate-90 w-80 h-80 drop-shadow-lg">
                  <defs>
                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-primary-500)" />
                      <stop offset="50%" stopColor="var(--color-primary-400)" />
                      <stop offset="100%" stopColor="var(--color-accent)" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="currentColor"
                    strokeWidth="10"
                    fill="none"
                    className="text-calm-200/50 dark:text-calm-700/50"
                  />
                  <circle
                    cx="160"
                    cy="160"
                    r="140"
                    stroke="url(#timerGradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 140}`}
                    strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                    className="transition-all duration-1000 drop-shadow-glow"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div 
                    className="mb-4 p-4 rounded-2xl shadow-elegant"
                    style={{
                      background: `linear-gradient(to bottom right, var(--color-primary-100), var(--color-primary-200))`,
                    }}
                  >
                    <Icon 
                      className="w-10 h-10" 
                      style={{ color: 'var(--color-primary-600)' }}
                    />
                  </div>
                  <div 
                    className="text-7xl font-extrabold bg-clip-text text-transparent mb-3 gradient-text"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary-600), var(--color-primary-500), var(--color-accent))`,
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                    }}
                  >
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-base font-bold text-calm-600 dark:text-calm-400 uppercase tracking-wider">
                    {config.label}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning && !isPaused && (
                  <Button
                    onClick={handleStart}
                    variant="primary"
                    size="large"
                    className="min-w-[140px]"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </Button>
                )}

                {isRunning && (
                  <Button
                    onClick={pauseTimer}
                    variant="secondary"
                    size="large"
                    className="min-w-[140px]"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </Button>
                )}

                {isPaused && (
                  <>
                    <Button
                      onClick={handleStart}
                      variant="primary"
                      size="large"
                      className="min-w-[140px]"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                    <Button
                      onClick={resetTimer}
                      variant="outline"
                      size="large"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-6">
                <p className="text-sm text-calm-600 dark:text-calm-400">
                  Sessions completed today: <span className="font-semibold">{sessionsCompleted}</span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* ML Recommendation Card */}
          {mlRecommendation && (
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 border-2 border-primary-200 dark:border-primary-700">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-50">
                  AI Recommendation
                </h3>
              </div>
              <p className="text-sm text-calm-700 dark:text-calm-300 mb-2">
                {mlRecommendation.explanation || 'Personalized timer recommendation based on your daily patterns'}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-calm-600 dark:text-calm-400">
                <span>Focus: {mlRecommendation.focus_minutes} min</span>
                <span>Break: {mlRecommendation.break_minutes} min</span>
                {mlRecommendation.confidence > 0 && (
                  <span>Confidence: {Math.round(mlRecommendation.confidence * 100)}%</span>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-calm-900 dark:text-calm-50 mb-4">
              Session Notes
            </h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your focus session..."
              rows={8}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PomodoroTimer

