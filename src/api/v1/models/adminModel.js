const Joi = require("joi");
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // json web token
const config = require('config'); // configurations
//const { objectIdValidator } = require('../validations/validators'); // To check objectId of sub document

// DB schema

const adminSchema = mongoose.Schema({
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
    }
});

// gen jwt
adminSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, name: this.name, isAdmin: true}, config.get('jwtPrivateKey'));
    return token;
}

// model
const Admin = new mongoose.model('Admin', adminSchema);

// Functions
function validateAdmin(admin) {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(6).max(1024).required(),
        email: Joi.string().min(2).max(255).required().email(), // plain password
        location: Joi.string().min(1).required()
    });
    return schema.validate(admin);;
}

module.exports = {
    adminSchema,
    Admin,
    validateAdmin
};