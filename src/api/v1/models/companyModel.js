const Joi = require("joi");
const mongoose = require('mongoose');

// sub schema
const recruiterSchema = new mongoose.Schema({
    recruiterId: mongoose.Schema.Types.ObjectId,
    recruiterName: {
        type: String,
        required: true
    }
})

const jobSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    due: {
        type: Date,
        required: true
    },
    salary: {
        type: String
    },
    address: {
        type: String
    },
    numOfApp: {
        type: Number
    },
    postedBy: {
        type: recruiterSchema,
    }
})

// db schema
const companySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlengh: 50
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlengh: 1024 // hash password
    },
    introduction: {
        type: String,
        default: ''
    },
    address: {
        type: [String],
    },
    website: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    postedJobs: {
        type: [jobSchema]
    }
});

// model
const Company = new mongoose.model('Company', companySchema);

// Functions
function validateCompany(company) { 
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().min(2).max(255).required().email(), // plain password
        password: Joi.string().min(6).max(1024).required(),
        address: Joi.string().min(2).max(50).required(),
        website: Joi.string().min(2).max(50).required(),
        phone: Joi.string().min(2).max(50).required(),
        category: Joi.string().min(2).max(50).required()
    });
    return schema.validate(company);
}

const recruiterValidationSchema = Joi.object({
    recruiterId: Joi.string().hex().length(24).required(),
    recruiterName: Joi.string().required()
});

function validateJob(exp) {
    const schema = Joi.object({
        jobId: Joi.string().hex().length(24).required(),
        title: Joi.string().required(),
        due: Joi.date().required(),
        salary: Joi.string().required(),
        address: Joi.string().required(),
        numOfApp: Joi.number().required(),
        postedBy: recruiterValidationSchema.required()
    });
    return schema.validate(exp);
}

module.exports = {
    companySchema,
    Company,
    validateCompany,
    validateJob
};