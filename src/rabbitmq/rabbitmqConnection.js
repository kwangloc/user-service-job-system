const amqp = require('amqplib');

let connection = null;
const rabbitmq_url = process.env.RABBITMQ_URL || 'amqp://localhost';

async function getRabbitMQConnection() {
    if (!connection) {
        connection = await amqp.connect(rabbitmq_url);
    }
    return connection;
}

module.exports = { getRabbitMQConnection };
