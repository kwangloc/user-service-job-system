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
router.post('/register', auth, recruiterController.createRecruiter); // By company
router.get('/profile/:recruiterId', recruiterController.getRecruiter);

// Protected
router.put('/profile', auth, recruiterController.updateRecruiter);
router.get('/getByCompany/:companyId', auth, recruiterController.getRecruitersByCompany);

// Posted-jobs
router.post('/postedJobs/', auth, recruiterController.addPostedJob);
router.get('/postedJobs/', auth, recruiterController.getPostedJobs);
router.delete('/postedJobs/', auth, recruiterController.delPostedJob);

// ADMIN
router.get('/admin/profile/all', [auth, admin], recruiterController.getAllRecruiters);
router.put('/admin/profile/:recruiterId', auth, recruiterController.updateRecruiter);
router.delete('/admin/profile/:recruiterId', [auth, admin], recruiterController.deleteRecruiter);


module.exports = router;