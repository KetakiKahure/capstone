import React from 'react'
import { useAuthStore } from '../../store/authStore'

const Greeting = () => {
  const { user } = useAuthStore()
  const hour = new Date().getHours()
  
  let greeting = 'Hello'
  let emoji = '👋'
  
  if (hour < 12) {
    greeting = 'Good Morning'
    emoji = '🌅'
  } else if (hour < 17) {
    greeting = 'Good Afternoon'
    emoji = '☀️'
  } else if (hour < 21) {
    greeting = 'Good Evening'
    emoji = '🌆'
  } else {
    greeting = 'Good Night'
    emoji = '🌙'
  }

  const userName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="mb-6 sm:mb-8">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl sm:text-4xl animate-bounce" style={{ animationDuration: '2s' }}>
          {emoji}
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-calm-900 dark:text-calm-50">
          {greeting}, {userName}!
        </h1>
      </div>
      <p className="text-base sm:text-lg text-calm-600 dark:text-calm-400 ml-11">
        {hour < 12 
          ? "Ready to make today productive?" 
          : hour < 17
          ? "Keep up the great work!"
          : hour < 21
          ? "How's your day going?"
          : "Time to wind down and reflect."
        }
      </p>
    </div>
  )
}

export default Greeting

