const Joi = require("joi");
const mongoose = require('mongoose');

// DB schema
const jobSchema = new mongoose.Schema({
    id: Joi.string().hex().length(24),
    title: {
        type: String,
        required: true
    },
    due: {
        type: Date,
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
        type: mongoose.Schema.Types.ObjectId 
        // ref: "Restaurant" 
    },
    isManager: {
        type: Boolean,
        default: true
    },
    postedJobs: {
        type: [jobSchema]
    }
});

// model
const Recruiter = new mongoose.model('Recruiter', recruiterSchema);

// Functions
function validateRecruiter(recruiter) { 
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(6).max(1024).required(),
        email: Joi.string().min(2).max(255).required().email() // plain password
    });
    return schema.validate(recruiter);
}

module.exports = {
    recruiterSchema,
    Recruiter,
    validateRecruiter
};