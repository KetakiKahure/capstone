import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, Plus, CheckSquare } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { formatDate, isToday } from '../../utils/formatTime'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Skeleton from '../ui/Skeleton'

const TodayTasks = () => {
  // Subscribe to tasks directly - Zustand will automatically re-render when tasks change
  const tasks = useTaskStore((state) => state.tasks)
  const loading = useTaskStore((state) => state.loading)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus)

  // Only fetch on initial mount if tasks are empty
  useEffect(() => {
    if (tasks.length === 0 && !loading) {
      fetchTasks()
    }
  }, []) // Empty dependency array - only run on mount

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return false
    return isToday(task.dueDate) || task.status === 'pending'
  }).slice(0, 5)

  const completedTasks = todayTasks.filter(task => task.status === 'completed').length
  const totalTasks = todayTasks.length

  const handleToggle = async (id) => {
    await toggleTaskStatus(id)
  }

  if (loading && tasks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton width="150px" height="24px" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width="100%" height="48px" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 sm:p-8 relative overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl -ml-20 -mt-20" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl shadow-sm">
              <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-calm-900 dark:text-calm-50">
                Today's Tasks
              </h3>
              {totalTasks > 0 && (
                <p className="text-sm text-calm-500 dark:text-calm-500 mt-0.5">
                  {completedTasks} of {totalTasks} completed
                </p>
              )}
            </div>
          </div>
          <Link to="/tasks">
            <Button variant="ghost" size="small" className="hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              View all
            </Button>
          </Link>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
              <CheckSquare className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-calm-600 dark:text-calm-400 mb-2 font-medium">
              No tasks for today
            </p>
            <p className="text-sm text-calm-500 dark:text-calm-500 mb-6">
              Start by adding a task to track your progress
            </p>
            <Link to="/tasks">
              <Button variant="primary" size="medium" className="shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-calm-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-calm-700/80 border border-calm-200/50 dark:border-calm-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:shadow-md group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => handleToggle(task.id)}
                  className="flex-shrink-0 focus-ring rounded-full p-1 hover:bg-calm-100 dark:hover:bg-calm-600 transition-colors"
                  aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-calm-400 dark:text-calm-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.status === 'completed'
                        ? 'line-through text-calm-500 dark:text-calm-500'
                        : 'text-calm-900 dark:text-calm-50'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.tag && (
                    <span className="inline-block mt-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 border border-primary-200 dark:border-primary-800">
                      {task.tag}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

export default TodayTasks

