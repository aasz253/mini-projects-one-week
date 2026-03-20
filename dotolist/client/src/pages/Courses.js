import React, { useEffect, useState } from 'react';
import { useCourses } from '../context/CourseContext';
import { format, differenceInDays } from 'date-fns';
import CourseModal from '../components/CourseModal';
import {
  PlusIcon,
  BookOpenIcon,
  CalendarIcon,
  TrashIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';

const Courses = () => {
  const { courses, loading, fetchCourses, deleteCourse } = useCourses();
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? Tasks associated with this course will not be deleted.')) {
      await deleteCourse(courseId);
    }
  };

  const getExamCountdown = (examDate) => {
    if (!examDate) return null;
    const daysLeft = differenceInDays(new Date(examDate), new Date());
    if (daysLeft < 0) return { text: 'Exam passed', color: 'text-gray-500', urgent: false };
    if (daysLeft === 0) return { text: 'Exam today!', color: 'text-red-500 font-bold', urgent: true };
    if (daysLeft <= 3) return { text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} to exam`, color: 'text-red-500', urgent: true };
    if (daysLeft <= 7) return { text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} to exam`, color: 'text-yellow-500', urgent: false };
    return { text: `${daysLeft} day${daysLeft > 1 ? 's' : ''} to exam`, color: 'text-green-500', urgent: false };
  };

  const courseColors = [
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-teal-500 to-teal-600',
    'from-indigo-500 to-indigo-600',
    'from-red-500 to-red-600',
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingCourse(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Course
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <BookOpenIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Add your courses to organize tasks by subject</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, index) => {
            const examCountdown = getExamCountdown(course.examDate);
            const colorClass = course.color?.startsWith('#') 
              ? 'from-primary-500 to-primary-600'
              : courseColors[index % courseColors.length];

            return (
              <div
                key={course._id}
                className="card overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className={`h-2 bg-gradient-to-r ${colorClass}`} />
                
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {course.code}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {course.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {course.instructor && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Instructor: {course.instructor}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-3">
                    {course.schedule && course.schedule.length > 0 && (
                      <span className="badge bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {course.schedule.length} day(s)/week
                      </span>
                    )}
                    <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {course.credits} credits
                    </span>
                  </div>

                  {examCountdown && (
                    <div className={`flex items-center gap-2 text-sm ${examCountdown.color}`}>
                      <CalendarIcon className="w-4 h-4" />
                      <span>{examCountdown.text}</span>
                      {course.examDate && (
                        <span className="text-gray-400 dark:text-gray-500">
                          ({format(new Date(course.examDate), 'MMM d')})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <CourseModal
          course={editingCourse}
          onClose={() => {
            setShowModal(false);
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
};

export default Courses;
