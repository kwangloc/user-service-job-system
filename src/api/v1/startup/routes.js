const express = require('express');

const users = require('../routes/userRoute');
// const auth = require('../routes/auth');
const error = require('../middlewares/error');

module.exports = function (app) {
    app.use(express.json()); // middleware
    // Built-in Modules (routes handlers)
    app.use('/api/users', users);
    // Error handler
    app.use(error);
}