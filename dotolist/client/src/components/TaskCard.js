import React from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  CheckCircleIcon, 
  StarIcon,
  CalendarIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { format, isPast, isToday } from 'date-fns';

const TaskCard = ({ task, viewMode, onEdit }) => {
  const { toggleComplete, toggleFavorite, deleteTask } = useTasks();

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !task.completed;
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  const priorityColors = {
    Low: 'badge-low',
    Medium: 'badge-medium',
    High: 'badge-high'
  };

  const categoryColors = {
    Assignments: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    Exams: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    Personal: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
    Projects: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    Study: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
    Other: 'bg-gray-100 dark:bg-gray-700 text-gray-600'
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task._id);
    }
  };

  const handleToggleComplete = async (e) => {
    e.stopPropagation();
    await toggleComplete(task._id);
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    await toggleFavorite(task._id);
  };

  return (
    <div className={`
      card p-4 cursor-pointer hover:shadow-md transition-all duration-200
      ${task.completed ? 'opacity-70' : ''}
      ${task.favorite ? 'ring-2 ring-yellow-400' : ''}
    `}>
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggleComplete}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all
            ${task.completed 
              ? 'bg-green-500 border-green-500' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
            }
          `}
        >
          {task.completed && (
            <CheckCircleIcon className="w-full h-full text-white" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`
                font-medium text-gray-900 dark:text-white
                ${task.completed ? 'line-through text-gray-500' : ''}
              `}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleToggleFavorite}
                className={`p-1 rounded ${task.favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
              >
                <StarIcon className="w-5 h-5" fill={task.favorite ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 rounded text-gray-400 hover:text-primary-500"
              >
                <PencilSquareIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 rounded text-gray-400 hover:text-red-500"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className={`badge ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            
            <span className={`badge ${categoryColors[task.category] || categoryColors.Other}`}>
              {task.category}
            </span>

            {task.course && (
              <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {task.course.code || task.course.name}
              </span>
            )}

            {task.dueDate && (
              <span className={`
                flex items-center gap-1 text-xs
                ${isOverdue ? 'text-red-500' : isDueToday ? 'text-yellow-500' : 'text-gray-500 dark:text-gray-400'}
              `}>
                <CalendarIcon className="w-3.5 h-3.5" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <CheckCircleIcon className="w-4 h-4" />
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
