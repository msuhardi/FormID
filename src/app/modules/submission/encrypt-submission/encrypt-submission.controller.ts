import JoiDate from '@joi/date'
import { celebrate, Joi as BaseJoi, Segments } from 'celebrate'
import { AuthedSessionData } from 'express-session'
import { StatusCodes } from 'http-status-codes'
import JSONStream from 'JSONStream'
import mongoose from 'mongoose'
import { okAsync } from 'neverthrow'

import { featureFlags } from '../../../../../shared/constants'
import {
  AttachmentPresignedPostDataMapType,
  AttachmentSizeMapType,
  DateString,
  ErrorDto,
  FormResponseMode,
  FormSubmissionMetadataQueryDto,
  StorageModeSubmissionDto,
  StorageModeSubmissionMetadataList,
} from '../../../../../shared/types'
import { IEncryptedSubmissionSchema } from '../../../../types'
import { createLoggerWithLabel } from '../../../config/logger'
import { getEncryptSubmissionModel } from '../../../models/submission.server.model'
import * as CaptchaMiddleware from '../../../services/captcha/captcha.middleware'
import * as TurnstileMiddleware from '../../../services/turnstile/turnstile.middleware'
import { Pipeline } from '../../../utils/pipeline-middleware'
import { createReqMeta } from '../../../utils/request'
import { getFormAfterPermissionChecks } from '../../auth/auth.service'
import { ControllerHandler } from '../../core/core.types'
import { setFormTags } from '../../datadog/datadog.utils'
import { getFeatureFlag } from '../../feature-flags/feature-flags.service'
import { PermissionLevel } from '../../form/admin-form/admin-form.types'
import { getPopulatedUserById } from '../../user/user.service'
import * as EncryptSubmissionMiddleware from '../encrypt-submission/encrypt-submission.middleware'
import * as ReceiverMiddleware from '../receiver/receiver.middleware'
import { fileSizeLimit, fileSizeLimitBytes } from '../submission.utils'
import { reportSubmissionResponseTime } from '../submissions.statsd-client'

import {
  ensureFormWithinSubmissionLimits,
  ensurePublicForm,
  ensureValidCaptcha,
} from './encrypt-submission.ensures'
import {
  FeatureDisabledError,
  SubmissionFailedError,
} from './encrypt-submission.errors'
import {
  addPaymentDataStream,
  checkFormIsEncryptMode,
  getAllEncryptedSubmissionData,
  getEncryptedSubmissionData,
  getQuarantinePresignedPostData,
  getSubmissionCursor,
  getSubmissionMetadata,
  getSubmissionMetadataList,
  getSubmissionPaymentDto,
  performEncryptPostSubmissionActions,
  transformAttachmentMetasToSignedUrls,
  transformAttachmentMetaStream,
  uploadAttachments,
} from './encrypt-submission.service'
import {
  SubmitEncryptModeFormHandlerRequest,
  SubmitEncryptModeFormHandlerType,
} from './encrypt-submission.types'
import {
  createEncryptedSubmissionDto,
  mapRouteError,
} from './encrypt-submission.utils'

const logger = createLoggerWithLabel(module)
const EncryptSubmission = getEncryptSubmissionModel(mongoose)

// NOTE: Refer to this for documentation: https://github.com/sideway/joi-date/blob/master/API.md
const Joi = BaseJoi.extend(JoiDate)

const submitEncryptModeForm = async (
  req: SubmitEncryptModeFormHandlerRequest,
  res: Parameters<SubmitEncryptModeFormHandlerType>[1],
) => {
  const { formId } = req.params

  const logMeta = {
    action: 'submitEncryptModeForm',
    ...createReqMeta(req),
    formId,
  }

  const formDef = req.formsg.formDef
  const form = req.formsg.encryptedFormDef

  setFormTags(formDef)

  const ensurePipeline = new Pipeline(
    ensurePublicForm,
    ensureValidCaptcha,
    ensureFormWithinSubmissionLimits,
  )

  const hasEnsuredAll = await ensurePipeline.execute({
    form,
    logMeta,
    req,
    res,
  })

  if (!hasEnsuredAll) {
    if (!res.headersSent) {
      const { errorMessage, statusCode } = mapRouteError(
        new SubmissionFailedError(),
      )
      return res.status(statusCode).json({ message: errorMessage })
    }
    return // required to stop submission processing
  }

  const encryptedPayload = req.formsg.encryptedPayload

  // Create Incoming Submission
  const { encryptedContent, responseMetadata } = encryptedPayload

  // Encrypt Verified SPCP Fields
  let verified

  // Save Responses to Database
  let attachmentMetadata = new Map<string, string>()

  if (encryptedPayload.attachments) {
    const attachmentUploadResult = await uploadAttachments(
      form._id,
      encryptedPayload.attachments,
    )

    if (attachmentUploadResult.isErr()) {
      const { statusCode, errorMessage } = mapRouteError(
        attachmentUploadResult.error,
      )
      return res.status(statusCode).json({
        message: errorMessage,
      })
    } else {
      attachmentMetadata = attachmentUploadResult.value
    }
  }

  const submissionContent = {
    form: form._id,
    authType: form.authType,
    myInfoFields: form.getUniqueMyInfoAttrs(),
    encryptedContent: encryptedContent,
    verifiedContent: verified,
    attachmentMetadata,
    version: req.formsg.encryptedPayload.version,
    responseMetadata,
  }

  return _createSubmission({
    req,
    res,
    logMeta,
    formId,
    responses: req.formsg.filteredResponses,
    responseMetadata,
    submissionContent,
  })
}

const _createSubmission = async ({
  req,
  res,
  submissionContent,
  logMeta,
  formId,
  responseMetadata,
  responses,
}: {
  req: Parameters<SubmitEncryptModeFormHandlerType>[0]
  res: Parameters<SubmitEncryptModeFormHandlerType>[1]
  [others: string]: any
}) => {
  const submission = new EncryptSubmission(submissionContent)

  try {
    await submission.save()
  } catch (err) {
    logger.error({
      message: 'Encrypt submission save error',
      meta: {
        action: 'onEncryptSubmissionFailure',
        ...createReqMeta(req),
      },
      error: err,
    })
    return res.status(StatusCodes.BAD_REQUEST).json({
      message:
        'Could not send submission. For assistance, please contact the person who asked you to fill in this form.',
      submissionId: submission._id,
    })
  }

  const submissionId = submission.id
  logger.info({
    message: 'Saved submission to MongoDB',
    meta: {
      ...logMeta,
      submissionId,
      formId,
      responseMetadata,
    },
  })

  // TODO 6395 make responseMetadata mandatory
  if (responseMetadata) {
    reportSubmissionResponseTime(responseMetadata, {
      mode: 'encrypt',
      payment: 'true',
    })
  }

  // Send success back to client
  res.json({
    message: 'Form submission successful.',
    submissionId,
    timestamp: (submission.created || new Date()).getTime(),
  })

  return await performEncryptPostSubmissionActions(submission, responses)
}

// TODO (FRM-1232): remove endpoint after encryption boundary is shifted
export const handleEncryptedSubmission = [
  CaptchaMiddleware.validateCaptchaParams,
  TurnstileMiddleware.validateTurnstileParams,
  EncryptSubmissionMiddleware.validateEncryptSubmissionParams,
  EncryptSubmissionMiddleware.createFormsgAndRetrieveForm,
  EncryptSubmissionMiddleware.validateEncryptSubmission,
  EncryptSubmissionMiddleware.moveEncryptedPayload,
  submitEncryptModeForm,
] as ControllerHandler[]

export const handleStorageSubmission = [
  ReceiverMiddleware.receiveStorageSubmission,
  EncryptSubmissionMiddleware.validateStorageSubmissionParams,
  EncryptSubmissionMiddleware.createFormsgAndRetrieveForm,
  EncryptSubmissionMiddleware.scanAndRetrieveAttachments,
  EncryptSubmissionMiddleware.validateStorageSubmission,
  EncryptSubmissionMiddleware.encryptSubmission,
  submitEncryptModeForm,
] as ControllerHandler[]

// Validates that the ending date >= starting date
const validateDateRange = celebrate({
  [Segments.QUERY]: Joi.object()
    .keys({
      startDate: Joi.date().format('YYYY-MM-DD').raw(),
      endDate: Joi.date().format('YYYY-MM-DD').min(Joi.ref('startDate')).raw(),
      downloadAttachments: Joi.boolean().default(false),
    })
    .and('startDate', 'endDate'),
})

/**
 * Handler for GET /:formId([a-fA-F0-9]{24})/submissions/download
 * NOTE: This is exported solely for testing
 * Streams and downloads for GET /:formId([a-fA-F0-9]{24})/adminform/submissions/download
 * @security session
 *
 * @returns 200 with stream of encrypted responses
 * @returns 400 if form is not an encrypt mode form
 * @returns 400 if req.query.startDate or req.query.endDate is malformed
 * @returns 403 when user does not have read permissions for form
 * @returns 404 when form cannot be found
 * @returns 410 when form is archived
 * @returns 422 when user in session cannot be retrieved from the database
 * @returns 500 if any errors occurs in stream pipeline or error retrieving form
 */
export const streamEncryptedResponses: ControllerHandler<
  { formId: string },
  unknown,
  unknown,
  { startDate?: string; endDate?: string; downloadAttachments: boolean }
> = async (req, res) => {
  const sessionUserId = (req.session as AuthedSessionData).user._id
  const { formId } = req.params
  const { startDate, endDate } = req.query

  const logMeta = {
    action: 'handleStreamEncryptedResponses',
    ...createReqMeta(req),
    formId,
    sessionUserId,
  }

  logger.info({
    message: 'Stream encrypted responses start',
    meta: logMeta,
  })

  // Step 1: Retrieve currently logged in user.
  const cursorResult = await getPopulatedUserById(sessionUserId)
    .andThen((user) =>
      // Step 2: Check whether user has read permissions to form
      getFormAfterPermissionChecks({
        user,
        formId,
        level: PermissionLevel.Read,
      }),
    )
    // Step 3: Check whether form is encrypt mode.
    .andThen(checkFormIsEncryptMode)
    // Step 4: Retrieve submissions cursor.
    .andThen(() =>
      getSubmissionCursor(formId, {
        startDate,
        endDate,
      }),
    )

  if (cursorResult.isErr()) {
    logger.error({
      message: 'Error occurred whilst retrieving submission cursor',
      meta: logMeta,
      error: cursorResult.error,
    })

    const { statusCode, errorMessage } = mapRouteError(cursorResult.error)
    return res.status(statusCode).json({
      message: errorMessage,
    })
  }

  const cursor = cursorResult.value

  cursor
    .on('error', (error) => {
      logger.error({
        message: 'Error streaming submissions from database',
        meta: logMeta,
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error retrieving from database.',
      })
    })
    .pipe(
      transformAttachmentMetaStream({
        enabled: req.query.downloadAttachments,
        urlValidDuration: (req.session?.cookie.maxAge ?? 0) / 1000,
      }),
    )
    // TODO: Can we include this within the cursor query as aggregation pipeline
    // instead, so that we make one query to mongo rather than two.
    .pipe(addPaymentDataStream())
    .on('error', (error) => {
      logger.error({
        message: 'Error retrieving URL for attachments',
        meta: logMeta,
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error retrieving URL for attachments',
      })
    })
    // If you call JSONStream.stringify(false) the elements will only be
    // seperated by a newline.
    .pipe(JSONStream.stringify(false))
    .on('error', (error) => {
      logger.error({
        message: 'Error converting submissions to JSON',
        meta: logMeta,
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error converting submissions to JSON',
      })
    })
    .pipe(res.type('application/x-ndjson'))
    .on('error', (error) => {
      logger.error({
        message: 'Error writing submissions to HTTP stream',
        meta: logMeta,
        error,
      })
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Error writing submissions to HTTP stream',
      })
    })
    .on('close', () => {
      logger.info({
        message: 'Stream encrypted responses closed',
        meta: logMeta,
      })

      return res.end()
    })
}

// Handler for GET /:formId([a-fA-F0-9]{24})/submissions/download
export const handleStreamEncryptedResponses = [
  validateDateRange,
  streamEncryptedResponses,
] as ControllerHandler[]

/**
 * Handler for GET /:formId/submissions/:submissionId
 * @security session
 *
 * @returns 200 with encrypted submission data response
 * @returns 400 when form is not an encrypt mode form
 * @returns 403 when user does not have read permissions for form
 * @returns 404 when submissionId cannot be found in the database
 * @returns 404 when form cannot be found
 * @returns 410 when form is archived
 * @returns 422 when user in session cannot be retrieved from the database
 * @returns 500 when any errors occurs in database query, generating signed URL or retrieving payment data
 */
export const handleGetEncryptedResponse: ControllerHandler<
  { formId: string; submissionId: string },
  StorageModeSubmissionDto | ErrorDto
> = async (req, res) => {
  const sessionUserId = (req.session as AuthedSessionData).user._id
  const { formId, submissionId } = req.params

  const logMeta = {
    action: 'handleGetEncryptedResponse',
    submissionId,
    formId,
    sessionUserId,
    ...createReqMeta(req),
  }

  logger.info({
    message: 'Get encrypted response using submissionId start',
    meta: logMeta,
  })

  return (
    // Step 1: Retrieve logged in user.
    getPopulatedUserById(sessionUserId)
      // Step 2: Check whether user has read permissions to form.
      .andThen((user) =>
        getFormAfterPermissionChecks({
          user,
          formId,
          level: PermissionLevel.Read,
        }),
      )
      // Step 3: Check whether form is encrypt mode.
      .andThen(checkFormIsEncryptMode)
      // Step 4: Is encrypt mode form, retrieve submission data.
      .andThen(() => getEncryptedSubmissionData(formId, submissionId))
      // Step 5: If there is an associated payment, get the payment details.
      .andThen((submissionData) => {
        if (!submissionData.paymentId) {
          return okAsync({ submissionData, paymentData: undefined })
        }

        return getSubmissionPaymentDto(submissionData.paymentId).map(
          (paymentData) => ({
            submissionData,
            paymentData,
          }),
        )
      })
      // Step 6: Retrieve presigned URLs for attachments.
      .andThen(({ submissionData, paymentData }) => {
        // Remaining login duration in seconds.
        const urlExpiry = (req.session?.cookie.maxAge ?? 0) / 1000
        return transformAttachmentMetasToSignedUrls(
          submissionData.attachmentMetadata,
          urlExpiry,
        ).map((presignedUrls) =>
          createEncryptedSubmissionDto(
            submissionData,
            presignedUrls,
            paymentData,
          ),
        )
      })
      .map((responseData) => {
        logger.info({
          message: 'Get encrypted response using submissionId success',
          meta: logMeta,
        })
        return res.json(responseData)
      })
      .mapErr((error) => {
        logger.error({
          message: 'Failure retrieving encrypted submission response',
          meta: logMeta,
          error,
        })

        const { statusCode, errorMessage } = mapRouteError(error)
        return res.status(statusCode).json({
          message: errorMessage,
        })
      })
  )
}

const _getAllEncryptedResponse: ControllerHandler<
  { formId: string },
  unknown,
  IEncryptedSubmissionSchema[] | ErrorDto,
  { startDate?: DateString; endDate?: DateString }
> = async (req, res) => {
  const sessionUserId = (req.session as AuthedSessionData).user._id
  const { formId } = req.params
  // extract startDate and endDate from query
  const { startDate, endDate } = req.query

  const logMeta = {
    action: 'handleGetAllEncryptedResponse',
    formId,
    sessionUserId,
    ...createReqMeta(req),
  }

  logger.info({
    message: 'Get all encrypted response start',
    meta: logMeta,
  })

  return (
    // Step 1: Retrieve logged in user.
    getPopulatedUserById(sessionUserId)
      // Step 2: Check whether user has read permissions to form.
      .andThen((user) =>
        getFormAfterPermissionChecks({
          user,
          formId,
          level: PermissionLevel.Read,
        }),
      )
      // Step 3: Check whether form is encrypt mode.
      .andThen(checkFormIsEncryptMode)
      // Step 4: Is encrypt mode form, retrieve submission data.
      .andThen(() => getAllEncryptedSubmissionData(formId, startDate, endDate))
      .map((responseData) => {
        logger.info({
          message: 'Get encrypted response using submissionId success',
          meta: logMeta,
        })
        return res.json(responseData)
      })
      .mapErr((error) => {
        logger.error({
          message: 'Failure retrieving encrypted submission response',
          meta: logMeta,
          error,
        })

        const { statusCode, errorMessage } = mapRouteError(error)
        return res.status(statusCode).json({
          message: errorMessage,
        })
      })
  )
}

// Handler for GET /:formId([a-fA-F0-9]{24})/submissions
export const handleGetAllEncryptedResponses = [
  celebrate({
    [Segments.QUERY]: Joi.object()
      .keys({
        startDate: Joi.date().format('YYYY-MM-DD').raw(),
        endDate: Joi.date()
          .format('YYYY-MM-DD')
          .min(Joi.ref('startDate'))
          .raw(),
      })
      .and('startDate', 'endDate'),
  }),
  _getAllEncryptedResponse,
] as ControllerHandler[]

/**
 * Handler for GET /:formId/submissions/metadata
 * This is exported solely for testing purposes
 *
 * @returns 200 with single submission metadata if query.submissionId is provided
 * @returns 200 with list of submission metadata with total count (and optional offset if query.page is provided) if query.submissionId is not provided
 * @returns 400 if form is not an encrypt mode form
 * @returns 403 when user does not have read permissions for form
 * @returns 404 when form cannot be found
 * @returns 410 when form is archived
 * @returns 422 when user in session cannot be retrieved from the database
 * @returns 500 if any errors occurs whilst querying database
 */
export const getMetadata: ControllerHandler<
  { formId: string },
  StorageModeSubmissionMetadataList | ErrorDto,
  unknown,
  FormSubmissionMetadataQueryDto
> = async (req, res) => {
  const sessionUserId = (req.session as AuthedSessionData).user._id
  const { formId } = req.params
  const { page, submissionId } = req.query

  const logMeta = {
    action: 'handleGetMetadata',
    formId,
    submissionId,
    page,
    sessionUserId,
    ...createReqMeta(req),
  }

  return (
    // Step 1: Retrieve logged in user.
    getPopulatedUserById(sessionUserId)
      .andThen((user) =>
        // Step 2: Check whether user has read permissions to form.
        getFormAfterPermissionChecks({
          user,
          formId,
          level: PermissionLevel.Read,
        }),
      )
      // Step 3: Check whether form is encrypt mode.
      .andThen(checkFormIsEncryptMode)
      // Step 4: Retrieve submission metadata.
      .andThen(() => {
        // Step 4a: Retrieve specific submission id.
        if (submissionId) {
          return getSubmissionMetadata(formId, submissionId).map((metadata) => {
            const metadataList: StorageModeSubmissionMetadataList = metadata
              ? { metadata: [metadata], count: 1 }
              : { metadata: [], count: 0 }
            return metadataList
          })
        }
        // Step 4b: Retrieve all submissions of given form id.
        return getSubmissionMetadataList(formId, page)
      })
      .map((metadataList) => {
        logger.info({
          message: 'Successfully retrieved metadata from database',
          meta: logMeta,
        })
        return res.json(metadataList)
      })
      .mapErr((error) => {
        logger.error({
          message: 'Failure retrieving metadata from database',
          meta: logMeta,
          error,
        })

        const { statusCode, errorMessage } = mapRouteError(error)
        return res.status(statusCode).json({
          message: errorMessage,
        })
      })
  )
}

// Handler for GET /:formId/submissions/metadata
export const handleGetMetadata = [
  // NOTE: If submissionId is set, then page is optional.
  // Otherwise, if there is no submissionId, then page >= 1
  celebrate({
    [Segments.QUERY]: {
      submissionId: Joi.string().optional(),
      page: Joi.number().min(1).when('submissionId', {
        not: Joi.exist(),
        then: Joi.required(),
      }),
    },
  }),
  getMetadata,
] as ControllerHandler[]

/**
 * Handler for POST /:formId/submissions/storage/get-s3-presigned-post-data
 * Used by handleGetS3PresignedPostData after joi validation
 * @returns 200 with array of presigned post data
 * @returns 400 if ids are invalid or total file size exceeds 20MB
 * @returns 500 if presigned post data cannot be retrieved or any other errors occur
 * Exported for testing
 */
export const getS3PresignedPostData: ControllerHandler<
  unknown,
  AttachmentPresignedPostDataMapType[] | ErrorDto,
  AttachmentSizeMapType[]
> = async (req, res) => {
  const logMeta = {
    action: 'getS3PresignedPostData',
    ...createReqMeta(req),
  }

  return getFeatureFlag(featureFlags.encryptionBoundaryShiftVirusScanner)
    .map((virusScannerEnabled) => {
      if (!virusScannerEnabled) {
        logger.warn({
          message: 'Virus scanning has not been enabled.',
          meta: logMeta,
        })

        const { statusCode, errorMessage } = mapRouteError(
          new FeatureDisabledError(),
        )
        return res.status(statusCode).send({
          message: errorMessage,
        })
      }

      return getQuarantinePresignedPostData(req.body)
        .map((presignedUrls) => {
          logger.info({
            message: 'Successfully retrieved quarantine presigned post data.',
            meta: logMeta,
          })
          return res.status(StatusCodes.OK).send(presignedUrls)
        })
        .mapErr((error) => {
          logger.error({
            message: 'Failure getting quarantine presigned post data.',
            meta: logMeta,
            error,
          })
          const { statusCode, errorMessage } = mapRouteError(error)
          return res.status(statusCode).send({
            message: errorMessage,
          })
        })
    })
    .mapErr((error) => {
      logger.error({
        message: 'Error retrieving feature flags.',
        meta: logMeta,
        error,
      })
      const { statusCode, errorMessage } = mapRouteError(error)
      return res.status(statusCode).send({
        message: errorMessage,
      })
    })
}

/**
 * Custom validation function for Joi to validate that the sum of 'size' in the array of objects
 * is less than or equal to total file size limit (20MB).
 */
const validateFileSizeSum = (
  value: { size: number }[],
  helpers: { error: (arg0: string) => null },
) => {
  const sum = value.reduce((acc, curr) => acc + curr.size, 0)

  if (sum <= fileSizeLimitBytes(FormResponseMode.Encrypt)) {
    return value // Return the validated value if the sum of 'size' is less than or equal to limit
  } else {
    return helpers.error('size.limit') // Return an error if the sum of 'size' is greater than limit
  }
}

// Handler for POST /:formId/submissions/storage/get-s3-presigned-post-data
export const handleGetS3PresignedPostData = [
  celebrate({
    [Segments.BODY]: Joi.array()
      .items(
        Joi.object().keys({
          id: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/) // IDs should be MongoDB ObjectIDs
            .required(),
          size: Joi.number()
            .max(fileSizeLimitBytes(FormResponseMode.Encrypt)) // Max attachment size is 20MB
            .required(),
        }),
      )
      .unique('id') // IDs of each array item should be unique
      .custom(validateFileSizeSum, 'Custom validation for total file size') // Custom validation to check for total file size
      .messages({
        'size.limit': `Total file size exceeds ${fileSizeLimit(
          FormResponseMode.Encrypt,
        )}MB`, // Custom error message for total file size
        'array.unique': 'Duplicate id(s) found', // Custom error message for duplicate IDs
      }),
  }),
  getS3PresignedPostData,
] as ControllerHandler[]
