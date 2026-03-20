import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useCourses } from '../context/CourseContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Calendar = () => {
  const { tasks, fetchTasks } = useTasks();
  const { upcomingExams, fetchUpcomingExams } = useCourses();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchUpcomingExams();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = monthStart.getDay();
  const paddingDays = Array(startPadding).fill(null);

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  };

  const getExamsForDate = (date) => {
    return upcomingExams.filter(exam => 
      isSameDay(new Date(exam.examDate), date)
    );
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateExams = selectedDate ? getExamsForDate(selectedDate) : [];

  const today = new Date();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400">View all your deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {paddingDays.map((_, index) => (
              <div key={`pad-${index}`} className="aspect-square" />
            ))}
            
            {days.map(day => {
              const dayTasks = getTasksForDate(day);
              const dayExams = getExamsForDate(day);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-1 rounded-lg border transition-all relative
                    ${isToday ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent'}
                    ${isSelected ? 'ring-2 ring-primary-500' : ''}
                    hover:bg-gray-100 dark:hover:bg-gray-700
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="absolute bottom-1 left-1 right-1 flex gap-0.5 justify-center">
                    {dayExams.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    )}
                    {dayTasks.filter(t => t.priority === 'High').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                    )}
                    {dayTasks.filter(t => t.priority === 'Medium').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    )}
                    {dayTasks.filter(t => t.priority === 'Low').length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-500 dark:text-gray-400">Exam</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-gray-500 dark:text-gray-400">High Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="text-gray-500 dark:text-gray-400">Medium Priority</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-gray-500 dark:text-gray-400">Low Priority</span>
            </div>
          </div>
        </div>

        <div className="card p-4">
          {selectedDate ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h3>
              
              {selectedDateExams.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-500 mb-2">Exams</h4>
                  {selectedDateExams.map((exam, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-2">
                      <p className="font-medium text-red-600 dark:text-red-400">
                        {exam.courseCode}
                      </p>
                      <p className="text-sm text-red-500">{exam.courseName}</p>
                    </div>
                  ))}
                </div>
              )}

              {selectedDateTasks.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Tasks ({selectedDateTasks.length})
                  </h4>
                  {selectedDateTasks.map(task => (
                    <div
                      key={task._id}
                      className={`p-3 rounded-lg border ${
                        task.completed 
                          ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10'
                          : task.priority === 'High'
                            ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className={`font-medium ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge badge-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No tasks for this day
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a date to view tasks
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upcoming Exams
        </h3>
        {upcomingExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingExams.map((exam, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  exam.daysRemaining <= 3
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                    : exam.daysRemaining <= 7
                      ? 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900 dark:text-white">
                    {exam.courseCode}
                  </span>
                  <span className={`text-sm font-medium ${
                    exam.daysRemaining <= 3 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {exam.daysRemaining === 0 
                      ? 'TODAY!' 
                      : `${exam.daysRemaining} day${exam.daysRemaining > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {exam.courseName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(exam.examDate), 'MMMM d, yyyy')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No upcoming exams
          </p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
