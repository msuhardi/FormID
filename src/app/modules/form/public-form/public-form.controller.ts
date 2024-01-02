import { celebrate, Joi, Segments } from 'celebrate'
import { StatusCodes } from 'http-status-codes'
import { err } from 'neverthrow'
import { UnreachableCaseError } from 'ts-essentials'

import {
  ErrorDto,
  FormAuthType,
  PrivateFormErrorDto,
  PublicFormAuthRedirectDto,
  PublicFormDto,
  PublicFormViewDto,
} from '../../../../../shared/types'
import { createLoggerWithLabel } from '../../../config/logger'
import { isMongoError } from '../../../utils/handle-mongo-error'
import { createReqMeta, getRequestIp } from '../../../utils/request'
import { getFormIfPublic } from '../../auth/auth.service'
import { ControllerHandler } from '../../core/core.types'
import { AuthTypeMismatchError, PrivateFormError } from '../form.errors'
import * as FormService from '../form.service'

import { mapFormAuthError, mapRouteError } from './public-form.utils'

const logger = createLoggerWithLabel(module)

/**
 * Handler for GET /:formId/publicform endpoint
 * @returns 200 if the form exists
 * @returns 404 if form with formId does not exist or is private
 * @returns 410 if form has been archived
 * @returns 500 if database error occurs or if the type of error is unknown
 */
export const handleGetPublicForm: ControllerHandler<
  { formId: string },
  PublicFormViewDto | ErrorDto | PrivateFormErrorDto
> = async (req, res) => {
  const { formId } = req.params
  const logMeta = {
    action: 'handleGetPublicForm',
    ...createReqMeta(req),
    formId,
  }

  const formResult = await getFormIfPublic(formId).andThen((form) =>
    FormService.checkFormSubmissionLimitAndDeactivateForm(form),
  )

  // Early return if form is not public or any error occurred.
  if (formResult.isErr()) {
    const { error } = formResult
    // NOTE: Only log on possible database errors.
    // This is because the other kinds of errors are expected errors and are not truly exceptional
    if (isMongoError(error)) {
      logger.error({
        message: 'Error retrieving public form',
        meta: logMeta,
        error,
      })
    }
    const { errorMessage, statusCode } = mapRouteError(error)

    // Specialized error response for PrivateFormError.
    // This is to maintain backwards compatibility with the middleware implementation
    if (error instanceof PrivateFormError) {
      return res.status(statusCode).json({
        message: error.message,
        // Flag to prevent default 404 subtext ("please check link") from
        // showing.
        isPageFound: true,
        formTitle: error.formTitle,
      })
    }

    return res.status(statusCode).json({ message: errorMessage })
  }

  const form = formResult.value
  const publicForm = form.getPublicView() as PublicFormDto

  const { authType } = form
  const isIntranetUser = FormService.checkIsIntranetFormAccess(
    getRequestIp(req),
    form,
  )

  switch (authType) {
    case FormAuthType.NIL:
      return res.json({ form: publicForm, isIntranetUser })
    default:
      return new UnreachableCaseError(authType)
  }
}

export const handleGetPublicFormSampleSubmission: ControllerHandler<
  { formId: string },
  Record<string, any> | ErrorDto | PrivateFormErrorDto
> = async (req, res) => {
  const { formId } = req.params
  const logMeta = {
    action: 'handleGetPublicFormSampleSubmission',
    ...createReqMeta(req),
    formId,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formResult = await getFormIfPublic(formId)
  // Early return if form is not public or any error occurred.
  if (formResult.isErr()) {
    const { error } = formResult
    // NOTE: Only log on possible database errors.
    // This is because the other kinds of errors are expected errors and are not truly exceptional
    if (isMongoError(error)) {
      logger.error({
        message: 'Error retrieving public form',
        meta: logMeta,
        error,
      })
    }
    const { errorMessage, statusCode } = mapRouteError(error)

    // Specialized error response for PrivateFormError.
    // This is to maintain backwards compatibility with the middleware implementation
    if (error instanceof PrivateFormError) {
      return res.status(statusCode).json({
        message: error.message,
        // Flag to prevent default 404 subtext ("please check link") from
        // showing.
        isPageFound: true,
        formTitle: error.formTitle,
      })
    }

    return res.status(statusCode).json({ message: errorMessage })
  }
  const form = formResult.value

  const publicForm = form.getPublicView() as PublicFormDto

  const formFields = publicForm.form_fields
  if (!formFields) {
    throw new Error('unable to get form fields')
  }

  const sampleData = FormService.createSampleSubmissionResponses(formFields)

  return res.json({ responses: sampleData })
}
/**
 * NOTE: This is exported only for testing
 * Generates redirect URL to Official SingPass/CorpPass log in page
 * @param isPersistentLogin whether the client wants to have their login information stored
 * @param encodedQuery base64 encoded queryId for frontend to retrieve stored query params (usually contains prefilled form information)
 * @returns 200 with the redirect url when the user authenticates successfully
 * @returns 400 when there is an error on the authType of the form
 * @returns 400 when the eServiceId of the form does not exist
 * @returns 404 when form with given ID does not exist
 * @returns 500 when database error occurs
 * @returns 500 when the redirect url could not be created
 * @returns 500 when the redirect feature is not enabled
 */
export const _handleFormAuthRedirect: ControllerHandler<
  { formId: string },
  PublicFormAuthRedirectDto | ErrorDto,
  unknown,
  { isPersistentLogin?: boolean; encodedQuery?: string }
> = (req, res) => {
  const { formId } = req.params
  const logMeta = {
    action: 'handleFormAuthRedirect',
    ...createReqMeta(req),
    formId,
  }

  let formAuthType: FormAuthType
  // NOTE: Using retrieveFullForm instead of retrieveForm to ensure authType always exists
  return FormService.retrieveFullFormById(formId)
    .andThen((form) => {
      return err<never, AuthTypeMismatchError>(
        new AuthTypeMismatchError(form.authType),
      )
    })
    .map((redirectURL) => {
      logger.info({
        message: 'Redirecting user to login page',
        meta: {
          redirectURL,
          formAuthType,
          ...logMeta,
        },
      })
      return res.status(StatusCodes.OK).json({ redirectURL })
    })
    .mapErr((error) => {
      logger.error({
        message: 'Error while creating redirect URL',
        meta: {
          formAuthType,
          ...logMeta,
        },
        error,
      })
      const { statusCode, errorMessage } = mapFormAuthError(error)
      return res.status(statusCode).json({ message: errorMessage })
    })
}

/**
 * Handler for /forms/:formId/auth/redirect
 */
export const handleFormAuthRedirect = [
  celebrate({
    [Segments.PARAMS]: Joi.object({
      formId: Joi.string().pattern(/^[a-fA-F0-9]{24}$/),
    }),
    [Segments.QUERY]: Joi.object({
      isPersistentLogin: Joi.boolean().optional(),
      encodedQuery: Joi.string().allow('').optional(),
    }),
  }),
  _handleFormAuthRedirect,
] as ControllerHandler[]
