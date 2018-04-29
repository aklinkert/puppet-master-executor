import Consumer from 'sqs-consumer';
import AWS from 'aws-sdk';
import { logger } from './log';

const config = {
    region: process.env.AWS_SQS_REGION,
    accessKeyId: process.env.AWS_SECRET_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_KEY_ID,
    queueUrl: process.env.AWS_SQS_QUEUE_URL,
    visibilityTimeout: process.env.AWS_SQS_VISIBILITY_TIMEOUT || 300,
};

export function createQueueConsumer(handleMessage) {
    AWS.config.update(config);

    const app = Consumer.create({
        queueUrl: config.queueUrl,
        handleMessage: handleMessage,
        sqs: new AWS.SQS(),
        visibilityTimeout: config.visibilityTimeout,
    });

    app.on('error', (err, msg) => {
        logger.error(`Consumer received an error: ${err.message}, ${msg}`);
    });

    app.on('processing_error', (err, msg) => {
        logger.error(`Consumer received a processing_error: ${err.message}, ${msg}`);
    });

    app.on('message_received', (msg) => {
        logger.debug(`Consumer received a message: ${msg}`);
    });

    return app;
}
