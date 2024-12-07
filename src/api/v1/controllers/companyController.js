const companyService = require('../services/companyService');

exports.test_1 = async (req, res, next) => {
  try {
    // const result = await companyService.addUserSkill2(req);
    // console.log(typeof result);
    res.status(200).json("company health ok!");
  } catch (err) {
    next(err);
  }
};

// Profile
exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getAllCompanies(req);
    res.status(200).json(companies);
  } catch (err) {
    next(err);
  }
};

exports.getCompany = async (req, res, next) => {
  try {
    const company = await companyService.getCompany(req);
    res.status(200).json(company);
  } catch (err) {
    next(err);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const result = await companyService.createCompany(req);
    res.setHeader('Authorization', result.token);
    // res.status(201).json({
    //   message: 'Authentication successful',
    //   user: result.user
    // });
    res.status(201).json({
      message: result.message,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const user = await companyService.updateCompany(req);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.editStatus = async (req, res, next) => {
  try {
    const user = await companyService.editStatus(req);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};




// exports.deleteCompany = async (req, res, next) => {
//   try {
//     const company = await companyService.deleteCompany(req);
//     res.status(200).json(company);
//   } catch (err) {
//     next(err);
//   }
// };

// Posted-jobs
exports.addPostedJob = async (req, res, next) => {
  try {
    const result = await companyService.addPostedJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPostedJobs = async (req, res, next) => {
  try {
    const result = await companyService.getPostedJobs(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.delPostedJob = async (req, res, next) => {
  try {
    const result = await companyService.delPostedJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
