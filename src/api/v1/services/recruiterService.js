const { publishEvent } = require('../../../rabbitmq/rabbitmqPublisher');
//
const bcrypt = require('bcrypt'); // hashing
const axios = require('axios');

const { Recruiter, validateRecruiter, validateJob} = require("../models/recruiterModel");
const { Company, validateCompany} = require("../models/companyModel");
const { isValidId, authUser } = require("../validations/validators");

// For testing
exports.test_1 = async (req) => {
  try {
    // const recruiter = await Recruiter.findByIdAndUpdate(
    //     { _id: req.body.recruiterId, "postedJobs._id": req.body.job._id },
    //     { $set: { "postedJobs":  req.body.job } },
    //     { new: true }
    // ).select("_id postedJobs");

    const recruiterId = req.body.recruiterId;
    const jobId = req.body.job._id;
    const updatedJob = req.body.job;

    const recruiter = await Recruiter.findOneAndUpdate(
      { _id: recruiterId, "postedJobs._id": jobId },
      { $set: { "postedJobs.$": updatedJob } },
      { new: true }
    ).select("_id postedJobs");

    // err: recruiter not found
    if (!recruiter) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }

    return {
        recruiterId: recruiter._id,
        jobId: req.body.job._id
    };
  } catch (error) {
    return `Failed test_1: ${error.message}`;
  }
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

exports.getRecruitersByCompany = async (req) => {
  const { companyId } = req.params;

  if (req.user.role !== 'admin' && companyId !== req.user._id.toString()) {
    const error = new Error("Access denied.");
    error.statusCode = 403;
    throw error;
  }

  // invalid id
  if (!isValidId(companyId)) {
    const error = new Error("Invalid companyId");
    error.statusCode = 500;
    throw error;
  }
  // find by id
  const recruiters = await Recruiter.find({ "company._id": companyId }).select("-password");

  // not found id
  if (!recruiters) {
    const error = new Error("recruiters not found");
    error.statusCode = 404;
    throw error;
  }
  return recruiters;
};

exports.createRecruiter = async (req) => {
  const company = await Company.findById(req.user._id);
  
  if (!company) {
    const error = new Error("Company not found");
    error.statusCode = 404;
    throw error;
  }

  // 1. validate req.body
  const { recruiter } = req.body;
  const { error } = validateRecruiter(recruiter);
  if (error) throw new Error(JSON.stringify(error.details));
  try {
    // 2. check existing email
    let existingRecruiter = await Recruiter.findOne({ email: recruiter.email });
    if (existingRecruiter) {
      const duplicateError = new Error("Recruiter with this email already exists");
      duplicateError.statusCode = 400; // Conflict
      throw duplicateError;
    }
    // 3. create the recruiter
    recruiter.company = {
      _id: company._id,
      companyName: company.name
    }
    console.log("recruiter:", recruiter);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(recruiter.password, salt);
    const newRecruiter = new Recruiter({
      ...recruiter,
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
    let recruiterId = req.user.role === 'admin' ? req.params.recruiterId : req.user._id;
    
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
      recruiterId,
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


