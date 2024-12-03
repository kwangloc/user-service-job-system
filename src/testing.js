// RabbitMQ
const { setupRabbitMQ } = require('./rabbitmq/rabbitmqSetup');
const { consumeJobEvents } = require('./rabbitmq/rabbitmqConsumer');
const { publishEvent } = require('./rabbitmq/rabbitmqPublisher');


setupRabbitMQ();
// consumeJobEvents();
const msgContent = "testing msg";
publishEvent('testing.testing.testing', msgContent); 
console.log("Published")