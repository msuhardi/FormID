import { celebrate, Joi, Segments } from 'celebrate'
import { StatusCodes } from 'http-status-codes'
import { err, ok } from 'neverthrow'
import { UnreachableCaseError } from 'ts-essentials'

import {
  ErrorDto,
  FormAuthType,
  PrivateFormErrorDto,
  PublicFormAuthLogoutDto,
  PublicFormAuthRedirectDto,
  PublicFormDto,
  PublicFormViewDto,
} from '../../../../../shared/types'
import { createLoggerWithLabel } from '../../../config/logger'
import { isMongoError } from '../../../utils/handle-mongo-error'
import { createReqMeta, getRequestIp } from '../../../utils/request'
import { getFormIfPublic } from '../../auth/auth.service'
import { ControllerHandler } from '../../core/core.types'
import {
  SGID_CODE_VERIFIER_COOKIE_NAME,
  SGID_COOKIE_NAME,
} from '../../sgid/sgid.constants'
import { SgidInvalidJwtError, SgidVerifyJwtError } from '../../sgid/sgid.errors'
import { SgidService } from '../../sgid/sgid.service'
import { validateSgidForm } from '../../sgid/sgid.util'
import { InvalidJwtError, VerifyJwtError } from '../../spcp/spcp.errors'
import { getOidcService } from '../../spcp/spcp.oidc.service'
import {
  getRedirectTargetSpcpOidc,
  validateSpcpForm,
} from '../../spcp/spcp.util'
import { AuthTypeMismatchError, PrivateFormError } from '../form.errors'
import * as FormService from '../form.service'

import * as PublicFormService from './public-form.service'
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
    case FormAuthType.SP:
      return getOidcService(FormAuthType.SP)
        .extractJwtPayloadFromRequest(req.cookies)
        .map((spcpSession) => {
          return res.json({
            form: publicForm,
            isIntranetUser,
            spcpSession,
          })
        })
        .mapErr((error) => {
          // Report only relevant errors - verification failed for user here
          if (
            error instanceof VerifyJwtError ||
            error instanceof InvalidJwtError
          ) {
            logger.error({
              message: 'Error getting public form',
              meta: logMeta,
              error,
            })
          }
          return res.json({ form: publicForm, isIntranetUser })
        })
    case FormAuthType.CP:
      return getOidcService(FormAuthType.CP)
        .extractJwtPayloadFromRequest(req.cookies)
        .map((spcpSession) => {
          return res.json({
            form: publicForm,
            isIntranetUser,
            spcpSession,
          })
        })
        .mapErr((error) => {
          // Report only relevant errors - verification failed for user here
          if (
            error instanceof VerifyJwtError ||
            error instanceof InvalidJwtError
          ) {
            logger.error({
              message: 'Error getting public form',
              meta: logMeta,
              error,
            })
          }
          return res.json({ form: publicForm, isIntranetUser })
        })
    case FormAuthType.SGID:
      return SgidService.extractSgidSingpassJwtPayload(
        req.cookies[SGID_COOKIE_NAME],
      )
        .map((spcpSession) => {
          return res.json({
            form: publicForm,
            isIntranetUser,
            spcpSession,
          })
        })
        .mapErr((error) => {
          // Report only relevant errors - verification failed for user here
          if (
            error instanceof SgidVerifyJwtError ||
            error instanceof SgidInvalidJwtError
          ) {
            logger.error({
              message: 'Error getting public form',
              meta: logMeta,
              error,
            })
          }
          return res.json({ form: publicForm, isIntranetUser })
        })
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
  const { isPersistentLogin, encodedQuery } = req.query
  const logMeta = {
    action: 'handleFormAuthRedirect',
    ...createReqMeta(req),
    formId,
  }

  let formAuthType: FormAuthType
  // NOTE: Using retrieveFullForm instead of retrieveForm to ensure authType always exists
  return FormService.retrieveFullFormById(formId)
    .andThen((form) => {
      formAuthType = form.authType
      switch (form.authType) {
        case FormAuthType.SP: {
          return validateSpcpForm(form).asyncAndThen((form) => {
            const target = getRedirectTargetSpcpOidc(
              formId,
              FormAuthType.SP,
              isPersistentLogin,
              encodedQuery,
            )
            return getOidcService(FormAuthType.SP).createRedirectUrl(
              target,
              form.esrvcId,
            )
          })
        }
        case FormAuthType.CP: {
          // NOTE: Persistent login is only set (and relevant) when the authType is SP.
          // If authType is not SP, assume that it was set erroneously and default it to false
          return validateSpcpForm(form).asyncAndThen((form) => {
            const target = getRedirectTargetSpcpOidc(
              formId,
              FormAuthType.CP,
              isPersistentLogin,
              encodedQuery,
            )
            return getOidcService(FormAuthType.CP).createRedirectUrl(
              target,
              form.esrvcId,
            )
          })
        }
        case FormAuthType.SGID:
          return validateSgidForm(form)
            .andThen(() =>
              SgidService.createRedirectUrl(
                formId,
                Boolean(isPersistentLogin),
                [],
                encodedQuery,
              ),
            )
            .andThen(({ redirectUrl, codeVerifier }) => {
              res.cookie(
                SGID_CODE_VERIFIER_COOKIE_NAME,
                codeVerifier,
                SgidService.getCookieSettings(),
              )
              return ok(redirectUrl)
            })
        default:
          return err<never, AuthTypeMismatchError>(
            new AuthTypeMismatchError(form.authType),
          )
      }
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
      res.clearCookie(SGID_CODE_VERIFIER_COOKIE_NAME)
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

/**
 * NOTE: This is exported only for testing
 * Logs user out of SP / CP / SGID by deleting cookie
 * @param authType type of authentication
 *
 * @returns 200 with success message when user logs out successfully
 * @returns 400 if authType is invalid
 */
export const _handlePublicAuthLogout: ControllerHandler<
  {
    authType: FormAuthType.SP | FormAuthType.CP | FormAuthType.SGID
  },
  PublicFormAuthLogoutDto
> = (req, res) => {
  const { authType } = req.params

  const cookieName = PublicFormService.getCookieNameByAuthType(authType)

  return res
    .clearCookie(cookieName)
    .status(200)
    .json({ message: 'Successfully logged out.' })
}

/**
 * Handler for /forms/auth/:authType/logout
 * Valid AuthTypes are SP / CP / SGID
 */
export const handlePublicAuthLogout = [
  celebrate({
    [Segments.PARAMS]: Joi.object({
      authType: Joi.string()
        .valid(FormAuthType.SP, FormAuthType.CP, FormAuthType.SGID)
        .required(),
    }),
  }),
  _handlePublicAuthLogout,
] as ControllerHandler[]
