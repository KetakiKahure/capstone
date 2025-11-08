import React from 'react'
import PomodoroWidget from '../components/dashboard/PomodoroWidget'
import MoodQuickLog from '../components/dashboard/MoodQuickLog'
import StreakCard from '../components/dashboard/StreakCard'
import PointsCard from '../components/dashboard/PointsCard'
import TodayTasks from '../components/dashboard/TodayTasks'
import QuickStats from '../components/dashboard/QuickStats'
import Greeting from '../components/dashboard/Greeting'
import BadgesGallery from '../components/gamification/BadgesGallery'

const Dashboard = () => {
  return (
    <div className="max-w-7xl mx-auto animate-fade-in px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Personalized Greeting */}
      <Greeting />

      {/* Quick Stats Overview */}
      <div className="mb-6 sm:mb-8">
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Tasks Section - Takes 2 columns on large screens */}
        <div className="lg:col-span-2 min-w-0">
          <TodayTasks />
        </div>
        
        {/* Pomodoro Timer - Takes 1 column on large screens */}
        <div className="min-w-0">
          <PomodoroWidget />
        </div>
      </div>

      {/* Secondary Stats and Mood */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="min-w-0">
          <StreakCard />
        </div>
        <div className="min-w-0">
          <PointsCard />
        </div>
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <MoodQuickLog />
        </div>
      </div>

      {/* Badges Gallery */}
      <div className="mb-4 sm:mb-6 min-w-0">
        <BadgesGallery />
      </div>
    </div>
  )
}

export default Dashboard

