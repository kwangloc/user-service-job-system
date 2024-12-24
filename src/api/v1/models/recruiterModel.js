const Joi = require("joi");
const mongoose = require('mongoose');

// DB schema
const jobSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    dateStart: {
        type: String,
        required: true
    },
    dateDue: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Open soon", "Opening", "Closed"]
    }
})

const companySchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
        type: String,
        default: null
    },
    profileImage: {
        type: String,
        default: ''
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
        email: Joi.string().min(2).max(255).required().email()
        // company: companyValidationSchema.required()
    });
    return schema.validate(recruiter);
}

function validateJob(job) {
    const schema = Joi.object({
        _id: Joi.string().hex().length(24).required(),
        title: Joi.string().required(),
        address: Joi.string().required(),
        dateStart: Joi.string().required(),
        dateDue: Joi.string().required(),
        status: Joi.string().required()
    });
    return schema.validate(job);
}

module.exports = {
    recruiterSchema,
    Recruiter,
    validateRecruiter,
    validateJob
};