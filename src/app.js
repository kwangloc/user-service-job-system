require('dotenv').config();

const express = require('express');
const cors = require('cors');


const logger = require('./api/v1/middlewares/logger');
require('./api/v1/startup/logging.js')(logger); // Logging

// Middlewares
const app = express();
// app.use(cors()); 
app.use(cors({
    origin: '*', // Hoặc liệt kê cụ thể các domain: ['https://frontend.com', 'https://mobileapp.com']
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers được phép gửi
    exposedHeaders: ['Authorization', 'X-Custom-Header', 'X-Total-Count'] // Headers cho phép frontend đọc
}));

// RabbitMQ
const { setupRabbitMQ } = require('./rabbitmq/rabbitmqSetup');
const { consumeJobEvents } = require('./rabbitmq/rabbitmqConsumer');

require('./api/v1/startup/config.js')(); // Config
require('./api/v1/startup/routes.js')(app); // Add routes handlers
require('./api/v1/startup/db.js')(); // Connect to DB

// Environment
console.log(`app: ${app.get('env')}`); // dev env by default
// RabbitMQ
setupRabbitMQ();
consumeJobEvents();
// PORT
const port = process.env.PORT || 3009;
app.listen(port, () => console.log('User service is listening on port', port));