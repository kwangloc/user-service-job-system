const Joi = require("joi");
const mongoose = require('mongoose');

// DB schema
const jobSchema = new mongoose.Schema({
    jobId: mongoose.Schema.Types.ObjectId,
    title: {
        type: String,
        required: true
    },
    due: {
        type: Date,
        required: true
    }
})

const companySchema = new mongoose.Schema({
    companyId: mongoose.Schema.Types.ObjectId,
    companyName: {
        type: String,
        required: true
    }
})

const recruiterSchema = mongoose.Schema({
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
    gender: {
        type: String,
        enum: ["male", "female", "prefer not to say"],
        default: "male",  
        required: true
    },
    phone: {
        type: String,
        default: ''
    },
    dateOfBirth: {
        type: Date,
        default: null
    },
    company: {
        type: companySchema,
        required: true
        // ref: "company" 
    },
    postedJobs: {
        type: [jobSchema]
    }
});

// model
const Recruiter = new mongoose.model('Recruiter', recruiterSchema);

// Functions
const companyValidationSchema = Joi.object({
    companyId: Joi.string().hex().length(24).required(),
    companyName: Joi.string().required()
});

function validateRecruiter(recruiter) { 
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(6).max(1024).required(), // plain password
        email: Joi.string().min(2).max(255).required().email(),
        company: companyValidationSchema.required()
    });
    return schema.validate(recruiter);
}

function validateJob(exp) {
    const schema = Joi.object({
        jobId: Joi.string().hex().length(24).required(),
        title: Joi.string().required(),
        due: Joi.date().required()
    });
    return schema.validate(exp);
}

module.exports = {
    recruiterSchema,
    Recruiter,
    validateRecruiter,
    validateJob
};