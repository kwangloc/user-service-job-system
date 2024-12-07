const express = require('express');
const companyController = require('../controllers/companyController');
const router = express.Router();
const auth = require('../middlewares/authentication')
const admin = require('../middlewares/admin');

// Testing route
router.post('/test_1', companyController.test_1);

router.post('/register', [auth, admin], companyController.createCompany);
router.get('/profile/:companyId', companyController.getCompany);

// Protected
router.put('/profile', [auth], companyController.updateCompany);
router.get('/admin/profile/all', [auth, admin], companyController.getAllCompanies);
router.patch('/admin/profile/editStatus/:companyId', [auth, admin], companyController.editStatus);
// router.delete('/admin/profile/:companyId', [auth, admin], companyController.deleteCompany);

// Posted-jobs
router.post('/postedJobs/', auth, companyController.addPostedJob);
router.get('/postedJobs/', auth, companyController.getPostedJobs);
router.delete('/postedJobs/', auth, companyController.delPostedJob);

module.exports = router;