import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useAnalyticsStore } from '../hooks/useAnalytics'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'

const Analytics = () => {
  const { 
    focusData, 
    moodData, 
    moodInsights, 
    moodDailyData,
    taskData, 
    loading, 
    timeRange,
    setTimeRange,
    fetchData 
  } = useAnalyticsStore()
  
  const [viewMode, setViewMode] = useState('bar') // 'bar' or 'scatter'
  
  const timeRangeOptions = [
    { label: '7 Days', value: 7 },
    { label: '14 Days', value: 14 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ]
  
  const moodColors = {
    'Happy': '#10b981',
    'Calm': '#3b82f6',
    'Neutral': '#6b7280',
    'Tired': '#f59e0b',
    'Anxious': '#ef4444',
    'Sad': '#8b5cf6',
  }

  useEffect(() => {
    // Data is automatically fetched when timeRange changes (handled in hook)
    console.log('📊 Analytics page mounted')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Component mounted

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Skeleton width="200px" height="32px" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width="100%" height="400px" />
          ))}
        </div>
      </div>
    )
  }

  // Check if we have any real data
  const hasRealData = focusData.some(d => d.minutes > 0) || 
                     taskData.some(d => d.created > 0 || d.completed > 0) ||
                     moodData.some(d => d.focusMinutes > 0 && d.mood !== 'No mood data yet' && d.mood !== 'No data available')

  return (
    <div className="max-w-7xl mx-auto animate-fade-in px-2 sm:px-4">
      <div className="mb-6 sm:mb-8 relative overflow-hidden">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-indigo-200/20 dark:bg-indigo-800/20 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2 sm:mb-3">
                Analytics
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-calm-600 dark:text-calm-400 font-medium">
                Track your productivity and focus patterns
              </p>
            </div>
            <button
              onClick={() => {
                console.log('🔄 Manual refresh triggered')
                fetchData()
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors self-start sm:self-auto"
              aria-label="Refresh analytics"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {!hasRealData && !loading && (
        <Card className="p-8 mb-6 text-center">
          <p className="text-lg text-calm-600 dark:text-calm-400 mb-4">
            📊 No data yet! Start using FocusWave to see your analytics.
          </p>
          <p className="text-sm text-calm-500 dark:text-calm-500">
            Complete Pomodoro sessions, create tasks, and log your mood to see insights here.
          </p>
        </Card>
      )}

              {/* Summary Stats */}
              {hasRealData && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 sm:mb-6">
                  <Card variant="gradient" className="p-4 sm:p-6 min-w-0">
                    <div className="text-sm text-calm-600 dark:text-calm-400 mb-2">Total Focus Time</div>
                    <div className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {focusData.reduce((sum, d) => sum + (d.minutes || 0), 0)} min
                    </div>
                    <div className="text-xs text-calm-500 dark:text-calm-500 mt-1">Last {timeRange} days</div>
                  </Card>
                  <Card variant="gradient" className="p-4 sm:p-6 min-w-0">
                    <div className="text-sm text-calm-600 dark:text-calm-400 mb-2">Tasks Completed</div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                      {taskData.reduce((sum, d) => sum + (d.completed || 0), 0)}
                    </div>
                    <div className="text-xs text-calm-500 dark:text-calm-500 mt-1">Last {timeRange} days</div>
                  </Card>
                  <Card variant="gradient" className="p-4 sm:p-6 min-w-0">
                    <div className="text-sm text-calm-600 dark:text-calm-400 mb-2">Mood Logs</div>
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {moodData.filter(m => m.mood !== 'No mood data yet' && m.mood !== 'No data available').length}
                    </div>
                    <div className="text-xs text-calm-500 dark:text-calm-500 mt-1">Unique moods</div>
                  </Card>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* Focus minutes per day */}
                <Card variant="gradient" className="p-4 sm:p-6 lg:p-8 relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/10 dark:bg-primary-600/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-calm-900 dark:text-calm-50">
                        Focus Minutes per Day
                      </h3>
                      <span className="text-xs text-calm-500 dark:text-calm-400">
                        Last {timeRange} days (including today)
                      </span>
                    </div>
          {focusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={focusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => [`${value} min`, 'Focus Time']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const isToday = payload[0].payload?.isToday
                      return isToday ? `${label} (Today)` : label
                    }
                    // Fallback: check focusData
                    const dataPoint = focusData.find(d => d.date === label)
                    return dataPoint?.isToday ? `${label} (Today)` : label
                  }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="#0ea5e9"
                  radius={[8, 8, 0, 0]}
                  shape={(props) => {
                    const { payload } = props
                    const isToday = payload?.isToday
                    return (
                      <rect
                        {...props}
                        fill={isToday ? '#0284c7' : '#0ea5e9'}
                        opacity={isToday ? 1 : 0.9}
                        stroke={isToday ? '#0369a1' : 'none'}
                        strokeWidth={isToday ? 2 : 0}
                      />
                    )
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-calm-500">
              No focus data available
            </div>
          )}
          </div>
        </Card>

        {/* Task throughput */}
                <Card variant="gradient" className="p-4 sm:p-6 lg:p-8 relative overflow-hidden min-w-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-calm-900 dark:text-calm-50">
                        Task Throughput
                      </h3>
                      <span className="text-xs text-calm-500 dark:text-calm-400">
                        Last {timeRange} days (including today)
                      </span>
                    </div>
          {taskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      const isToday = payload[0].payload?.isToday
                      return isToday ? `${label} (Today)` : label
                    }
                    return label
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="created"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Created"
                  dot={(props) => {
                    const isToday = props.payload?.isToday
                    return (
                      <circle
                        {...props}
                        r={isToday ? 6 : 4}
                        fill={isToday ? '#7c3aed' : '#8b5cf6'}
                        stroke={isToday ? '#6d28d9' : 'none'}
                        strokeWidth={isToday ? 2 : 0}
                      />
                    )
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Completed"
                  dot={(props) => {
                    const isToday = props.payload?.isToday
                    return (
                      <circle
                        {...props}
                        r={isToday ? 6 : 4}
                        fill={isToday ? '#059669' : '#10b981'}
                        stroke={isToday ? '#047857' : 'none'}
                        strokeWidth={isToday ? 2 : 0}
                      />
                    )
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-calm-500">
              No task data available
            </div>
          )}
          </div>
        </Card>
      </div>

              {/* Mood vs Focus correlation - Enhanced */}
              <Card variant="gradient" className="p-4 sm:p-6 lg:p-8 relative overflow-hidden min-w-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
                    <h3 className="text-lg sm:text-xl font-bold text-calm-900 dark:text-calm-50">
                      Mood vs Focus Correlation
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Time Range Selector */}
                      <div className="flex items-center gap-2 bg-calm-100 dark:bg-calm-800 rounded-lg p-1">
                        {timeRangeOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => setTimeRange(option.value)}
                            className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                              timeRange === option.value
                                ? 'bg-primary-600 text-white'
                                : 'text-calm-600 dark:text-calm-400 hover:bg-calm-200 dark:hover:bg-calm-700'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      {/* View Mode Toggle */}
                      {moodData.length > 0 && moodData[0].mood !== 'No mood data yet' && moodData[0].mood !== 'No data available' && moodDailyData.length > 0 && (
                        <div className="flex items-center gap-2 bg-calm-100 dark:bg-calm-800 rounded-lg p-1">
                          <button
                            onClick={() => setViewMode('bar')}
                            className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                              viewMode === 'bar'
                                ? 'bg-primary-600 text-white'
                                : 'text-calm-600 dark:text-calm-400 hover:bg-calm-200 dark:hover:bg-calm-700'
                            }`}
                          >
                            Bar
                          </button>
                          <button
                            onClick={() => setViewMode('scatter')}
                            className={`px-3 py-1 text-xs sm:text-sm rounded-md transition-colors ${
                              viewMode === 'scatter'
                                ? 'bg-primary-600 text-white'
                                : 'text-calm-600 dark:text-calm-400 hover:bg-calm-200 dark:hover:bg-calm-700'
                            }`}
                          >
                            Scatter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Correlation Insights */}
                  {moodInsights && moodInsights.bestMoodForFocus && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <div className="text-xs text-green-600 dark:text-green-400 mb-1">Best for Focus</div>
                        <div className="text-sm font-semibold text-green-900 dark:text-green-100">
                          {moodInsights.bestMoodForFocus.mood}
                        </div>
                        <div className="text-xs text-green-700 dark:text-green-300">
                          {moodInsights.bestMoodForFocus.avgFocusMinutes.toFixed(1)} min avg
                        </div>
                      </Card>
                      <Card className="p-3 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">Overall Average</div>
                        <div className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                          {moodInsights.averageFocusOverall.toFixed(1)} min
                        </div>
                        <div className="text-xs text-amber-700 dark:text-amber-300">
                          {moodInsights.totalDataPoints} moods tracked
                        </div>
                      </Card>
                      {moodInsights.worstMoodForFocus && (
                        <Card className="p-3 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                          <div className="text-xs text-red-600 dark:text-red-400 mb-1">Lowest Focus</div>
                          <div className="text-sm font-semibold text-red-900 dark:text-red-100">
                            {moodInsights.worstMoodForFocus.mood}
                          </div>
                          <div className="text-xs text-red-700 dark:text-red-300">
                            {moodInsights.worstMoodForFocus.avgFocusMinutes.toFixed(1)} min avg
                          </div>
                        </Card>
                      )}
                    </div>
                  )}

                  {/* Visualization */}
                  {moodData.length > 0 && moodData[0].mood !== 'No mood data yet' && moodData[0].mood !== 'No data available' ? (
                    <div>
                      {viewMode === 'bar' ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={moodData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                              dataKey="mood"
                              stroke="#64748b"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} label={{ value: 'Focus Minutes', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                              }}
                              formatter={(value, name, props) => {
                                const data = props.payload
                                const parts = [`Avg: ${data.avgFocusMinutes?.toFixed(1) || value.toFixed(1)} min`]
                                if (data.maxFocusMinutes) parts.push(`Max: ${data.maxFocusMinutes} min`)
                                if (data.minFocusMinutes) parts.push(`Min: ${data.minFocusMinutes} min`)
                                if (data.focusSessions) parts.push(`Sessions: ${data.focusSessions}`)
                                if (data.moodDays) parts.push(`Days: ${data.moodDays}`)
                                return [parts.join('\n'), 'Focus Time']
                              }}
                              labelFormatter={(label) => `Mood: ${label}`}
                            />
                            <Legend />
                            <Bar dataKey="avgFocusMinutes" name="Avg Focus (min)" radius={[8, 8, 0, 0]}>
                              {moodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={moodColors[entry.mood] || '#0ea5e9'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <ResponsiveContainer width="100%" height={400}>
                          <ScatterChart data={moodDailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              type="category" 
                              dataKey="mood" 
                              name="Mood"
                              stroke="#64748b"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              type="number" 
                              dataKey="focusMinutes" 
                              name="Focus Minutes"
                              stroke="#64748b"
                              style={{ fontSize: '12px' }}
                              label={{ value: 'Focus Minutes', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip
                              cursor={{ strokeDasharray: '3 3' }}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                              }}
                              formatter={(value, name, props) => {
                                const data = props.payload
                                const parts = [`Date: ${data.date}`, `Mood: ${data.mood}`, `Focus: ${value} min`]
                                if (data.sessionCount) parts.push(`Sessions: ${data.sessionCount}`)
                                return [parts.join('\n'), 'Focus Time']
                              }}
                            />
                            <Legend />
                            <Scatter name="Mood vs Focus" data={moodDailyData} fill="#0ea5e9">
                              {moodDailyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={moodColors[entry.mood] || '#0ea5e9'} />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                      )}
                      
                      {/* Detailed Stats */}
                      {moodData.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-calm-200 dark:border-calm-700">
                          <div className="text-sm font-semibold text-calm-700 dark:text-calm-300 mb-2">
                            Detailed Statistics ({timeRange} days)
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                            {moodData.map(mood => (
                              <div key={mood.mood} className="p-2 bg-calm-50 dark:bg-calm-800 rounded">
                                <div className="font-medium text-calm-900 dark:text-calm-100">{mood.mood}</div>
                                <div className="text-calm-600 dark:text-calm-400">
                                  Avg: {mood.avgFocusMinutes?.toFixed(1) || mood.focusMinutes?.toFixed(1) || 0} min
                                </div>
                                {mood.maxFocusMinutes && mood.minFocusMinutes && (
                                  <div className="text-calm-500 dark:text-calm-500 text-[10px]">
                                    Range: {mood.minFocusMinutes}-{mood.maxFocusMinutes} min
                                  </div>
                                )}
                                {mood.moodDays && (
                                  <div className="text-calm-500 dark:text-calm-500 text-[10px]">
                                    {mood.moodDays} day{mood.moodDays !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-[400px] flex items-center justify-center text-calm-500">
                      No mood data available yet. Log your mood to see correlations!
                    </div>
                  )}
                </div>
              </Card>
    </div>
  )
}

export default Analytics

