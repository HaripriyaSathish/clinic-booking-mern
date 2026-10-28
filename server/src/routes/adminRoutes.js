const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const authController = require('../controllers/authController');
const heroController = require('../controllers/heroController');
const dashboardController = require('../controllers/dashboardController');
const settingsController = require('../controllers/settingsController');
const statController = require('../controllers/statController');
const sectionController = require('../controllers/sectionController');
const departmentController = require('../controllers/departmentController');
const doctorController = require('../controllers/doctorController');
const content = require('../models/contentModels');

router.post('/login', authController.login);

router.use(auth); // everything below is protected

router.get('/dashboard', dashboardController.stats);

router.get('/hero', heroController.get);
router.put('/hero', upload.single('image'), heroController.update);

router.get('/settings', settingsController.get);
router.put('/settings', upload.single('logo'), settingsController.update);

router.get('/stats', statController.list);
router.post('/stats', statController.create);
router.put('/stats/:id', statController.update);
router.delete('/stats/:id', statController.remove);

// Section headings (eyebrow / title / description), e.g. /sections/departments
router.get('/sections/:key', sectionController.get);
router.put('/sections/:key', sectionController.update);

router.get('/departments', departmentController.list);
router.post('/departments', departmentController.create);
router.put('/departments/:id', departmentController.update);
router.delete('/departments/:id', departmentController.remove);

router.get('/doctors', doctorController.list);
router.post('/doctors', upload.single('photo'), doctorController.create);
router.put('/doctors/:id', upload.single('photo'), doctorController.update);
router.delete('/doctors/:id', doctorController.remove);

content.services.mount(router, 'services', upload);
content.testimonials.mount(router, 'testimonials', upload);
content.gallery.mount(router, 'gallery', upload);
content.timings.mount(router, 'timings', upload);
content.faqs.mount(router, 'faqs', upload);

// TODO: wire as sections are built, e.g.
// router.get('/doctors', doctorController.list);
// router.patch('/appointments/:id/status', appointmentController.updateStatus);

module.exports = router;
