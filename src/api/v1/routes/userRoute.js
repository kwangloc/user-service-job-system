const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();
const auth = require('../middlewares/authentication')
const admin = require('../middlewares/admin');

// Testing route
router.get("/health", async (req, res) => {
    res.send({ message: "health OK!" });
});

router.post('/test_1', auth, userController.test_1);
// router.post('/test_2', userController.test_2);

// Public routes
// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password', userController.resetPassword);

// # Profile
// Public
router.post('/register', userController.createUser);
// router.post('/auth', userController.authUser);
router.get('/profile/:userId', userController.getUser);
// Protected
router.put('/profile/:userId', auth, userController.updateUser);

// # Skills
router.get('/skills/:userId', userController.getUserSkills);
router.post('/skill/:userId', auth, userController.addSingleSkill);
router.post('/skills/:userId', auth, userController.addArraySkill);
router.delete('/skills/:userId', auth, userController.removeUserSkill);

// Experiences
router.get('/exp/:userId', userController.getUserExp);
router.post('/exp/:userId', auth, userController.addUserExp);
router.put('/exp/:expId', auth, userController.updateUserExp);
router.delete('/exp/:userId', auth, userController.removeUserExp);

// Education
router.get('/edu/:userId', userController.getUserEdu);
router.post('/edu/:userId', auth, userController.addUserEdu);
router.put('/edu/:eduId', auth, userController.updateUserEdu);
router.delete('/edu/:userId', auth, userController.removeUserEdu);

// Saved-jobs
router.get('/savedJobs/', auth, userController.getSavedJobs);
router.post('/savedJobs/', auth, userController.saveJob);
router.delete('/savedJobs/', auth, userController.unsaveJob);

// Applied-jobs
router.get('/appliedJobs/', auth, userController.getAppliedJobs);
router.post('/appliedJobs/', auth, userController.applyJob);
router.delete('/appliedJobs/', auth, userController.withdrawApp);

// ADMIN
router.get('/admin/profile/all', [auth, admin], userController.getAllUsers);
router.put('/admin/profile/:userId', [auth, admin], userController.updateUser);
router.delete('/admin/profile/:userId', [auth, admin], userController.deleteUser);

module.exports = router;