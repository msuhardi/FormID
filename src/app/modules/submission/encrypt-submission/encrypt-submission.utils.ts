import { StatusCodes } from 'http-status-codes'
import moment from 'moment-timezone'
import Stripe from 'stripe'

import {
  FormPaymentsField,
  PaymentChannel,
  PaymentFieldsDto,
  PaymentMethodType,
  PaymentType,
  StorageModeSubmissionContentDto,
  StorageModeSubmissionDto,
  SubmissionPaymentDto,
  SubmissionType,
} from '../../../../../shared/types'
import { calculatePrice } from '../../../../../shared/utils/paymentProductPrice'
import {
  IEncryptedSubmissionSchema,
  IPopulatedEncryptedForm,
  ISubmissionSchema,
  MapRouteError,
  MapRouteErrors,
  SubmissionData,
} from '../../../../types'
import {
  EncryptFormFieldResponse,
  ParsedClearFormFieldResponse,
} from '../../../../types/api'
import { createLoggerWithLabel } from '../../../config/logger'
import {
  CaptchaConnectionError,
  MissingCaptchaError,
  VerifyCaptchaError,
} from '../../../services/captcha/captcha.errors'
import {
  MissingTurnstileError,
  TurnstileConnectionError,
  VerifyTurnstileError,
} from '../../../services/turnstile/turnstile.errors'
import { CreatePresignedPostError } from '../../../utils/aws-s3'
import { genericMapRouteErrorTransform } from '../../../utils/error'
import {
  AttachmentUploadError,
  DatabaseConflictError,
  DatabaseError,
  DatabasePayloadSizeError,
  DatabaseValidationError,
  EmptyErrorFieldError,
  MalformedParametersError,
} from '../../core/core.errors'
import {
  ForbiddenFormError,
  FormDeletedError,
  FormNotFoundError,
  PrivateFormError,
} from '../../form/form.errors'
import { PaymentNotFoundError } from '../../payments/payments.errors'
import { MissingUserError } from '../../user/user.errors'
import { MalformedVerifiedContentError } from '../../verified-content/verified-content.errors'
import {
  AttachmentTooLargeError,
  ConflictError,
  InvalidEncodingError,
  InvalidFileExtensionError,
  ProcessingError,
  ResponseModeError,
  SubmissionNotFoundError,
  ValidateFieldError,
} from '../submission.errors'
import { ProcessedFieldResponse } from '../submission.types'

import {
  AttachmentSizeLimitExceededError,
  DownloadCleanFileFailedError,
  FeatureDisabledError,
  InvalidFieldIdError,
  InvalidFileKeyError,
  MaliciousFileDetectedError,
  SubmissionFailedError,
  VirusScanFailedError,
} from './encrypt-submission.errors'

const logger = createLoggerWithLabel(module)

/**
 * Handler to map ApplicationErrors to their correct status code and error
 * messages.
 * @param error The error to retrieve the status codes and error messages
 */
const errorMapper: MapRouteError = (error) => {
  switch (error.constructor) {
    case AttachmentUploadError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'Could not upload attachments for submission. For assistance, please contact the person who asked you to fill in this form.',
      }
    case MalformedVerifiedContentError:
      return {
        statusCode: StatusCodes.UNAUTHORIZED,
        errorMessage:
          'Something went wrong with your login. Please try logging in and submitting again.',
      }
    case MissingUserError:
      return {
        statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
        errorMessage: error.message,
      }
    case FormNotFoundError:
      return {
        statusCode: StatusCodes.NOT_FOUND,
        errorMessage: error.message,
      }
    case ResponseModeError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: error.message,
      }
    case FeatureDisabledError:
    case ForbiddenFormError:
      return {
        statusCode: StatusCodes.FORBIDDEN,
        errorMessage: error.message,
      }
    case FormDeletedError:
      return {
        statusCode: StatusCodes.GONE,
        errorMessage: error.message,
      }
    case PrivateFormError:
      return {
        statusCode: StatusCodes.NOT_FOUND,
        errorMessage:
          'This form has been taken down. For assistance, please contact the person who asked you to fill in this form.',
      }
    case CaptchaConnectionError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'Could not verify captcha. Please submit again in a few minutes.',
      }
    case VerifyCaptchaError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: 'Captcha was incorrect. Please submit again.',
      }
    case MissingCaptchaError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: 'Captcha was missing. Please refresh and submit again.',
      }
    case TurnstileConnectionError:
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessage:
          'Error connecting to Turnstile server . Please submit again in a few minutes.',
      }
    case VerifyTurnstileError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'Incorrect Turnstile parameters. Please refresh and submit again.',
      }
    case MissingTurnstileError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'Missing Turnstile challenge. Please refresh and submit again.',
      }
    case MalformedParametersError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: error.message,
      }
    case SubmissionNotFoundError:
      return {
        statusCode: StatusCodes.NOT_FOUND,
        errorMessage: error.message,
      }
    case InvalidEncodingError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'Invalid data was found. Please check your responses and submit again.',
      }
    case DatabasePayloadSizeError:
      return {
        statusCode: StatusCodes.REQUEST_TOO_LONG,
        errorMessage:
          'Submission too large to be saved. Please reduce the size of your submission and try again.',
      }
    case ValidateFieldError:
    case DatabaseValidationError:
    case InvalidFileExtensionError:
    case AttachmentTooLargeError:
    case ProcessingError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage:
          'There is something wrong with your form submission. Please check your responses and try again. If the problem persists, please refresh the page.',
      }
    case DatabaseConflictError:
    case ConflictError:
      return {
        statusCode: StatusCodes.CONFLICT,
        errorMessage:
          'The form has been updated. Please refresh and submit again. (Encrypt)',
      }
    case PaymentNotFoundError:
    case CreatePresignedPostError:
    case DatabaseError:
    case EmptyErrorFieldError:
    case VirusScanFailedError:
    case DownloadCleanFileFailedError:
      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessage: error.message,
      }
    case SubmissionFailedError:
    case InvalidFieldIdError:
    case AttachmentSizeLimitExceededError:
    case InvalidFileKeyError:
    case MaliciousFileDetectedError:
      return {
        statusCode: StatusCodes.BAD_REQUEST,
        errorMessage: error.message,
      }
    default:
      logger.error({
        message: 'Unknown route error observed',
        meta: {
          action: 'mapRouteError',
        },
        error,
      })

      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        errorMessage: 'Something went wrong. Please try again.',
      }
  }
}

export const mapRouteError: MapRouteErrors =
  genericMapRouteErrorTransform(errorMapper)

/**
 * Typeguard to check if given submission is an encrypt mode submission.
 * @param submission the submission to check
 * @returns true if submission is encrypt mode submission, false otherwise.
 */
export const isSubmissionEncryptMode = (
  submission: ISubmissionSchema,
): submission is IEncryptedSubmissionSchema => {
  return submission.submissionType === SubmissionType.Encrypt
}

/**
 * Creates and returns an EncryptedSubmissionDto object from submissionData and
 * attachment presigned urls.
 */
export const createEncryptedSubmissionDto = (
  submissionData: SubmissionData,
  attachmentPresignedUrls: Record<string, string>,
  payment?: SubmissionPaymentDto,
): StorageModeSubmissionDto => {
  return {
    refNo: submissionData._id,
    submissionTime: moment(submissionData.created)
      .tz('Asia/Singapore')
      .format('ddd, D MMM YYYY, hh:mm:ss A'),
    content: submissionData.encryptedContent,
    verified: submissionData.verifiedContent,
    attachmentMetadata: attachmentPresignedUrls,
    payment,
    version: submissionData.version,
  }
}

/**
 * Retrieves payment amount by payment_type
 * @param formPaymentFields data from the form
 * @param incomingSubmissionPaymentFields data from responder's submission
 */
export const getPaymentAmount = (
  formPaymentFields: FormPaymentsField, // fields that are from document.form
  incomingSubmissionPaymentFields?: PaymentFieldsDto, // fields that are from incoming submission
  paymentProducts?: StorageModeSubmissionContentDto['paymentProducts'],
): number | undefined => {
  // legacy payment forms may not have a payment type
  const { payment_type } = formPaymentFields
  switch (payment_type) {
    case PaymentType.Fixed:
      return formPaymentFields.amount_cents
    case PaymentType.Variable:
      return incomingSubmissionPaymentFields?.amount_cents
    case PaymentType.Products:
      if (!paymentProducts) {
        return 0
      }
      return calculatePrice(paymentProducts)
    default: {
      // Force TS to emit an error if the cases above are not exhaustive
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = payment_type
    }
  }
}

/**
 * Retrieves payment description by payment_type
 *
 * - `Fixed Payments` references the description to as legacy behaviour
 * - `Variable Payments` references the name
 * - `Products` references the product name and quantity separated by a comma
 * @param form
 * @param paymentProducts
 */
export const getPaymentIntentDescription = (
  form: IPopulatedEncryptedForm,
  paymentProducts?: StorageModeSubmissionContentDto['paymentProducts'],
) => {
  const formPaymentFields = form.payments_field
  const { payment_type } = formPaymentFields
  switch (payment_type) {
    case PaymentType.Fixed:
      // legacy behaviour of fixed payments where the product name is referred as description
      return formPaymentFields.description
    case PaymentType.Variable:
      return formPaymentFields.name
    case PaymentType.Products: {
      if (!paymentProducts) return form.title
      const productDescriptions = paymentProducts
        .map((product) => `${product.data.name} x ${product.quantity}`)
        .join(', ')
      return productDescriptions
    }
    default: {
      // Force TS to emit an error if the cases above are not exhaustive
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const exhaustiveCheck: never = payment_type
    }
  }
}

const omitResponseKeys = (
  response: ProcessedFieldResponse,
):
  | ProcessedFieldResponse
  | ParsedClearFormFieldResponse
  | EncryptFormFieldResponse => {
  // We want to omit the isVisible property, as all fields are visible in the encrypted submission, making it redundant
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isVisible, ...rest } = response
  return rest
}

export const formatMyInfoStorageResponseData = (
  parsedResponses: ProcessedFieldResponse[],
) => {
  return parsedResponses.flatMap((response: ProcessedFieldResponse) => {
    return omitResponseKeys(response)
  })
}

export const getStripePaymentMethod = (
  form: IPopulatedEncryptedForm,
): Omit<Stripe.PaymentIntentCreateParams, 'amount' | 'currency'> => {
  const isPaynowOnly =
    form.payments_channel.payment_methods?.includes(PaymentMethodType.Paynow) &&
    form.payments_channel.payment_methods?.length === 1
  const stripePaynowOnly =
    form.payments_channel.channel === PaymentChannel.Stripe && isPaynowOnly

  if (stripePaynowOnly) {
    return {
      payment_method_types: ['paynow'],
    }
  }
  return {
    automatic_payment_methods: {
      enabled: true,
    },
  }
}
