const { publishEvent } = require('../../../rabbitmq/rabbitmqPublisher');
//
const bcrypt = require('bcrypt'); // hashing

const { User, validateUser, validateSkill, validateExp, validateEdu } = require("../models/userModel");
const { isValidId, authUser } = require("../validations/validators");

// For testing
exports.test_1 = async (req) => {
  console.log("***********");
  console.log("Got a request.");
  console.log("Created user.");
  const newUser = {
    id: req.body._id,
    name: req.body.name,
    email: req.body.email
  };
  // await publishEvent('user.created', newUser);  
  return "created";
};

exports.test_2 = async (req) => {
  console.log("***********");
  console.log("Got a request.");
  console.log("Created job.");
  const newJob = {
    id: req.body._id,
    title: req.body.title
  };
  // await publishEvent('job.created', newJob);  
  return "created";
};

// Profile
exports.getAllUsers = async (req) => {
  return User.find().sort("-name");
};

exports.getUser = async (req) => {
  const { userId } = req.params;
  // invalid id
  if (!isValidId(userId)) {
    const error = new Error("Invalid userId");
    error.statusCode = 500;
    throw error;
  }
  // find by id
  const user = await User.findById(userId).select("-password");
  // not found id
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }
  return user;
};

exports.createUser = async (req) => {
  // 1. validate req.body
  const { error } = validateUser(req.body);
  if (error) throw new Error(JSON.stringify(error.details));
  try {
    // 2. check existing email
    let existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      const duplicateError = new Error("A user with this email already exists");
      duplicateError.statusCode = 400; // Conflict
      throw duplicateError;
    }
    // 3. create the user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      ...req.body,
      password: hashedPassword
    });
    const savedUser = await newUser.save();
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;
    return userWithoutPassword;
    // const user = await User.create(req.body);
    // return user;
  } catch (err) {
    throw new Error(`Failed to create user: ${err.message}`);
  }
};

exports.authUser = async (req) => {
  try {
    // 1. validate req.body
    const { error } = authUser(req.body);
    if (error) {
      const validationError = new Error(JSON.stringify(error.details));
      validationError.statusCode = 400;
      throw validationError;
    } 
    // 2. verify email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }
    // 3. verify password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }
    const token = user.generateAuthToken();
    // return token;
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  } catch (err) {
    throw new Error(`Authentication failed! ${err.message}`);
  }
}

exports.updateUser = async (req) => {
  try {
    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.location) updateFields.location = req.body.location;
    if (req.body.phone) updateFields.phone = req.body.phone;
    if (req.body.dateOfBirth) updateFields.dateOfBirth = req.body.dateOfBirth;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user;
  } catch (err) {
    throw new Error(`Failed to update user: ${err.message}`);
  }
};

exports.deleteUser = async (req) => {
  const { userId } = req.params;
  // val userId
  if (!isValidId(userId)) {
    const error = new Error("Invalid userId");
    error.statusCode = 500;
    throw error;
  }

  try {
    let result = await User.findByIdAndDelete(userId);
    // if (!res) return res.status(404).send("The user id is invalid!");
    if (!result) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return result;
  } catch (err) {
    throw new Error(`Failed to delete user: ${err.message}`);
  }
};

// SKILLS
exports.getUserSkills = async (req) => {
  const { userId } = req.params;
  // val userId
  if (!isValidId(userId)) {
    const error = new Error("Invalid userId");
    error.statusCode = 500;
    throw error;
  }

  try {
    const user = await User.findById(userId).select("skills");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user.skills;
  } catch (err) {
    throw new Error(`Failed to getUserSkills: ${err.message}`);
  }
};

exports.addUserSkill = async (req) => {
  // val skill object
  const { error } = validateSkill(req.body);
  if (error) throw new Error(JSON.stringify(error.details));

  const { skill } = req.body;
  // if (!validateSkill(skill)) {
  //   const error = new Error("Missing required fields");
  //   error.statusCode = 500;
  //   throw error;
  // }

  if (!isValidId(skill._id)) {
    const error = new Error("Invalid skillId");
    error.statusCode = 500;
    throw error;
  }
 
  // add skill
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { skills: skill } },
      { new: true }
    ).select("skills");
    return user.skills;
  } catch (err) {
    throw new Error(`Failed to addUserSkill: ${err.message}`);
  }
};

exports.removeUserSkill = async (req) => {
  // val skillId
  const { skillId } = req.body;
  if (!isValidId(skillId)) {
    const error = new Error("Invalid skillId");
    error.statusCode = 500;
    throw error;
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      // { $pull: { skills: skillId } },
      { $pull: { skills: { _id: skillId } } },
      { new: true }
    ).select("skills");
    return user.skills;
  } catch (err) {
    throw new Error(`Failed to removeUserSkill: ${err.message}`);
  }
};

// EXPERIENCE
exports.getUserExp = async (req) => {
  const { userId } = req.params;
  // val userId
  if (!isValidId(userId)) {
    const error = new Error("Invalid userId");
    error.statusCode = 500;
    throw error;
  }

  try {
    const user = await User.findById(userId).select("experience");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user.experience;
  } catch (err) {
    throw new Error(`Failed to getUserExp: ${err.message}`);
  }
};

exports.addUserExp = async (req) => {
  // val skill object
  const { experience } = req.body;
  console.log("experience: ");
  console.group(experience);

  const { error } = validateExp(experience);
  if ( error ) throw new Error(JSON.stringify(error.details));

  // add skill
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { experience: experience } },
      { new: true }
    ).select("experience");
    return user.experience;
  } catch (err) {
    throw new Error(`Failed to addUserExp: ${err.message}`);
  }
};

exports.removeUserExp = async (req) => {
  // val expId
  const { expId } = req.body;

  console.log(req.user._id);
  console.log(expId);

  if (!isValidId(expId)) {
    const error = new Error("Invalid expId");
    error.statusCode = 500;
    throw error;
  }
  
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { experience: { _id: expId } } },
      { new: true }
    ).select("experience");
    return user.skills;
  } catch (err) {
    throw new Error(`Failed to removeUserExp: ${err.message}`);
  }
};

// EDUCATION
exports.getUserEdu = async (req) => {
  const { userId } = req.params;
  // val userId
  if (!isValidId(userId)) {
    const error = new Error("Invalid userId");
    error.statusCode = 500;
    throw error;
  }

  try {
    const user = await User.findById(userId).select("education");
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user.education;
  } catch (err) {
    throw new Error(`Failed to getUserEdu: ${err.message}`);
  }
};

exports.addUserEdu = async (req) => {
  // val body
  const { education } = req.body;
  console.log(education);

  const { error } = validateEdu(education);
  if ( error ) throw new Error(JSON.stringify(error.details));

  // add skill
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { education: education } },
      { new: true }
    ).select("education");
    return user.education;
  } catch (err) {
    throw new Error(`Failed to addUserEdu: ${err.message}`);
  }
};

exports.removeUserEdu = async (req) => {
  // val expId
  const { eduId } = req.body;

  console.log(req.user._id);
  console.log(eduId);

  if (!isValidId(eduId)) {
    const error = new Error("Invalid expId");
    error.statusCode = 500;
    throw error;
  }
  
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { education: { _id: eduId } } },
      { new: true }
    ).select("education");
    return user.skills;
  } catch (err) {
    throw new Error(`Failed to removeUserExp: ${err.message}`);
  }
};

// SAVED-JOBS
exports.getSavedJobs = async (req) => {
  try {
    const user = await User.findById(req.user._id).select("savedJobs");

    // err: user not found      
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user.savedJobs;
  } catch (error) {
    throw new Error(`Failed to getSavedJobs: ${error.message}`);
  }
};

exports.saveJob = async (req) => {
  try {
    const { jobToSave } = req.body;
    // val jobId
    if (!isValidId(jobToSave._id)) {
      const error = new Error("Invalid jobId");
      error.statusCode = 400;
      throw error;
    }

    // Check required fields
    const requiredFields = ['_id', 'title', 'due']; // Add other required fields
    for (const field of requiredFields) {
      if (!jobToSave[field]) {
        const error = new Error(`Missing required field: ${field}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      // { $addToSet: { savedJobs: jobToSave } },
      {
        $addToSet: {
          savedJobs: {
            _id: jobToSave._id,
            title: jobToSave.title,
            due: jobToSave.due
          }
        }
      },
      { new: true }
    ).select("savedJobs");
    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user.savedJobs;
  } catch (error) {
    throw new Error(`Failed to saveJob: ${error.message}`);
  }
};

exports.unsaveJob = async (req) => {
  try {
    const { jobId } = req.body;
    // val jobId
    if (!isValidId(jobId)) {
      const error = new Error("Invalid jobId");
      error.statusCode = 500;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      // { $pull: { skills: skillId } },
      { $pull: { savedJobs: { _id: jobId } } },
      { new: true }
    ).select("savedJobs");
    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    return user.savedJobs;
  } catch (err) {
    throw new Error(`Failed to unsaveJob: ${err.message}`);
  }
};

// APPLIED-JOBS
exports.getAppliedJobs = async (req) => {
  try {
    const user = await User.findById(req.user._id).select("appliedJobs");

    // err: user not found      
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user.savedJobs;
  } catch (error) {
    throw new Error(`Failed to getAppliedJobs: ${error.message}`);
  }
};

exports.applyJob = async (req) => {
  try {
    const { jobToApply } = req.body;
    // val jobId
    if (!isValidId(jobToApply._id)) {
      const error = new Error("Invalid jobId");
      error.statusCode = 500;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { appliedJobs: jobToApply } },
      { new: true }
    ).select("appliedJobs");
    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user.appliedJobs;
  } catch (error) {
    throw new Error(`Failed to applyJob: ${error.message}`);
  }
};

exports.withdrawApp = async (req) => {
  try {
    const { jobId } = req.body;
    // val jobId
    if (!isValidId(jobId)) {
      const error = new Error("Invalid jobId");
      error.statusCode = 500;
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      // { $pull: { skills: skillId } },
      { $pull: { appliedJobs: { _id: jobId } } },
      { new: true }
    ).select("appliedJobs");

    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    return user.appliedJobs;
  } catch (err) {
    throw new Error(`Failed to withdrawApp: ${err.message}`);
  }
};

// # Validation
// function validateSkill(skill) {
//   if (!skill || typeof skill !== 'object') return false;
//   const requiredKeys = ['_id', 'title'];
//   for (const key of requiredKeys) {
//     if (!(key in skill)) return false;
//   }
//   return true;
// }

// function validateExp(exp) {
//   if (!exp || typeof exp !== 'object') return false;
//   const requiredKeys = ['title', 'description', 'duration'];
//   for (const key of requiredKeys) {
//     if (!(key in skill)) return false;
//   }
//   return true;
// }