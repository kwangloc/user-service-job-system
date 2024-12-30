const { getRabbitMQConnection } = require('./rabbitmqConnection');

async function publishEvent(routingKey, msg) {
    try {
        // connect to RabbitMQ
        const connection = await getRabbitMQConnection();
        const channel = await connection.createChannel();
        const exchange = process.env.RABBITMQ_EXCHANGE || 'job_events_topic_5'; 

        // publish msg
        const message = JSON.stringify(msg);
        channel.publish(exchange, routingKey, Buffer.from(message), {
            persistent: true 
        });
        console.log(`Published message: ${routingKey}`, msg);

        await channel.close();
    } catch (error) {
        console.error('Failed to publish user event:', error);
    }
}

async function formatNewUserMsg(user, role) {
    const newUser = {
        userId: user._id,
        email: user.email,
        password: user.password,
        name: user.name,
        role: role
    };
    return newUser;
}

module.exports = { publishEvent, formatNewUserMsg };
