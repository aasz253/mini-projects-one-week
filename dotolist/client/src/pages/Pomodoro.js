import React, { useState, useEffect, useRef } from 'react';
import { useCourses } from '../context/CourseContext';
import axios from 'axios';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  CheckCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const POMODORO_STATES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

const DURATIONS = {
  [POMODORO_STATES.FOCUS]: 25,
  [POMODORO_STATES.SHORT_BREAK]: 5,
  [POMODORO_STATES.LONG_BREAK]: 15
};

const Pomodoro = () => {
  const { courses, fetchCourses } = useCourses();
  const [timerState, setTimerState] = useState(POMODORO_STATES.FOCUS);
  const [timeLeft, setTimeLeft] = useState(DURATIONS[POMODORO_STATES.FOCUS] * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalMinutesToday, setTotalMinutesToday] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetchCourses();
    fetchTodayStats();
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const fetchTodayStats = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      const res = await axios.get(`${API_URL}/timer/history`, {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString()
        }
      });
      
      if (res.data.success) {
        setTotalMinutesToday(res.data.data.stats.totalMinutes);
      }
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    
    if (Notification.permission === 'granted') {
      new Notification('AlwaysFront', {
        body: `${timerState === POMODORO_STATES.FOCUS ? 'Focus session' : 'Break'} complete!`,
        icon: '/logo192.png'
      });
    }

    if (timerState === POMODORO_STATES.FOCUS) {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        await axios.post(`${API_URL}/timer/start`, {
          courseId: selectedCourse || null,
          type: timerState,
          duration: DURATIONS[timerState]
        });
        fetchTodayStats();
      } catch (error) {
        console.error('Failed to save session');
      }

      if (newSessions % 4 === 0) {
        setTimerState(POMODORO_STATES.LONG_BREAK);
        setTimeLeft(DURATIONS[POMODORO_STATES.LONG_BREAK] * 60);
      } else {
        setTimerState(POMODORO_STATES.SHORT_BREAK);
        setTimeLeft(DURATIONS[POMODORO_STATES.SHORT_BREAK] * 60);
      }
    } else {
      setTimerState(POMODORO_STATES.FOCUS);
      setTimeLeft(DURATIONS[POMODORO_STATES.FOCUS] * 60);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[timerState] * 60);
  };

  const switchState = (state) => {
    setIsRunning(false);
    setTimerState(state);
    setTimeLeft(DURATIONS[state] * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((DURATIONS[timerState] * 60 - timeLeft) / (DURATIONS[timerState] * 60)) * 100;

  const stateLabels = {
    [POMODORO_STATES.FOCUS]: 'Focus Time',
    [POMODORO_STATES.SHORT_BREAK]: 'Short Break',
    [POMODORO_STATES.LONG_BREAK]: 'Long Break'
  };

  const stateColors = {
    [POMODORO_STATES.FOCUS]: 'text-primary-500',
    [POMODORO_STATES.SHORT_BREAK]: 'text-green-500',
    [POMODORO_STATES.LONG_BREAK]: 'text-blue-500'
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Session</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Stay focused with the Pomodoro technique
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {Object.entries(POMODORO_STATES).map(([key, state]) => (
          <button
            key={state}
            onClick={() => switchState(state)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timerState === state
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {stateLabels[state]}
          </button>
        ))}
      </div>

      <div className="card p-8 text-center">
        <div className="relative w-64 h-64 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className={stateColors[timerState]}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-5xl font-bold ${stateColors[timerState]}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRunning
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-primary-500 hover:bg-primary-600'
            } text-white shadow-lg`}
          >
            {isRunning ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIcon className="w-8 h-8 ml-1" />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center transition-all"
          >
            <ArrowPathIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <p className={`font-medium ${stateColors[timerState]}`}>
          {stateLabels[timerState]}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-3">
            <CheckCircleIcon className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {sessionsCompleted}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sessions Today
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center mb-3">
            <FireIcon className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalMinutesToday}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Minutes Studied
          </p>
        </div>

        <div className="card p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Study For Course
          </label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="input-field"
          >
            <option value="">General Study</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>
                {course.code} - {course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">How Pomodoro Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="font-medium text-primary-600 dark:text-primary-400">1. Focus</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">25 minutes of concentrated work</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="font-medium text-green-600 dark:text-green-400">2. Short Break</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">5 minutes to rest</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-blue-600 dark:text-blue-400">3. Repeat</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Complete 4 sessions</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="font-medium text-purple-600 dark:text-purple-400">4. Long Break</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">15 minutes break</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
