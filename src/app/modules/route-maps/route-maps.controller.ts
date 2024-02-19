import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import https from 'https'
import { simpleParser } from 'mailparser'
import { Readable } from 'stream'

import { createLoggerWithLabel } from '../../config/logger'

const logger = createLoggerWithLabel(module)

export const handleIncomingEmail = async (req) => {
  const message = req.body

  switch (message.Type) {
    case 'SubscriptionConfirmation': {
      // Automatically subscribe to the SNS topic if it is requested.
      https.get(message.SubscribeURL).on('error', (e) => {
        logger.error({
          meta: { action: 'handleSnsMessage', message },
          message: `Failed to subscribe to requested SNS topic. ${e.message}`,
        })
      })
      break
    }
    case 'Notification': {
      // Step 1: Get the email from S3
      await retrieveEmailFromS3(JSON.parse(message.Message))
      //
      // // Step 2: Get the routeMaps corresponding to each ingestion email and this formId.
      // const routeMaps = await this.findRouteMapsFromEmail(email)
      //
      // // No routeMap associated with this ingestion email - can early return.
      // if (routeMaps.length === 0) return
      //
      // // Step 3: Run each routeMap for this email.
      // for (const routeMap of routeMaps) {
      //   await this.runRouteMap(email, s3Key, routeMap)
      // }
      break
    }
    default: {
      logger.error({
        meta: { action: 'handleSnsMessage', message },
        message: 'Unhandled SNS message type',
      })
    }
  }
}

const retrieveEmailFromS3 = async (message) => {
  logger.info({
    meta: { action: 'retrieveEmailFromS3', message },
    message: 'Retrieving email from S3',
  })

  const {
    notificationType,
    receipt: {
      action: { type, bucketName, objectKey },
    },
  } = message

  if (notificationType !== 'Received' || type !== 'S3') {
    logger.error({
      meta: { action: 'retrieveEmailFromS3', message },
      message: 'Unhandled SNS content type',
    })
  }
  if (!bucketName) {
    logger.error({
      meta: { action: 'retrieveEmailFromS3', message },
      message: 'S3 bucket name not specified',
    })
  }
  if (!objectKey) {
    logger.error({
      meta: { action: 'retrieveEmailFromS3', message },
      message: 'S3 object key not specified',
    })
  }

  // Step 2: Get the email document from S3
  const s3Client = new S3Client({ region: 'ap-southeast-1' })
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }),
  )

  if (!Body) {
    logger.error({
      meta: { action: 'retrieveEmailFromS3', message },
      message: 'Failed to retrieve email from S3',
    })
  }

  // Step 3: Parse the email.
  const bodyString = await streamToString(Body as Readable)
  const email = await simpleParser(bodyString)
  return { s3Key: objectKey, email }
}

const streamToString = async (stream: Readable): Promise<string> => {
  return await new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = []
    stream.on('data', (chunk) => chunks.push(chunk as Uint8Array))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
  })
}
