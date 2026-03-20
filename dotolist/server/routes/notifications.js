const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/permission', async (req, res) => {
  if ('Notification' in window) {
    const permission = Notification.permission;
    res.json({ success: true, data: { permission } });
  } else {
    res.json({ success: false, message: 'Notifications not supported' });
  }
});

router.post('/request', async (req, res) => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    res.json({ success: true, data: { permission } });
  } else {
    res.json({ success: false, message: 'Notifications not supported' });
  }
});

module.exports = router;
