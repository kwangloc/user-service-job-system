const express = require('express');
const statisticsController = require('../controllers/statisticsController');
const router = express.Router();
const auth = require('../middlewares/authentication')
const admin = require('../middlewares/admin');

router.get('/growth', [auth, admin], statisticsController.growth);
router.get('/demographic', [auth, admin], statisticsController.demographic);
router.get('/userTracking', [auth, admin], statisticsController.userTracking);
router.get('/cities', statisticsController.getCities);

module.exports = router;