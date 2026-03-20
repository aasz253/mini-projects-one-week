const express = require('express');
const router = express.Router();
const { startSession, completeSession, getSessionHistory, getWeeklyStats } = require('../controllers/timerController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/start', startSession);
router.put('/:id/complete', completeSession);
router.get('/history', getSessionHistory);
router.get('/weekly', getWeeklyStats);

module.exports = router;
