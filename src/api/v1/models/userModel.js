const Joi = require("joi");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // json web token
//const config = require('config'); // configurations
//const { objectIdValidator } = require('../validations/validators'); // To check objectId of sub document

// DB schema
const companySchema = new mongoose.Schema({
    _id: Joi.string().hex().length(24),
    name: String
})

const jobSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    company: companySchema,
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
    resume: {
        type: String,
        default: ''
    },
    dateSubmit: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ["Not submit", "Submitted", "Under Review", "Shortlisted", "Rejected", "Hired"]
    }
})

const skillSchema = mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true
    }
})

const expSchema = mongoose.Schema({
    // _id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true
    // },
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

const eduSchema = mongoose.Schema({
    // _id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     required: true
    // },
    school: {
        type: String,
        required: true
    },
    major: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
})

const userSchema = mongoose.Schema({
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
        enum: ["Male", "Female", "Prefer not to say"],
        default: "Male",  
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
    address: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: ''
    },
    skills: {
        type: [skillSchema],
    },
    experience: {
        type: [expSchema],
    },
    education: {
        type: [eduSchema],
    },
    savedJobs: {
        type: [jobSchema]
    },
    appliedJobs: {
        type: [jobSchema]
    }
});

// gen jwt
// userSchema.methods.generateAuthToken = function() {
//     // const token = jwt.sign({_id: this._id, name: this.name, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
//     const token = jwt.sign({_id: this._id, name: this.name, isAdmin: this.isAdmin}, process.env.JWT_PRIVATE_KEY);
//     return token;
// }

// model
const User = new mongoose.model('User', userSchema);

// Functions
function validateUser(user) { // for registration
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(6).max(1024).required(),
        email: Joi.string().min(2).max(255).required().email() // plain password
    });
    return schema.validate(user);
}

function validateSkill(skill) {
    const schema = Joi.object({
        _id: Joi.string().required(),
        title: Joi.string().min(2).max(1024).required()
    });
    return schema.validate(skill);
}

//
const companyValidationSchema = Joi.object({
    _id: Joi.string().hex().length(24).required(),
    name: Joi.string().required()
});
  
// Job Schema Definition

function validateJob(job) {
    const schema = Joi.object({
        _id: Joi.string().hex().length(24).required(),
        company: companyValidationSchema.required(),
        title: Joi.string().required(),
        address: Joi.string().required(),
        dateStart: Joi.string().required(),
        dateDue: Joi.string().required(),
        resume: Joi.string().required(),
        dateSubmit: Joi.string().required(),
        status: Joi.string().valid('Not submmit', 'Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Hired')
    });
    return schema.validate(job);
}

function validateExp(exp) {
    const schema = Joi.object({
        company: Joi.string().min(2).max(255).required(),
        position: Joi.string().min(2).max(255).required(),
        duration: Joi.string().min(2).max(255).required(), 
        description: Joi.string().min(2).max(1024).required(),
    });
    return schema.validate(exp);
}

function validateEdu(edu) {
    const schema = Joi.object({
        school: Joi.string().min(2).max(255).required(),
        major: Joi.string().min(2).max(1024).required(),
        duration: Joi.string().min(2).max(255).required(),
        description: Joi.string().min(2).max(1024).required(),
    });
    return schema.validate(edu);
}

module.exports = {
    userSchema,
    User,
    validateJob,
    validateUser,
    validateSkill,
    validateExp,
    validateEdu
};
