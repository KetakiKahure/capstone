import { useEffect } from 'react'
import { useMoodStore } from '../store/moodStore'
import { applyMoodTheme } from '../utils/themeColors'

const ThemeProvider = ({ children }) => {
  // Subscribe to mood store values - Zustand will automatically re-render when these change
  const currentMood = useMoodStore((state) => state.currentMood)
  const moodLogs = useMoodStore((state) => state.moodLogs)
  const fetchMoodLogs = useMoodStore((state) => state.fetchMoodLogs)

  // Apply default theme on initial mount (before fetching mood logs)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Start with default neutral theme immediately
    setTimeout(() => {
      applyMoodTheme('neutral')
    }, 0)
  }, [])

  useEffect(() => {
    // Fetch mood logs on mount if not already loaded
    if (!moodLogs || moodLogs.length === 0) {
      fetchMoodLogs()
    }
  }, [fetchMoodLogs, moodLogs])

  useEffect(() => {
    // Apply theme when current mood changes or mood logs change
    if (typeof window === 'undefined') return
    
    // Determine the mood: currentMood > most recent log > neutral (default)
    let mood = 'neutral' // Default theme
    
    if (currentMood) {
      mood = currentMood
    } else if (moodLogs && moodLogs.length > 0 && moodLogs[0].mood) {
      mood = moodLogs[0].mood
    }
    
    console.log('🔄 ThemeProvider: Applying mood', mood, 'currentMood:', currentMood, 'moodLogs:', moodLogs?.length)
    
    // Apply theme immediately - this only changes the background
    applyMoodTheme(mood)
  }, [currentMood, moodLogs])

  return <>{children}</>
}

export default ThemeProvider
