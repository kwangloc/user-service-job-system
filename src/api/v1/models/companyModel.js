const Joi = require("joi");
const mongoose = require('mongoose');

// sub schema
const recruiterSchema = new mongoose.Schema({
    recruiterId: Joi.string().hex().length(24),
    recruiterName: {
        type: String,
        required: true
    }
})

const jobSchema = new mongoose.Schema({
    jobId: Joi.string().hex().length(24),
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
    city: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    phone: {
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
        password: Joi.string().min(6).max(1024).required(),
        email: Joi.string().min(2).max(255).required().email() // plain password
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