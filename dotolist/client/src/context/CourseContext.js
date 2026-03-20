import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const CourseContext = createContext();

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [upcomingExams, setUpcomingExams] = useState([]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/courses`);
      setCourses(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingExams = async () => {
    try {
      const res = await axios.get(`${API_URL}/courses/exams`);
      setUpcomingExams(res.data.data);
    } catch (error) {
      console.error('Failed to fetch upcoming exams');
    }
  };

  const createCourse = async (courseData) => {
    try {
      const res = await axios.post(`${API_URL}/courses`, courseData);
      setCourses(prev => [...prev, res.data.data]);
      toast.success('Course added successfully');
      return { success: true };
    } catch (error) {
      toast.error('Failed to add course');
      return { success: false };
    }
  };

  const updateCourse = async (courseId, updates) => {
    try {
      const res = await axios.put(`${API_URL}/courses/${courseId}`, updates);
      setCourses(prev => prev.map(course => 
        course._id === courseId ? res.data.data : course
      ));
      toast.success('Course updated');
      return { success: true };
    } catch (error) {
      toast.error('Failed to update course');
      return { success: false };
    }
  };

  const deleteCourse = async (courseId) => {
    try {
      await axios.delete(`${API_URL}/courses/${courseId}`);
      setCourses(prev => prev.filter(course => course._id !== courseId));
      toast.success('Course deleted');
      return { success: true };
    } catch (error) {
      toast.error('Failed to delete course');
      return { success: false };
    }
  };

  const updateNotes = async (courseId, notes) => {
    try {
      const res = await axios.put(`${API_URL}/courses/${courseId}/notes`, { notes });
      setCourses(prev => prev.map(course => 
        course._id === courseId ? res.data.data : course
      ));
      toast.success('Notes saved');
      return { success: true };
    } catch (error) {
      toast.error('Failed to save notes');
      return { success: false };
    }
  };

  const value = {
    courses,
    loading,
    upcomingExams,
    fetchCourses,
    fetchUpcomingExams,
    createCourse,
    updateCourse,
    deleteCourse,
    updateNotes
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};
