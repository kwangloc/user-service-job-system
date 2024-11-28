const express = require('express');

const userRoute = require('../routes/userRoute');
// const recruiterRoute = require('../routes/recruiterRoute');
// const companyRoute = require('../routes/companyRoute');
// const auth = require('../routes/auth');
const error = require('../middlewares/error');

module.exports = function (app) {
    // Middleware
    app.use(express.json()); 

    // Built-in Modules (routes handlers)
    app.use('/api/user', userRoute);
    // app.use('/api/recruiter', recruiterRoute);
    // app.use('/api/company', companyRoute);

    // Error handler
    app.use(error);
}