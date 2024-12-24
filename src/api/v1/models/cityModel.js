const Joi = require("joi");
const mongoose = require('mongoose');
// const jwt = require('jsonwebtoken'); // json web token
// const config = require('config'); // configurations

// DB schema
const citySchema = mongoose.Schema({
    index: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true,
        unique: true
    }
});

// model
const City = new mongoose.model('City', citySchema);

// Functions
function validateCity(City) {
    const schema = Joi.object({
        index: Joi.number().min(2).max(50).required(),
        city: Joi.string().min(1).required()
    });
    return schema.validate(City);;
}

module.exports = {
    citySchema,
    City,
    validateCity
};