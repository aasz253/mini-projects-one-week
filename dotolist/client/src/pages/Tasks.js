import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useTasks } from '../context/TaskContext';
import { useCourses } from '../context/CourseContext';
import TaskModal from '../components/TaskModal';
import TaskCard from '../components/TaskCard';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewColumnsIcon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

const Tasks = () => {
  const { tasks, loading, fetchTasks, reorderTasks } = useTasks();
  const { courses, fetchCourses } = useCourses();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [viewMode, setViewMode] = useState('list');

  useEffect(() => {
    fetchTasks();
    fetchCourses();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const filters = {};
      if (search) filters.search = search;
      if (filterCategory !== 'All') filters.category = filterCategory;
      if (filterPriority !== 'All') filters.priority = filterPriority;
      fetchTasks(filters);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, filterCategory, filterPriority]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderTasks(items);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const categories = ['All', 'Assignments', 'Exams', 'Personal', 'Projects', 'Study', 'Other'];
  const priorities = ['All', 'Low', 'Medium', 'High'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditingTask(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          + Add Task
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input-field w-full md:w-48"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="input-field w-full md:w-48"
        >
          {priorities.map(pri => (
            <option key={pri} value={pri}>{pri} Priority</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <ListBulletIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            <ViewColumnsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ListBulletIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create a new task to get started</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-3'
                }
              >
                {tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-50' : ''}
                      >
                        <TaskCard 
                          task={task} 
                          viewMode={viewMode}
                          onEdit={() => handleEditTask(task)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {showModal && (
        <TaskModal
          task={editingTask}
          courses={courses}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
};

export default Tasks;
