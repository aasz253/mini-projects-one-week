import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchTasks = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`${API_URL}/tasks${params ? `?${params}` : ''}`);
      setTasks(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks/stats`);
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const createTask = async (taskData) => {
    try {
      const res = await axios.post(`${API_URL}/tasks`, taskData);
      setTasks(prev => [res.data.data, ...prev]);
      toast.success('Task created successfully');
      fetchStats();
      return { success: true };
    } catch (error) {
      toast.error('Failed to create task');
      return { success: false };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? res.data.data : task
      ));
      toast.success('Task updated');
      fetchStats();
      return { success: true };
    } catch (error) {
      toast.error('Failed to update task');
      return { success: false };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task._id !== taskId));
      toast.success('Task deleted');
      fetchStats();
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete task');
      return { success: false };
    }
  };

  const toggleComplete = async (taskId) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${taskId}/toggle-complete`);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? res.data.data : task
      ));
      fetchStats();
      return { success: true };
    } catch (error) {
      toast.error('Failed to update task');
      return { success: false };
    }
  };

  const toggleFavorite = async (taskId) => {
    try {
      const res = await axios.put(`${API_URL}/tasks/${taskId}/toggle-favorite`);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? res.data.data : task
      ));
      return { success: true };
    } catch (error) {
      toast.error('Failed to update task');
      return { success: false };
    }
  };

  const reorderTasks = async (reorderedTasks) => {
    setTasks(reorderedTasks);
    try {
      await axios.put(`${API_URL}/tasks/reorder`, {
        tasks: reorderedTasks.map((task, index) => ({ _id: task._id, order: index }))
      });
    } catch (error) {
      toast.error('Failed to reorder tasks');
      fetchTasks();
    }
  };

  const value = {
    tasks,
    loading,
    stats,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    toggleFavorite,
    reorderTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
