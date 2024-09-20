const Joi = require("joi"); 
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken'); // json web token
const config = require('config'); // configurations

// DB schema
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlengh: 50
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlengh: 1024 // hash password
    },
    skills: {
        type: Array,
    },
    experience: {
        type: Array,
    },
    skills: {
        type: Array,
    },
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({_id: this._id, isAdmin: this.isAdmin}, config.get('jwtPrivateKey'));
    return token;
}
// model
const User = new mongoose.model('User', userSchema);

// Functions
function validateUser(user) {
    // joi schema for request
    const schema = Joi.object({ 
        name: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(6).max(1024).required(),
        email: Joi.string().min(2).max(255).required().email() // plain password
    });
    return schema.validate(user);;
}

module.exports = {
    userSchema,
    User,
    validateUser
};