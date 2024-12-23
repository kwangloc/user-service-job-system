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


// RECRUITER
exports.addPostedJobRecruiter = async (msg) => {
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

exports.delPostedJobRecruiter = async (msg) => {
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

exports.removeSavedJobCandidate = async (msg) => {
  try {
    const user = await User.findByIdAndUpdate(
        msg.userId,
      // { $pull: { skills: skillId } },
      { $pull: { savedJobs: { _id: msg.job._id } } },
    ).select("_id savedJobs");
    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    
    return {
      userId: user._id,
      jobId: msg.job._id
  };
  } catch (err) {
    throw new Error(`Failed to removeSavedJobCandidate: ${err.message}`);
  }
};

exports.addAppliedJobCandidate = async (msg) => {
  try {
      const user = await User.findByIdAndUpdate(
          msg.userId,
          {
              $addToSet: { appliedJobs: msg.job }
          },
          { new: true }
      ).select("_id appliedJobs");

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
    throw new Error(`Failed to addAppliedJobCandidate: ${error.message}`);
  }
};

exports.cancelAppliedJobCandidate = async (msg) => {
  try {
    const user = await User.findByIdAndUpdate(
        msg.userId,
      // { $pull: { skills: skillId } },
      { $pull: { appliedJobs: { _id: msg.job._id } } },
    ).select("_id appliedJobs");
    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    
    return {
      userId: user._id,
      jobId: msg.job._id
  };
  } catch (err) {
    throw new Error(`Failed to cancelAppliedJobCandidate: ${err.message}`);
  }
};

exports.editAppliedJobCandidate = async (msg) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: msg.userId, "appliedJobs._id": msg.job._id },
      { $set: { "appliedJobs.$.status":  msg.job.status } },
      { new: true }
    ).select("_id appliedJobs");

    // err: user not found
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    
    return {
      userId: user._id,
      jobId: msg.job._id
  };
  } catch (err) {
    throw new Error(`Failed to cancelAppliedJobCandidate: ${err.message}`);
  }
};

// Company

