const config = require('config'); // env var

module.exports = function() {
    // if (!config.get('jwtPrivateKey')) {
    //     throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    // } else {
    //     console.log('jwtPrivateKey:', config.get('jwtPrivateKey'));
    // }

    if (!process.env.JWT_PRIVATE_KEY) {
        throw new Error('FATAL ERROR: JWT_PRIVATE_KEY is not defined.');
    } else {
        console.log('JWT_PRIVATE_KEY:', process.env.JWT_PRIVATE_KEY);
    }
}