const userService = require('../services/userService');
const { publishEvent, formatNewUserMsg } = require('../../../rabbitmq/rabbitmqPublisher');

exports.test_1 = async (req, res, next) => {
  try {
    const result = await userService.addUserSkill2(req);
    console.log(typeof result);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.test_2 = async (req, res, next) => {
  try {
    const result = await userService.test_2(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Profile
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const users = await userService.getUser(req);
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    // const user = await userService.createUser(req);
    // if (user) {
    //   const newUser = await formatNewUserMsg(user, 'candidate');
    //   await publishEvent('user.account.created', newUser);  
    // }
    // res.status(201).json(user);

    const result = await userService.createUser(req);
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

exports.authUser = async (req, res, next) => {
  try {
    const result = await userService.authUser(req);
    // Set token in header
    res.setHeader('Authorization', result.token);
    // Send user info in body
    res.status(200).json({
      message: 'Authentication successful',
      user: result.user
    });
  } catch (err) {
    next(err);
  }
}

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// SKILLS
exports.getUserSkills = async (req, res, next) => {
  try {
    const skills = await userService.getUserSkills(req);
    res.status(200).json(skills);
  } catch (err) {
    next(err);
  }
};

exports.addSingleSkill = async (req, res, next) => {
  try {
    const skills = await userService.addSingleSkill(req);
    res.status(200).json(skills);
  } catch (err) {
    next(err);
  }
};

exports.addArraySkill = async (req, res, next) => {
  try {
    const skills = await userService.addArraySkill(req);
    res.status(200).json(skills);
  } catch (err) {
    next(err);
  }
};

exports.removeUserSkill = async (req, res, next) => {
  try {
    const result = await userService.removeUserSkill(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// EXPERIENCE
exports.getUserExp = async (req, res, next) => {
  try {
    const exp = await userService.getUserExp(req);
    res.status(200).json(exp);
  } catch (err) {
    next(err);
  }
};

exports.addUserExp = async (req, res, next) => {
  try {
    const exp = await userService.addUserExp(req);
    res.status(200).json(exp);
  } catch (err) {
    next(err);
  }
};

exports.updateUserExp = async (req, res, next) => {
  try {
    const exp = await userService.updateUserExp(req);
    res.status(200).json(exp);
  } catch (err) {
    next(err);
  }
};

exports.removeUserExp = async (req, res, next) => {
  try {
    const exp = await userService.removeUserExp(req);
    res.status(200).json(exp);
  } catch (err) {
    next(err);
  }
};

// Education
exports.getUserEdu = async (req, res, next) => {
  try {
    const edu = await userService.getUserEdu(req);
    res.status(200).json(edu);
  } catch (err) {
    next(err);
  }
};

exports.addUserEdu = async (req, res, next) => {
  try {
    const edu = await userService.addUserEdu(req);
    res.status(200).json(edu);
  } catch (err) {
    next(err);
  }
};

exports.updateUserEdu = async (req, res, next) => {
  try {
    const edu = await userService.updateUserEdu(req);
    res.status(200).json(edu);
  } catch (err) {
    next(err);
  }
};


exports.removeUserEdu = async (req, res, next) => {
  try {
    const edu = await userService.removeUserEdu(req);
    res.status(200).json(edu);
  } catch (err) {
    next(err);
  }
};

// Saved-jobs
exports.getSavedJobs = async (req, res, next) => {
  try {
    const result = await userService.getSavedJobs(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.saveJob = async (req, res, next) => {
  try {
    const result = await userService.saveJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.unsaveJob = async (req, res, next) => {
  try {
    const result = await userService.unsaveJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Applied-jobs

exports.getAppliedJobs = async (req, res, next) => {
  try {
    const result = await userService.getAppliedJobs(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.applyJob = async (req, res, next) => {
  try {
    const result = await userService.applyJob(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

exports.withdrawApp = async (req, res, next) => {
  try {
    const result = await userService.withdrawApp(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Admin
exports.createAdmin = async (req, res, next) => {
  try {
    const user = await userService.createUser(req);
    // console.log(typeof user);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

exports.authAdmin = async (req, res, next) => {
  try {
    const result = await userService.authAdmin(req);
    // Set token in header
    res.setHeader('Authorization', `Bearer ${result.token}`);
    // Send user info in body
    res.status(200).json({
      message: 'Authentication successful',
      user: result.user
    });
  } catch (err) {
    next(err);
  }
}