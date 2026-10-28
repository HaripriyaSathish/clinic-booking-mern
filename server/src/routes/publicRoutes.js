const router = require('express').Router();
const validate = require('../middleware/validate');
const homeController = require('../controllers/homeController');
const departmentController = require('../controllers/departmentController');
const doctorController = require('../controllers/doctorController');
const appointmentController = require('../controllers/appointmentController');

router.get('/home', homeController.getHomeData);
router.get('/departments', departmentController.getPublic);
router.get('/doctors', doctorController.getPublic);
router.post('/appointments', appointmentController.rules, validate, appointmentController.create);

// TODO: wire as sections are built
// router.get('/doctors/:slug', doctorController.getBySlug);
// router.get('/slots', scheduleController.getAvailableSlots);
// router.post('/contact', contactController.create);

module.exports = router;
