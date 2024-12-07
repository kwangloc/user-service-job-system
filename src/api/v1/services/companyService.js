const { publishEvent } = require('../../../rabbitmq/rabbitmqPublisher');
//
const bcrypt = require('bcrypt'); // hashing
const axios = require('axios');

const { Company, validateCompany} = require("../models/companyModel");
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
exports.getAllCompanies = async (req) => {
  return Company.find().sort("-name");
};

exports.getCompany = async (req) => {
  const { companyId } = req.params;
  // invalid id
  if (!isValidId(companyId)) {
    const error = new Error("Invalid companyId");
    error.statusCode = 500;
    throw error;
  }
  // find by id
  const company = await Company.findById(companyId).select("-password");
  // not found id
  if (!company) {
    const error = new Error("company not found");
    error.statusCode = 404;
    throw error;
  }
  return company;
};

exports.createCompany = async (req) => {
  // 1. validate req.body
  const { error } = validateCompany(req.body);
  if (error) throw new Error(JSON.stringify(error.details));
  try {
    // 2. check existing email
    let existingCompany = await Company.findOne({ email: req.body.email });
    if (existingCompany) {
      const duplicateError = new Error("A company with this email already exists");
      duplicateError.statusCode = 400; // Conflict
      throw duplicateError;
    }
    // 3. create the company
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newCompany = new Company({
      ...req.body,
      password: hashedPassword
    });

    console.log("newCompany:", newCompany);

    const companySend2AuthSer = {
      userId: newCompany._id ,
      email: newCompany.email ,
      password: newCompany.password ,
      name: newCompany.name ,
      role: "company",
      createdBy: "UserService"
    }

    // Send company to Auth Service and get jwt  
    // const response = await axios.post('http://localhost:3010/api/account', companySend2AuthSer);
    const response = await axios.post(process.env.AUTH_SERVICE_NEW_ACCOUNT, companySend2AuthSer);
    console.log("!!!!!!!!!!!! response from auth service !!!!!!!!!!");
    const token = response.headers['authorization']; 
    const responseBody = response.data;
    console.log("token: ", token);
    console.log("res.body: ", responseBody);
    console.log("JWT Token:", token);

    const savedCompany = await newCompany.save();
    console.log("savedCompany:", savedCompany);

    return {
      token,
      message: responseBody.message,
      // account: responseBody.account
      company: {
        _id: savedCompany._id,
        name: savedCompany.name,
        email: savedCompany.email,
        role: "company" 
      }
    };
    
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(`Failed to create company, couldn't connect to AuthService!: ${err.message}`);
    }
    throw new Error(`Failed to create company: ${err.message}`);
  }
};

exports.updateCompany = async (req) => {
  try {
    
    const updateFields = {};
    const updateKeys = ["name", "gender", "phone", "dateOfBirth"];

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
    const company = await Company.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    if (!company) {
      const error = new Error("Company not found");
      error.statusCode = 404;
      throw error;
    }
    // rabbitmq
    if (updateFields.hasOwnProperty("name") || updateFields.hasOwnProperty("password")) {
      const companyToPublish = {userId: req.user._id}; // Note message structure
      const keysToPublish = ["name", , "password"];

      keysToPublish.forEach((key) => {
        if (updateFields.hasOwnProperty(key)) {
          companyToPublish[key] = updateFields[key]
        }
      });
      await publishEvent('user.account.updated', companyToPublish); // Note message structure
    }

    // response
    return company;
  } catch (err) {
    throw new Error(`Failed to update company: ${err.message}`);
  }
};

exports.deleteCompany = async (req) => {
  const { companyId } = req.params;
  // val companyId
  if (!isValidId(companyId)) {
    const error = new Error("Invalid companyId");
    error.statusCode = 500;
    throw error;
  }

  let result = await Company.findByIdAndDelete(companyId);
  try {
    if (!result) {
      const error = new Error("Company not found");
      error.statusCode = 404;
      throw error;
    }
    // rabbitmq
    const companyToPublish = { userId: companyId }; // RabbitMQ message structure
    await publishEvent('user.account.deleted', companyToPublish);  
  } catch (err) {
    throw new Error(`Failed to delete company: ${err.message}`);
  }
  return result;
};

// POSTED-JOBS

exports.addPostedJob = async (req) => {
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

    const company = await Company.findByIdAndUpdate(
      req.user._id,
      // { $addToSet: { savedJobs: jobToSave } },
      {
        $addToSet: {
          postedJobs: {
            _id: jobToSave._id,
            title: jobToSave.title,
            due: jobToSave.due
          }
        }
      },
      { new: true }
    ).select("postedJobs");
    // err: company not found
    if (!company) {
      const error = new Error("Company not found");
      error.statusCode = 404;
      throw error;
    }

    return company;
  } catch (error) {
    throw new Error(`Failed to saveJob: ${error.message}`);
  }
};

exports.getPostedJobs = async (req) => {
  try {
    const company = await Company.findById(req.user._id).select("postedJobs");

    // err: user not found      
    if (!company) {
      const error = new Error("Company not found");
      error.statusCode = 404;
      throw error;
    }

    return company.postedJobs;
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

    const company = await Company.findByIdAndUpdate(
      req.user._id,
      // { $pull: { skills: skillId } },
      { $pull: { postedJobs: { _id: jobId } } },
      { new: true }
    ).select("postedJobs");
    // err: company not found
    if (!company) {
      const error = new Error("Company not found");
      error.statusCode = 404;
      throw error;
    }
    return company;
  } catch (err) {
    throw new Error(`Failed to unsaveJob: ${err.message}`);
  }
};


