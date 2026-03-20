import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTasks } from '../context/TaskContext';
import toast from 'react-hot-toast';
import {
  UserIcon,
  BellIcon,
  MoonIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { tasks } = useTasks();
  
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleProfileUpdate = async () => {
    setSaving(true);
    const result = await updateProfile({ name });
    setSaving(false);
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.message || 'Failed to update profile');
    }
  };

  const exportTasksAsPdf = async () => {
    setExportLoading(true);
    
    try {
      const completedTasks = tasks.filter(t => t.completed);
      const pendingTasks = tasks.filter(t => !t.completed);
      
      const content = `
ALWAYSFRONT - TASK EXPORT
Generated: ${new Date().toLocaleDateString()}
User: ${user?.name}

=== COMPLETED TASKS (${completedTasks.length}) ===
${completedTasks.map(t => `- ${t.title} (${t.category})`).join('\n')}

=== PENDING TASKS (${pendingTasks.length}) ===
${pendingTasks.map(t => `- ${t.title} (${t.category}) - Due: ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}`).join('\n')}
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `alwaysfront-tasks-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Tasks exported successfully');
    } catch (error) {
      toast.error('Failed to export tasks');
    } finally {
      setExportLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
    } else {
      toast.error('Notifications not supported in this browser');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field max-w-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-field max-w-md"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <MoonIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between light and dark themes
            </p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              darkMode ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                darkMode ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <BellIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about task reminders and deadlines
              </p>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="btn-secondary"
            >
              Enable
            </button>
          </div>

          {user?.settings?.notifications && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Reminder Time
              </label>
              <input
                type="time"
                defaultValue={user?.settings?.reminderTime || '09:00'}
                className="input-field max-w-xs"
              />
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <DocumentArrowDownIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Export Tasks</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Download your tasks as a text file
              </p>
            </div>
            <button
              onClick={exportTasksAsPdf}
              disabled={exportLoading}
              className="btn-secondary"
            >
              {exportLoading ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheckIcon className="w-6 h-6 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About</h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>AlwaysFront</strong> v1.0.0</p>
          <p>Your ultimate study companion for university success</p>
          <p className="pt-2">Built for students, by students.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
