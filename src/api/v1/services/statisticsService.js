const { publishEvent } = require('../../../rabbitmq/rabbitmqPublisher');

const { Recruiter, validateRecruiter} = require("../models/recruiterModel");
const { Company, validateCompany} = require("../models/companyModel");
const { User, validateUser} = require("../models/userModel");
const { City, validateCity} = require("../models/cityModel");
const { isValidId, authUser } = require("../validations/validators");


exports.growth = async (req) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Candidates
  const users = await User.find({});
  const totalUsers = users.length;
  
  // const usersCreatedThisMonth = users.filter(user => user._id.getTimestamp() >= startOfMonth).length;
  const usersCreatedToday = users.filter(user => user._id.getTimestamp() >= today).length;
  const usersCreatedEachMonth = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    const count = users.filter(user => user._id.getTimestamp() >= start && user._id.getTimestamp() < end).length;
    usersCreatedEachMonth.push({ month: start.getMonth() + 1, year: start.getFullYear(), count });
  }

  // Recruiters
  const recruiters = await Recruiter.find({});
  const totalRecruiters = recruiters.length;

  // const recruitersCreatedThisMonth = recruiters.filter(user => user._id.getTimestamp() >= startOfMonth).length;
  const recruitersCreatedToday = recruiters.filter(user => user._id.getTimestamp() >= today).length;
  const recruitersCreatedEachMonth = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const end = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
    const count = recruiters.filter(recruiter => recruiter._id.getTimestamp() >= start && recruiter._id.getTimestamp() < end).length;
    recruitersCreatedEachMonth.push({ month: start.getMonth() + 1, year: start.getFullYear(), count });
  }

  // Companies
  const companines = await Company.find({});
  const totalCompanies = companines.length;

  return {
    // FOR USERS
    users: {
      totalUsers,
      // usersCreatedThisMonth,
      usersCreatedToday,
      usersCreatedEachMonth,
    },
    // FOR RECRUITERS
    recruiters: {
      totalRecruiters,
      // recruitersCreatedThisMonth,
      recruitersCreatedToday,
      recruitersCreatedEachMonth
    },
    // FOR COMPANIES
    companies: {
      totalCompanies
    }
  };
};

exports.demographic = async (req) => {
  const result = await User.aggregate([
    {
      $group: {
        _id: "$location", // Group by the 'location' field
        count: { $sum: 1 } // Count the number of users in each location
      }
    },
    {
      $sort: { count: -1 } // Optional: Sort by count in descending order
    }
  ]);

  // Format the result
  return result.map(item => ({
    location: item._id || "Unknown", // Handle empty or null locations
    count: item.count
  }));
};

exports.userTracking = async (req) => {
  return User.find().sort("-name");
};

exports.getCities = async (req) => {
  return City.find().sort("index");
};


