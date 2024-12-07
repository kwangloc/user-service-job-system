const Joi = require("joi");
const mongoose = require('mongoose');

// sub schema
const recruiterSchema = new mongoose.Schema({
    id: Joi.string().hex().length(24),
    name: {
        type: String,
        required: true
    }
})

const jobSchema = new mongoose.Schema({
    id: Joi.string().hex().length(24),
    title: {
        type: String,
        required: true
    },
    due: {
        type: Date,
        required: true
    },
    postedBy: {
        type: recruiterSchema,
        required: true
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

module.exports = {
    companySchema,
    Company,
    validateCompany
};