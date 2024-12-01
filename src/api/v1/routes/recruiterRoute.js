const express = require('express');
const recruiterController = require('../controllers/recruiterController');
const router = express.Router();
const auth = require('../middlewares/authentication')
const admin = require('../middlewares/admin');

// Testing route
router.post('/test_1', recruiterController.test_1);

// Public routes
// router.post('/forgot-password', recruiterController.forgotPassword);
// router.post('/reset-password', recruiterController.resetPassword);

// # Profile
// Public
router.post('/register', recruiterController.createRecruiter);
router.get('/profile/:recruiterId', recruiterController.getRecruiter);

// Protected
router.put('/profile', auth, recruiterController.updateRecruiter);
router.get('/admin/profile/all', [auth, admin], recruiterController.getAllRecruiters);
router.delete('/admin/profile/:recruiterId', [auth, admin], recruiterController.deleteRecruiter);

// Posted-jobs
router.post('/postedJobs/', auth, recruiterController.addPostedJob);
router.get('/postedJobs/', auth, recruiterController.getPostedJobs);
router.delete('/postedJobs/', auth, recruiterController.delPostedJob);

module.exports = router;