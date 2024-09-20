const config = require('config'); // env var

module.exports = function() {
    if (!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
    } else {
        console.log('jwtPrivateKey:', config.get('jwtPrivateKey'));
    }
}