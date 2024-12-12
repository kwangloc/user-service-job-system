const { publishEvent } = require('../../../rabbitmq/rabbitmqPublisher');
//
const bcrypt = require('bcrypt'); // hashing
const axios = require('axios');

const { Recruiter, validateRecruiter, validateJob} = require("../models/recruiterModel");
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

// Profile
exports.getAllRecruiters = async (req) => {
  return Recruiter.find().sort("-name");
};

exports.getRecruiter = async (req) => {
  const { recruiterId } = req.params;
  // invalid id
  if (!isValidId(recruiterId)) {
    const error = new Error("Invalid recruiterId");
    error.statusCode = 500;
    throw error;
  }
  // find by id
  const recruiter = await Recruiter.findById(recruiterId).select("-password");
  // not found id
  if (!recruiter) {
    const error = new Error("recruiter not found");
    error.statusCode = 404;
    throw error;
  }
  return recruiter;
};

exports.createRecruiter = async (req) => {
  // 1. validate req.body
  const { error } = validateRecruiter(req.body);
  if (error) throw new Error(JSON.stringify(error.details));
  try {
    // 2. check existing email
    let existingRecruiter = await Recruiter.findOne({ email: req.body.email });
    if (existingRecruiter) {
      const duplicateError = new Error("A recruiter with this email already exists");
      duplicateError.statusCode = 400; // Conflict
      throw duplicateError;
    }
    // 3. create the recruiter
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newRecruiter = new Recruiter({
      ...req.body,
      password: hashedPassword
    });

    console.log("newRecruiter:", newRecruiter);

    const recruiterSend2AuthSer = {
      userId: newRecruiter._id ,
      email: newRecruiter.email ,
      password: newRecruiter.password ,
      name: newRecruiter.name ,
      role: "recruiter",
      createdBy: "UserService"
    }

    // Send recruiter to Auth Service and get jwt  
    // const response = await axios.post('http://localhost:3010/api/account', recruiterSend2AuthSer);
    const response = await axios.post(process.env.AUTH_SERVICE_NEW_ACCOUNT, recruiterSend2AuthSer);
    console.log("!!!!!!!!!!!! response from auth service !!!!!!!!!!");
    const token = response.headers['authorization']; 
    const responseBody = response.data;
    console.log("token: ", token);
    console.log("res.body: ", responseBody);
    console.log("JWT Token:", token);

    const savedRecruiter = await newRecruiter.save();
    console.log("savedRecruiter:", savedRecruiter);

    return {
      token,
      message: responseBody.message,
      // account: responseBody.account
      recruiter: {
        _id: savedRecruiter._id,
        name: savedRecruiter.name,
        email: savedRecruiter.email,
        role: "recruiter" 
      }
    };
    
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(`Failed to create recruiter, couldn't connect to AuthService!: ${err.message}`);
    }
    throw new Error(`Failed to create recruiter: ${err.message}`);
  }
};

exports.updateRecruiter = async (req) => {
  try {
    
    const updateFields = {};
    const updateKeys = ["name", "gender", "phone", "dateOfBirth", "company"];

    updateKeys.forEach((key) => {
      if (req.body[key]) {
        updateFields[key] = req.body[key];
      }
    });

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      updateFields.password = hashedPassword;
    } 

    // find and update
    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    if (!recruiter) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }
    // rabbitmq
    if (updateFields.hasOwnProperty("name") || updateFields.hasOwnProperty("password")) {
      const recruiterToPublish = {userId: req.user._id}; // Note message structure
      const keysToPublish = ["name", , "password"];

      keysToPublish.forEach((key) => {
        if (updateFields.hasOwnProperty(key)) {
          recruiterToPublish[key] = updateFields[key]
        }
      });
      await publishEvent('user.account.updated', recruiterToPublish); // Note message structure
    }

    // response
    return recruiter;
  } catch (err) {
    throw new Error(`Failed to update recruiter: ${err.message}`);
  }
};

exports.deleteRecruiter = async (req) => {
  const { recruiterId } = req.params;
  // val recruiterId
  if (!isValidId(recruiterId)) {
    const error = new Error("Invalid recruiterId");
    error.statusCode = 500;
    throw error;
  }

  let result = await Recruiter.findByIdAndDelete(recruiterId);
  try {
    if (!result) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }
    // rabbitmq
    const recruiterToPublish = { userId: recruiterId }; // RabbitMQ message structure
    await publishEvent('user.account.deleted', recruiterToPublish);  
  } catch (err) {
    throw new Error(`Failed to delete recruiter: ${err.message}`);
  }
  return result;
};

// POSTED-JOBS

exports.addPostedJob = async (req) => {
  try {
    const { job } = req.body;
    // val jobId
    if (!isValidId(job._id)) {
      const error = new Error("Invalid jobId");
      error.statusCode = 400;
      throw error;
    }

    const { error } = validateJob(job);
    if ( error ) throw new Error(JSON.stringify(error.details));

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user._id,
      {
        $addToSet: {
          postedJobs: job
        }
      },
      { new: true }
    ).select("postedJobs");
    // err: recruiter not found
    if (!recruiter) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }

    return recruiter;
  } catch (error) {
    throw new Error(`Failed to saveJob: ${error.message}`);
  }
};

exports.getPostedJobs = async (req) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id).select("postedJobs");

    // err: user not found      
    if (!recruiter) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }

    return recruiter.postedJobs;
  } catch (error) {
    throw new Error(`Failed to getPostedJobs: ${error.message}`);
  }
};

exports.delPostedJob = async (req) => {
  try {
    const { jobId } = req.body;
    // val jobId
    if (!isValidId(jobId)) {
      const error = new Error("Invalid jobId");
      error.statusCode = 500;
      throw error;
    }

    const recruiter = await Recruiter.findByIdAndUpdate(
      req.user._id,
      // { $pull: { skills: skillId } },
      { $pull: { postedJobs: { _id: jobId } } },
      { new: true }
    ).select("postedJobs");
    // err: recruiter not found
    if (!recruiter) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }
    return recruiter;
  } catch (err) {
    throw new Error(`Failed to unsaveJob: ${err.message}`);
  }
};


