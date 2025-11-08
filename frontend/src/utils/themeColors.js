// Mood-based color theme definitions - Soothing, soft colors
export const moodThemes = {
  happy: {
    name: 'Happy',
    primary: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    accent: '#fbbf24',
    // Soothing warm peach/cream gradient
    gradient: {
      from: '#fef7ed', // Soft peach cream
      via: '#fef3e2', // Light warm cream
      to: '#fff1e6', // Gentle peach
    },
    textColor: '#92400e', // Darker warm brown - darker than background
    glow: 'rgba(234, 179, 8, 0.2)',
  },
  calm: {
    name: 'Calm',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    accent: '#60a5fa',
    // Soothing soft blue gradient (like in the image)
    gradient: {
      from: '#e6f2ff', // Very light soft blue
      via: '#d6ebff', // Light sky blue
      to: '#cce5ff', // Soft periwinkle blue
    },
    textColor: '#1e40af', // Darker blue - darker than background
    glow: 'rgba(59, 130, 246, 0.2)',
  },
  neutral: {
    name: 'Neutral',
    primary: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    accent: '#6b7280',
    // Soft neutral gray-blue gradient
    gradient: {
      from: '#f8fafc', // Almost white with blue tint
      via: '#f1f5f9', // Very light blue-gray
      to: '#e2e8f0', // Soft gray-blue
    },
    textColor: '#1f2937', // Dark gray - darker than background
    glow: 'rgba(107, 114, 128, 0.2)',
  },
  tired: {
    name: 'Tired',
    primary: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    accent: '#f59e0b',
    // Soothing warm beige/cream gradient
    gradient: {
      from: '#fff8f0', // Warm off-white
      via: '#fff4e6', // Soft beige
      to: '#ffeed9', // Gentle warm cream
    },
    textColor: '#78350f', // Darker warm brown - darker than background
    glow: 'rgba(245, 158, 11, 0.2)',
  },
  anxious: {
    name: 'Anxious',
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    accent: '#f87171',
    // Soothing soft rose/pink gradient (calming, not alarming)
    gradient: {
      from: '#fef7f7', // Very light pink
      via: '#fef2f2', // Soft rose
      to: '#fdeaea', // Gentle pink
    },
    textColor: '#991b1b', // Darker rose - darker than background
    glow: 'rgba(239, 68, 68, 0.2)',
  },
  sad: {
    name: 'Sad',
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    },
    accent: '#c084fc',
    // Soothing soft lavender/periwinkle gradient
    gradient: {
      from: '#f5f0ff', // Very light lavender
      via: '#ede9fe', // Soft periwinkle
      to: '#e9d5ff', // Gentle lavender
    },
    textColor: '#6b21a8', // Darker lavender/purple - darker than background
    glow: 'rgba(168, 85, 247, 0.2)',
  },
}

// Get theme for a mood (defaults to neutral if mood not found)
export const getMoodTheme = (mood) => {
  return moodThemes[mood] || moodThemes.neutral
}

// Apply theme colors to CSS variables - changes background and text color
export const applyMoodTheme = (mood) => {
  if (typeof window === 'undefined' || !document.body) return
  
  const theme = getMoodTheme(mood)
  const root = document.documentElement
  const body = document.body
  const isDark = body.classList.contains('dark')
  
  // Update CSS variables for gradient
  root.style.setProperty('--gradient-from', theme.gradient.from)
  root.style.setProperty('--gradient-via', theme.gradient.via)
  root.style.setProperty('--gradient-to', theme.gradient.to)
  
  // Update CSS variable for text color
  root.style.setProperty('--mood-text-color', theme.textColor)
  
  // Apply directly to body as inline style for more reliable updates
  const gradientString = `linear-gradient(180deg, ${theme.gradient.from} 0%, ${theme.gradient.via} 50%, ${theme.gradient.to} 100%)`
  
  if (isDark) {
    // For dark mode, layer dark overlay on top of mood gradient
    const darkOverlay = `linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.65) 50%, rgba(51, 65, 85, 0.55) 100%)`
    body.style.backgroundImage = `${darkOverlay}, ${gradientString}`
    // In dark mode, use lighter text color for contrast
    body.style.color = '#f1f5f9' // Light gray for dark mode
    // Remove mood text color in dark mode
    root.style.setProperty('--mood-text-color', '#f1f5f9')
  } else {
    body.style.backgroundImage = gradientString
    // In light mode, use mood-based text color (darker than background)
    body.style.color = theme.textColor
    // Force update CSS variable - this will be used by CSS selectors
    root.style.setProperty('--mood-text-color', theme.textColor)
    
    // Force a repaint to ensure CSS updates are applied
    void root.offsetHeight
  }
  
  body.style.background = gradientString
  body.style.backgroundAttachment = 'fixed'
  body.style.backgroundRepeat = 'no-repeat'
  body.style.backgroundSize = 'cover'
  body.style.transition = 'background 1s ease-in-out, background-image 1s ease-in-out, color 1s ease-in-out'
  
  // Add mood class to body for reference
  body.className = body.className.replace(/mood-\w+/g, '')
  body.classList.add(`mood-${mood}`)
  
  console.log('🎨 Theme applied:', mood, 'Dark:', isDark, 'Text:', isDark ? '#f1f5f9' : theme.textColor, 'CSS Var:', getComputedStyle(root).getPropertyValue('--mood-text-color'))
}

// Get current mood from mood logs (most recent)
export const getCurrentMood = (moodLogs) => {
  if (!moodLogs || moodLogs.length === 0) {
    return 'neutral'
  }
  
  // Get the most recent mood log
  const mostRecent = moodLogs[0]
  return mostRecent.mood || 'neutral'
}

