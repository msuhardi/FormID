import { ok } from 'neverthrow'

import {
  SubmissionErrorDto,
  SubmissionResponseDto,
} from '../../../../../shared/types'
import { ParsedEmailModeSubmissionBody } from '../../../../types/api'
import { createLoggerWithLabel } from '../../../config/logger'
import MailService from '../../../services/mail/mail.service'
import { createReqMeta } from '../../../utils/request'
import { ControllerHandler } from '../../core/core.types'
import { setFormTags } from '../../datadog/datadog.utils'
import * as FormService from '../../form/form.service'
import * as EmailSubmissionMiddleware from '../email-submission/email-submission.middleware'
import ParsedResponsesObject from '../ParsedResponsesObject.class'
import * as ReceiverMiddleware from '../receiver/receiver.middleware'
import * as SubmissionService from '../submission.service'
import {
  extractEmailConfirmationData,
  mapAttachmentsFromResponses,
} from '../submission.utils'
import { reportSubmissionResponseTime } from '../submissions.statsd-client'

import * as EmailSubmissionService from './email-submission.service'
import { IPopulatedEmailFormWithResponsesAndHash } from './email-submission.types'
import { mapRouteError, SubmissionEmailObj } from './email-submission.util'

const logger = createLoggerWithLabel(module)

const submitEmailModeForm: ControllerHandler<
  { formId: string },
  SubmissionResponseDto | SubmissionErrorDto,
  ParsedEmailModeSubmissionBody,
  { captchaResponse?: unknown; captchaType?: unknown }
> = async (req, res) => {
  const { formId } = req.params
  const attachments = mapAttachmentsFromResponses(req.body.responses)

  if ('isPreview' in req.body) {
    logger.info({
      message: 'isPreview is still being sent when submitting email mode form',
      meta: {
        action: 'submitEmailModeForm',
        type: 'deprecatedCheck',
        formId,
      },
    })
  }

  const logMeta = {
    action: 'handleEmailSubmission',
    ...createReqMeta(req),
    formId,
  }

  return (
    // Retrieve form
    FormService.retrieveFullFormById(formId)
      .mapErr((error) => {
        logger.error({
          message: 'Error while retrieving form from database',
          meta: logMeta,
          error,
        })
        return error
      })
      .andThen((form) => {
        setFormTags(form)

        return EmailSubmissionService.checkFormIsEmailMode(form).mapErr(
          (error) => {
            logger.warn({
              message: 'Attempt to submit non-email-mode form',
              meta: logMeta,
              error,
            })
            return error
          },
        )
      })
      .andThen((form) =>
        // Check that form is public
        // If it is, pass through and return the original form
        FormService.isFormPublic(form)
          .map(() => form)
          .mapErr((error) => {
            logger.warn({
              message: 'Attempt to submit non-public form',
              meta: logMeta,
              error,
            })
            return error
          }),
      )
      .andThen((form) =>
        // Check that the form has not reached submission limits
        FormService.checkFormSubmissionLimitAndDeactivateForm(form)
          .map(() => form)
          .mapErr((error) => {
            logger.warn({
              message:
                'Attempt to submit form which has just reached submission limits',
              meta: logMeta,
              error,
            })
            return error
          }),
      )
      .andThen((form) =>
        // Validate responses
        SubmissionService.validateAttachments(
          req.body.responses,
          form.responseMode,
        )
          .andThen(() =>
            ParsedResponsesObject.parseResponses(form, req.body.responses),
          )
          .map((parsedResponses) => ({ parsedResponses, form }))
          .mapErr((error) => {
            logger.error({
              message: 'Error processing responses',
              meta: logMeta,
              error,
            })
            return error
          }),
      )
      .andThen(({ parsedResponses, form }) => {
        return ok<IPopulatedEmailFormWithResponsesAndHash, never>({
          form,
          parsedResponses,
        })
      })
      .andThen(({ form, parsedResponses }) => {
        // Create data for response email as well as email confirmation
        const emailData = new SubmissionEmailObj(
          parsedResponses.getAllResponses(),
          form.authType,
        )

        // Get response metadata from the request body
        const { responseMetadata } = req.body

        // Save submission to database
        return EmailSubmissionService.hashSubmission(
          emailData.formData,
          attachments,
        )
          .andThen((submissionHash) =>
            EmailSubmissionService.saveSubmissionMetadata(
              form,
              submissionHash,
              responseMetadata,
            ),
          )
          .map((submission) => ({
            form,
            parsedResponses,
            submission,
            emailData,
            responseMetadata,
          }))
          .mapErr((error) => {
            logger.error({
              message: 'Error while saving metadata to database',
              meta: logMeta,
              error,
            })
            return error
          })
      })
      .andThen(
        ({
          form,
          parsedResponses,
          submission,
          emailData,
          responseMetadata,
        }) => {
          const logMetaWithSubmission = {
            ...logMeta,
            submissionId: submission._id,
            responseMetadata,
          }

          logger.info({
            message: 'Sending admin mail',
            meta: logMetaWithSubmission,
          })

          // TODO 6395 make responseMetadata mandatory
          if (responseMetadata) {
            reportSubmissionResponseTime(responseMetadata, {
              mode: 'email',
            })
          }
          // Send response to admin
          // NOTE: This should short circuit in the event of an error.
          // This is why sendSubmissionToAdmin is separated from sendEmailConfirmations in 2 blocks
          return MailService.sendSubmissionToAdmin({
            replyToEmails: EmailSubmissionService.extractEmailAnswers(
              parsedResponses.getAllResponses(),
            ),
            form,
            submission,
            attachments,
            dataCollationData: emailData.dataCollationData,
            formData: emailData.formData,
          })
            .map(() => ({
              form,
              parsedResponses,
              submission,
              emailData,
              logMetaWithSubmission,
            }))
            .mapErr((error) => {
              logger.error({
                message: 'Error sending submission to admin',
                meta: logMetaWithSubmission,
                error,
              })
              return error
            })
        },
      )
      .map(
        ({
          form,
          parsedResponses,
          submission,
          emailData,
          logMetaWithSubmission,
        }) => {
          // Send email confirmations
          void SubmissionService.sendEmailConfirmations({
            form,
            submission,
            attachments,
            responsesData: emailData.autoReplyData,
            recipientData: extractEmailConfirmationData(
              parsedResponses.getAllResponses(),
              form.form_fields,
            ),
          }).mapErr((error) => {
            // NOTE: MyInfo access token is not cleared here.
            // This is because if the reason for failure is not on the users' end,
            // they should not be randomly signed out.
            logger.error({
              message: 'Error while sending email confirmations',
              meta: logMetaWithSubmission,
              error,
            })
          })
          // MyInfo access token is single-use, so clear it
          // Similarly for sgID-MyInfo
          return res.json({
            // Return the reply early to the submitter
            message: 'Form submission successful.',
            submissionId: submission.id,
            timestamp: (submission.created || new Date()).getTime(),
          })
        },
      )
      .mapErr((error) => {
        const { errorMessage, statusCode } = mapRouteError(error)
        return res.status(statusCode).json({ message: errorMessage })
      })
  )
}

export const handleEmailSubmission = [
  ReceiverMiddleware.receiveEmailSubmission,
  EmailSubmissionMiddleware.validateResponseParams,
  submitEmailModeForm,
] as ControllerHandler[]
