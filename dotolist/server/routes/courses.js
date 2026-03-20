const express = require('express');
const router = express.Router();
const { getCourses, createCourse, getCourse, updateCourse, deleteCourse, getCourseTasks, updateCourseNotes, getUpcomingExams } = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(createCourse);

router.get('/exams', getUpcomingExams);

router.route('/:id')
  .get(getCourse)
  .put(updateCourse)
  .delete(deleteCourse);

router.get('/:id/tasks', getCourseTasks);
router.put('/:id/notes', updateCourseNotes);

module.exports = router;
