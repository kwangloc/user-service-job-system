const mongoose = require('mongoose');
const Joi = require("joi"); // for validating req

const objectIdValidator = Joi.string().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
    }
    return value;
}, 'ObjectId validation');

module.exports = {objectIdValidator};