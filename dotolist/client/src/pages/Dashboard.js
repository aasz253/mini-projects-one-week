import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useCourses } from '../context/CourseContext';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  BookOpenIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { tasks, stats, fetchTasks, fetchStats } = useTasks();
  const { upcomingExams, fetchUpcomingExams } = useCourses();

  useEffect(() => {
    fetchTasks({ completed: 'false' });
    fetchStats();
    fetchUpcomingExams();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getSmartSuggestions = () => {
    const suggestions = [];
    
    if (stats?.overdueTasks > 0) {
      suggestions.push({
        icon: ExclamationTriangleIcon,
        color: 'text-red-500 bg-red-50 dark:bg-red-900/20',
        message: `You have ${stats.overdueTasks} overdue task${stats.overdueTasks > 1 ? 's' : ''}. Prioritize them!`
      });
    }
    
    if (stats?.dueToday > 0) {
      suggestions.push({
        icon: ClockIcon,
        color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
        message: `You have ${stats.dueToday} task${stats.dueToday > 1 ? 's' : ''} due today!`
      });
    }
    
    if (upcomingExams.some(ex => ex.daysRemaining <= 7 && ex.daysRemaining > 0)) {
      const nextExam = upcomingExams
        .filter(ex => ex.daysRemaining <= 7 && ex.daysRemaining > 0)
        .sort((a, b) => a.daysRemaining - b.daysRemaining)[0];
      
      suggestions.push({
        icon: BookOpenIcon,
        color: 'text-primary-500 bg-primary-50 dark:bg-primary-900/20',
        message: `${nextExam.courseCode} exam in ${nextExam.daysRemaining} day${nextExam.daysRemaining > 1 ? 's' : ''}!`
      });
    }
    
    if (stats?.highPriority > 3) {
      suggestions.push({
        icon: BoltIcon,
        color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        message: 'You have many high priority tasks. Consider using Pomodoro mode!'
      });
    }
    
    if (suggestions.length === 0 && stats?.pendingTasks > 0) {
      suggestions.push({
        icon: ArrowTrendingUpIcon,
        color: 'text-green-500 bg-green-50 dark:bg-green-900/20',
        message: `You're doing great! ${stats.completionRate}% completion rate.`
      });
    }

    return suggestions;
  };

  const upcomingTasks = tasks
    .filter(t => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Let's conquer your tasks today
          </p>
        </div>
        <Link
          to="/tasks"
          className="btn-primary flex items-center gap-2"
        >
          + Add Task
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.totalTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-primary-500" />
            </div>
          </div>
          <p className="text-sm text-green-500 mt-3">
            {stats?.completedTasks || 0} completed
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.pendingTasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
          <p className="text-sm text-yellow-500 mt-3">
            {stats?.dueToday || 0} due today
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">High Priority</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.highPriority || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <FireIcon className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-sm text-red-500 mt-3">
            {stats?.overdueTasks || 0} overdue
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.completionRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${stats?.completionRate || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Smart Suggestions
            </h2>
          </div>
          
          <div className="space-y-3">
            {getSmartSuggestions().map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 rounded-lg ${suggestion.color}`}
              >
                <suggestion.icon className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{suggestion.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Deadlines
            </h2>
          </div>
          
          <div className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => {
                const daysLeft = Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 1;
                const isOverdue = daysLeft < 0;
                
                return (
                  <div
                    key={task._id}
                    className={`p-3 rounded-lg border ${
                      isOverdue 
                        ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                        : isUrgent 
                          ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                          : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {task.title}
                    </p>
                    <p className={`text-xs mt-1 ${
                      isOverdue 
                        ? 'text-red-500'
                        : isUrgent 
                          ? 'text-yellow-500'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isOverdue 
                        ? `${Math.abs(daysLeft)} day${Math.abs(daysLeft) > 1 ? 's' : ''} overdue`
                        : daysLeft === 0 
                          ? 'Due today'
                          : `${daysLeft} day${daysLeft > 1 ? 's' : ''} left`
                      }
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No upcoming deadlines
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/pomodoro"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClockIcon className="w-7 h-7 text-accent-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Study Session</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Start a Pomodoro timer</p>
            </div>
          </div>
        </Link>

        <Link
          to="/courses"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpenIcon className="w-7 h-7 text-primary-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">My Courses</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your courses</p>
            </div>
          </div>
        </Link>

        <Link
          to="/calendar"
          className="card p-6 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View all deadlines</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
