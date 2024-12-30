const rabbitmqService = require('../api/v1/services/rabbitmqService');

// const { required } = require('joi');
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
                console.log('Received a message from MessageQueue.')
                console.log('routing key:', msg.fields.routingKey);
                console.log('content:', messageContent);

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
async function handlePostEvent(routingKey, msg) {
    if (routingKey === 'post.recruiter.addJob') {
        const result = await rabbitmqService.addPostedJobRecruiter(msg);
        console.log("result addJob: ", result);
    } else if (routingKey === 'post.recruiter.editJob') {
        const result = await rabbitmqService.editPostedJobRecruiter(msg);
        console.log("result editJob: ", result);
    } else if (routingKey === 'post.recruiter.deleteJob') {
        const result = await rabbitmqService.delPostedJobRecruiter(msg);
        console.log("result deleteJob: ", result);
    } else if (routingKey === 'post.candidate.saveJob') {
        const result = await rabbitmqService.addSavedJobCandidate(msg);
        console.log("result saveJob: ", result);
    } else if (routingKey === 'post.candidate.unsaveJob') {
        const result = await rabbitmqService.removeSavedJobCandidate(msg);
        console.log("result unsaveJob: ", result);
    } else if (routingKey === 'post.candidate.addApp') {
        const result = await rabbitmqService.addAppliedJobCandidate(msg);
        console.log("result addApp: ", result);
    } else if (routingKey === 'post.candidate.cancelApp') {
        const result = await rabbitmqService.cancelAppliedJobCandidate(msg);
        console.log("result cancelApp: ", result);
    } else if (routingKey === 'post.candidate.editAppStatus') {
        const result = await rabbitmqService.editAppliedJobCandidate(msg);
        console.log("result editAppStatus: ", result);
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
