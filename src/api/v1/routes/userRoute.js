const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const auth = require('../middlewares/authentication')
const admin = require('../middlewares/admin');

// Testing route
// router.post('/test_1', userController.test_1);
// router.post('/test_2', userController.test_2);

// Public routes
// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password', userController.resetPassword);

// # Profile
// Public
router.post('/register', userController.createUser);
router.post('/auth', userController.authUser);
router.get('/profile/:userId', userController.getUser);
// Protected
router.put('/profile', auth, userController.updateUser);
router.get('/a/profile/all', [auth, admin], userController.getAllUsers);
router.delete('/a/profile/:userId', [auth, admin], userController.deleteUser);

// # Skills
// Protected
router.get('/skills/:userId', auth, userController.getUserSkills);
router.post('/skills', auth, userController.addUserSkill);
router.delete('/skills/', auth, userController.removeUserSkill);

// Experiences
// router.get('/experience', userController.getUserExperience);
// router.post('/experience', userController.addUserExperience);
// router.put('/experience/:experienceId', userController.updateUserExperience);
// router.delete('/experience/:experienceId', userController.removeUserExperience);

// Education
// router.get('/education', userController.getUserEducation);
// router.post('/education', userController.addUserEducation);
// router.put('/education/:educationId', userController.updateUserEducation);
// router.delete('/education/:educationId', userController.removeUserEducation);

// Saved-jobs
router.get('/savedJobs/', auth, userController.getSavedJobs);
router.post('/savedJobs/', auth, userController.saveJob);
router.delete('/savedJobs/', auth, userController.unsaveJob);

// Applied-jobs
router.get('/appliedJobs/', auth, userController.getAppliedJobs);
router.post('/appliedJobs/', auth, userController.applyJob);
router.delete('/appliedJobs/', auth, userController.withdrawApp);

module.exports = router;