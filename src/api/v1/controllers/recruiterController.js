const recruiterService = require('../services/recruiterService');
const { publishEvent, formatNewUserMsg } = require('../../../rabbitmq/rabbitmqPublisher');

exports.test_1 = async (req, res, next) => {
  try {
    const result = await recruiterService.test_1(req);
    // console.log(typeof result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};


// Profile
exports.getAllRecruiters = async (req, res, next) => {
  try {
    const users = await recruiterService.getAllRecruiters(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getRecruiter = async (req, res, next) => {
  try {
    const users = await recruiterService.getRecruiter(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getRecruitersByCompany = async (req, res, next) => {
  try {
    const users = await recruiterService.getRecruitersByCompany(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.createRecruiter = async (req, res, next) => {
  try {
    const result = await recruiterService.createRecruiter(req);
    res.setHeader('Authorization', result.token);
    res.status(201).json({
      message: result.message,
      user: result.user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRecruiter = async (req, res, next) => {
  try {
    const user = await recruiterService.updateRecruiter(req);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteRecruiter = async (req, res, next) => {
  try {
    const recruiter = await recruiterService.deleteRecruiter(req);
    res.status(200).json(recruiter);
  } catch (err) {
    next(err);
  }
};

// Posted-jobs

exports.addPostedJob = async (req, res, next) => {
  try {
    const result = await recruiterService.addPostedJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPostedJobs = async (req, res, next) => {
  try {
    const result = await recruiterService.getPostedJobs(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.delPostedJob = async (req, res, next) => {
  try {
    const result = await recruiterService.delPostedJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
