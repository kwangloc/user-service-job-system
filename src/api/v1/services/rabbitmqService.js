const { publishEvent } = require('../../../rabbitmq/rabbitmqPublisher');
//
const bcrypt = require('bcrypt'); // hashing
const axios = require('axios');

const { Recruiter, validateRecruiter, validateJob} = require("../models/recruiterModel");
const { User, validateUser } = require("../models/userModel");
const { isValidId, authUser } = require("../validations/validators");

// For testing
exports.test_1 = async (req) => {
  return "test_1";
};

// CANDIDATE
exports.addSavedJobCandidate = async (msg) => {
    try {
        const user = await User.findByIdAndUpdate(
            msg.userId,
            {
                $addToSet: { savedJobs: msg.job }
            },
            { new: true }
        ).select("_id savedJobs");

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        return {
            userId: user._id,
            jobId: msg.job._id
        };
    } catch (error) {
      throw new Error(`Failed to addPostedJob: ${error.message}`);
    }
};

// RECRUITER
exports.addPostedJobRecruter = async (msg) => {
  try {
    const recruiter = await Recruiter.findByIdAndUpdate(
        msg.recruiterId,
        {
          $addToSet: { postedJobs: msg.job }
        },
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
        jobId: msg.job._id
    };
  } catch (error) {
    throw new Error(`Failed to addPostedJob: ${error.message}`);
  }
};

exports.delPostedJobRecruter = async (msg) => {
  try {
    const recruiter = await Recruiter.findByIdAndUpdate(
        msg.recruiterId,
      // { $pull: { skills: skillId } },
      { $pull: { postedJobs: { _id: msg.job._id } } },
    ).select("_id postedJobs");
    // err: recruiter not found
    if (!recruiter) {
      const error = new Error("Recruiter not found");
      error.statusCode = 404;
      throw error;
    }
    return {
        recruiterId: recruiter._id,
        jobId: msg.job._id
    };
  } catch (err) {
    throw new Error(`Failed to unsaveJob: ${err.message}`);
  }
};

// Company

