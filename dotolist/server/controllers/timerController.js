const StudySession = require('../models/StudySession');

exports.startSession = async (req, res) => {
  try {
    const { courseId, type, duration } = req.body;

    const session = await StudySession.create({
      user: req.user.id,
      course: courseId,
      type: type || 'focus',
      duration: duration || 25
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const session = await StudySession.findByIdAndUpdate(
      req.params.id,
      { completedAt: new Date() },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSessionHistory = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user.id };
    
    if (startDate && endDate) {
      query.completedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const sessions = await StudySession.find(query)
      .populate('course', 'name code color')
      .sort({ completedAt: -1 })
      .limit(100);

    const totalMinutes = sessions.reduce((acc, session) => acc + session.duration, 0);
    const totalSessions = sessions.length;

    res.status(200).json({
      success: true,
      data: {
        sessions,
        stats: {
          totalSessions,
          totalMinutes,
          totalHours: Math.round(totalMinutes / 60 * 10) / 10
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await StudySession.find({
      user: req.user.id,
      completedAt: { $gte: weekAgo }
    }).select('completedAt duration type');

    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = { minutes: 0, sessions: 0 };
    }

    sessions.forEach(session => {
      const dateStr = session.completedAt.toISOString().split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].minutes += session.duration;
        dailyStats[dateStr].sessions += 1;
      }
    });

    res.status(200).json({
      success: true,
      data: dailyStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
