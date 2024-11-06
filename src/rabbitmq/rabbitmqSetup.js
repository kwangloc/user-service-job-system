// import "dotenv/config"; 
// require('dotenv').config();
const { getRabbitMQConnection } = require('./rabbitmqConnection');

async function setupRabbitMQ() {
    try {
        const connection = await getRabbitMQConnection();
        const channel = await connection.createChannel();

        // const exchange = 'job_events_topic_4';
        if (!process.env.RABBITMQ_EXCHANGE) {
            const error = new Error("RABBITMQ_EXCHANGE env is not found!");
            error.statusCode = 500;
            throw error;
        }
        const exchange = process.env.RABBITMQ_EXCHANGE;
        
        await channel.assertExchange(exchange, 'topic', { durable: true });
        console.log('Connected to exchange:', exchange);

        // Declare and bind the user queue 

        // const userQueue = 'user_service_queue';
        // const notificationQueue = 'notification_service_queue';
        // const jobQueue = 'job_service_queue';

        // await channel.assertQueue(userQueue, { durable: true });
        // await channel.assertQueue(notificationQueue, { durable: true });
        // await channel.assertQueue(jobQueue, { durable: true });

        // await channel.bindQueue(notificationQueue, exchange, 'job.*');
        // await channel.bindQueue(userQueue, exchange, 'job.*');
        // await channel.bindQueue(jobQueue, exchange, 'job.posted');

        console.log('RabbitMQ setup completed successfully!');
    } catch (error) {
        console.error('Failed to setup RabbitMQ:', error);
    }
}

module.exports = { setupRabbitMQ };
