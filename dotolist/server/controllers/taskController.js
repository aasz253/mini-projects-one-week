const Task = require('../models/Task');

exports.getTasks = async (req, res) => {
  try {
    const { category, priority, completed, course, search, sort, favorite } = req.query;
    
    const query = { user: req.user.id };
    
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (completed !== undefined) query.completed = completed === 'true';
    if (course) query.course = course;
    if (favorite === 'true') query.favorite = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'dueDate') sortOption = { dueDate: 1, priority: -1 };
    if (sort === 'priority') sortOption = { priority: -1, dueDate: 1 };
    if (sort === 'custom') sortOption = { order: 1 };

    const tasks = await Task.find(query)
      .populate('course', 'name code color')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      user: req.user.id
    };

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id).populate('course', 'name code color');

    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('course', 'name code color')
      .populate('sharedWith', 'name email avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task'
      });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course', 'name code color');

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this task'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleComplete = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    task.favorite = !task.favorite;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    
    const bulkOps = tasks.map((task, index) => ({
      updateOne: {
        filter: { _id: task._id, user: req.user.id },
        update: { $set: { order: index } }
      }
    }));

    await Task.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.shareTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!task.sharedWith.includes(userId)) {
      task.sharedWith.push(userId);
      await task.save();
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ user: req.user.id });
    const completedTasks = await Task.countDocuments({ user: req.user.id, completed: true });
    const highPriority = await Task.countDocuments({ user: req.user.id, priority: 'High', completed: false });
    const overdueTasks = await Task.countDocuments({ 
      user: req.user.id, 
      completed: false, 
      dueDate: { $lt: new Date() } 
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await Task.countDocuments({
      user: req.user.id,
      completed: false,
      dueDate: { $gte: today, $lt: tomorrow }
    });

    const upcomingExams = await Task.countDocuments({
      user: req.user.id,
      category: 'Exams',
      completed: false,
      dueDate: { $gte: today, $lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        pendingTasks: totalTasks - completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        highPriority,
        overdueTasks,
        dueToday,
        upcomingExams
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
