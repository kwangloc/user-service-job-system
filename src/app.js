const logger = require('./middleware/logger');
require('./startup/logging.js')(logger); // Logging
const express = require('express');
const app = express();

require('./startup/config.js')(); // Config
require('./startup/routes.js')(app); // Add routes handlers
require('./startup/db.js')(); // Connect to DB

// Test uncaughtException
// throw new Error('Errors during startup by uncaughtException');

// Test unhandledRejection
// const p = Promise.reject(new Error('Errors during startup by unhandledRejection'));
// p.then(() => console.log('Done'));

// Environment
console.log(`app: ${app.get('env')}`); // dev env by default

// PORT
const port = process.env.PORT || 3000;
app.listen(port, () => logger.info('Listening on port', port));