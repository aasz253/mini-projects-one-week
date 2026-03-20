import React, { useState, useEffect } from 'react';
import { useCourses } from '../context/CourseContext';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CourseModal = ({ course, onClose }) => {
  const { createCourse, updateCourse } = useCourses();
  const isEditing = !!course;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    instructor: '',
    credits: 3,
    examDate: '',
    color: '#6366f1',
    schedule: [],
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    day: 'Monday',
    startTime: '',
    endTime: '',
    venue: ''
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        code: course.code || '',
        instructor: course.instructor || '',
        credits: course.credits || 3,
        examDate: course.examDate ? new Date(course.examDate).toISOString().split('T')[0] : '',
        color: course.color || '#6366f1',
        schedule: course.schedule || [],
        notes: course.notes || ''
      });
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const courseData = {
      ...formData,
      examDate: formData.examDate ? new Date(formData.examDate) : null
    };

    let result;
    if (isEditing) {
      result = await updateCourse(course._id, courseData);
    } else {
      result = await createCourse(courseData);
    }

    setLoading(false);
    if (result.success) {
      onClose();
    }
  };

  const addSchedule = () => {
    if (newSchedule.day && newSchedule.startTime && newSchedule.endTime) {
      setFormData(prev => ({
        ...prev,
        schedule: [...prev.schedule, { ...newSchedule }]
      }));
      setNewSchedule({ day: 'Monday', startTime: '', endTime: '', venue: '' });
    }
  };

  const removeSchedule = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#d946ef', '#ec4899',
    '#f43f5e', '#f97316', '#eab308', '#22c55e',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6b7280'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-bounce-in">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Course' : 'Add New Course'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Code *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="input-field"
                placeholder="e.g., BCS 221"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
                placeholder="e.g., Data Structures"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructor
              </label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                className="input-field"
                placeholder="Dr. Jane Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exam Date
            </label>
            <input
              type="date"
              value={formData.examDate}
              onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-lg transition-transform ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Class Schedule
            </label>
            <div className="space-y-2 mb-3">
              {formData.schedule.map((slot, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="font-medium text-sm">{slot.day}</span>
                  <span className="text-sm text-gray-500">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  {slot.venue && (
                    <span className="text-sm text-gray-500">@ {slot.venue}</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeSchedule(index)}
                    className="ml-auto text-gray-400 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <select
                value={newSchedule.day}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, day: e.target.value }))}
                className="input-field"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day.slice(0, 3)}</option>
                ))}
              </select>
              <input
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                className="input-field"
              />
              <input
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                className="input-field"
              />
              <input
                type="text"
                value={newSchedule.venue}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, venue: e.target.value }))}
                className="input-field"
                placeholder="Venue"
              />
            </div>
            <button
              type="button"
              onClick={addSchedule}
              className="mt-2 btn-secondary w-full flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Add Schedule
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-field min-h-[100px] resize-none"
              placeholder="Add course notes, topics to cover, resources..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
