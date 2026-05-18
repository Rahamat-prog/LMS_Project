const {Router} = require('express');
const { getAllCourses, getLecturesByCourseId } = require('../controllers/courseControllers');

const router = Router();

router.get('/', getAllCourses);
router.get('/:id', getLecturesByCourseId);

module.exports = router;