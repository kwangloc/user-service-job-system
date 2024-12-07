// import "dotenv/config"; 
// require('dotenv').config();
const { getRabbitMQConnection } = require('./rabbitmqConnection');

async function consumeJobEvents() {
    try {
        const connection = await getRabbitMQConnection();
        const channel = await connection.createChannel();

        // const exchange = 'job_events_topic_5';
        const exchange = process.env.RABBITMQ_EXCHANGE || 'job_events_topic_5';
        
        const queue = 'user_service_queue';  
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, 'post.#');  
        await channel.bindQueue(queue, exchange, 'noti.*');  

        console.log(`*Waiting for messages in ${queue}`);

        // Consume messages from the queue
        channel.consume(queue, (msg) => {
            if (msg !== null) {
                const messageContent = JSON.parse(msg.content.toString());
                // const messageContent = msg.content.toString();
                // console.log("Received: ", msg.content.toString());
                console.log('Received message:', msg.fields.routingKey, messageContent);

                if (msg.fields.routingKey.startsWith('post.')) {
                    handlePostEvent(msg.fields.routingKey, messageContent);
                } else if (msg.fields.routingKey.startsWith('noti.')) {
                    handleNotiEvent(msg.fields.routingKey, messageContent);
                }

                // handleJobEvent(msg.fields.routingKey, messageContent);

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Failed to consume job events:', error);
    }
}

// Messages handler function
function handlePostEvent(routingKey, job) {
    if (routingKey === 'post.recruiter.addJob') {
        console.log(`post ${post.id} was created. Updating user preferences...`);
    } else if (routingKey === 'post.recruiter.deleteJob') {
        console.log(`Job ${job.id} was deleted. Updating user preferences...`);
    } else if (routingKey === 'post.candidate.saveJob ') {
        console.log(`Job ${job.id} was deleted. Updating user preferences...`);
    } else if (routingKey === 'post.candidate.unsaveJob') {
        console.log(`Job ${job.id} was deleted. Updating user preferences...`);
    } else if (routingKey === 'post.candidate.addApp') {
        console.log(`Job ${job.id} was deleted. Updating user preferences...`);
    } else if (routingKey === 'post.candidate.editAppStatus') {
        console.log(`Job ${job.id} was deleted. Updating user preferences...`);
    } else if (routingKey === 'post.candidate.cancelApp') {
        console.log(`Job ${job.id} was deleted. Updating user preferences...`);
    } 
}

function handleNotiEvent(routingKey, noti) {
    if (routingKey === 'noti.created') {
        console.log(`Noti ${noti.id} was created. Updating user preferences...`);
    } else if (routingKey === 'noti.deleted') {
        console.log(`Noti ${noti.id} was deleted. Updating user preferences...`);
    }
}


module.exports = { consumeJobEvents };
