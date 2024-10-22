const jwt = require('jsonwebtoken');
const config = require('config');

function auth(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied! No token provided.');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        req.user = decoded;
        console.log(req.user);
        next();
    } catch (error) {
        res.status(400).send('Access denied. Invalid token.');
    }
} 

module.exports = auth;