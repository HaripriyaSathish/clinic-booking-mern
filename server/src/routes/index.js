const router = require('express').Router();

router.use('/public', require('./publicRoutes'));
router.use('/admin', require('./adminRoutes'));

module.exports = router;
