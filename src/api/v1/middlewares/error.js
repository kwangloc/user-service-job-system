const logger = require('./logger');

// This function will catch errors occur on the Request Processing Pipeline (express)

module.exports = function (err, req, res, next) {
    // Send response
    console.log('**************');
    console.log(err);
    // Log the exception
    logger.error('Error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Sorry! An error occurred!',
        details: err.message
    });
}