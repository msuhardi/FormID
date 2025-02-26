import { PresignedPost } from 'aws-sdk/clients/s3'
import axios from 'axios'

import {
  ENCRYPTION_BOUNDARY_SHIFT_SUBMISSION_VERSION,
  VIRUS_SCANNER_SUBMISSION_VERSION,
} from '~shared/constants'
import { SubmitFormIssueBodyDto, SuccessMessageDto } from '~shared/types'
import {
  AttachmentPresignedPostDataMapType,
  AttachmentSizeMapType,
  FormFieldDto,
  PaymentFieldsDto,
} from '~shared/types/field'
import {
  ProductItem,
  PublicFormAuthLogoutDto,
  PublicFormAuthRedirectDto,
  SubmitFormFeedbackBodyDto,
} from '~shared/types/form'
import {
  FormAuthType,
  FormDto,
  PublicFormViewDto,
} from '~shared/types/form/form'
import {
  ResponseMetadata,
  SubmissionResponseDto,
} from '~shared/types/submission'

import { transformAllIsoStringsToDate } from '~utils/date'
import {
  API_BASE_URL,
  ApiService,
  processFetchResponse,
} from '~services/ApiService'
import { FormFieldValues } from '~templates/Field'

import {
  createClearSubmissionFormData,
  createClearSubmissionWithVirusScanningFormData,
  getAttachmentsMap,
} from './utils/createSubmission'
import { filterHiddenInputs } from './utils/filterHiddenInputs'

export const PUBLIC_FORMS_ENDPOINT = '/forms'

/**
 * Gets public view of form, along with any
 * identify information obtained from Singpass/Corppass/MyInfo.
 * @param formId FormId of form in question
 * @returns Public view of form, with additional identify information
 */
export const getPublicFormView = async (
  formId: string,
): Promise<PublicFormViewDto> => {
  return ApiService.get<PublicFormViewDto>(`${PUBLIC_FORMS_ENDPOINT}/${formId}`)
    .then(({ data }) => data)
    .then(transformAllIsoStringsToDate)
}

/**
 * Gets the redirect url for public form login
 * @param formId form id of form to log in.
 * @param isPersistentLogin whether login is persistent; affects cookie lifetime.
 * @returns redirect url for public form login
 */
export const getPublicFormAuthRedirectUrl = async (
  formId: string,
  isPersistentLogin = false,
  encodedQuery?: string,
): Promise<PublicFormAuthRedirectDto['redirectURL']> => {
  return ApiService.get<PublicFormAuthRedirectDto>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/auth/redirect`,
    { params: { encodedQuery, isPersistentLogin } },
  ).then(({ data }) => data.redirectURL)
}

/**
 * Logs out of current public form session
 * @param authType authType of form to log out.
 * @returns Success message
 */
export const logoutPublicForm = async (
  authType: Exclude<FormAuthType, FormAuthType.NIL>,
): Promise<PublicFormAuthLogoutDto> => {
  return ApiService.get<PublicFormAuthLogoutDto>(
    `${PUBLIC_FORMS_ENDPOINT}/auth/${authType}/logout`,
  ).then(({ data }) => data)
}

export type SubmitEmailFormArgs = {
  formId: string
  captchaResponse?: string | null
  captchaType?: string
  formFields: FormFieldDto[]
  formLogics: FormDto['form_logics']
  formInputs: FormFieldValues
  responseMetadata?: ResponseMetadata
}

export type SubmitStorageFormArgs = SubmitEmailFormArgs & {
  publicKey: string
  paymentReceiptEmail?: string
  paymentProducts?: Array<ProductItem>
  payments?: PaymentFieldsDto
}

export type SubmitStorageFormClearArgs = SubmitEmailFormArgs & {
  paymentReceiptEmail?: string
  paymentProducts?: Array<ProductItem>
  payments?: PaymentFieldsDto
}

export type FieldIdToQuarantineKeyType = {
  fieldId: string
  quarantineBucketKey: string
}

export type SubmitStorageFormWithVirusScanningArgs =
  SubmitStorageFormClearArgs & {
    fieldIdToQuarantineKeyMap: FieldIdToQuarantineKeyType[]
  }

export const submitEmailModeForm = async ({
  formFields,
  formLogics,
  formInputs,
  formId,
  responseMetadata,
}: SubmitEmailFormArgs): Promise<SubmissionResponseDto> => {
  const filteredInputs = filterHiddenInputs({
    formFields,
    formInputs,
    formLogics,
  })
  const formData = createClearSubmissionFormData({
    formFields,
    formInputs: filteredInputs,
    responseMetadata,
  })

  console.log('submitEmailModeForm', formFields, formInputs, formData)

  return ApiService.post<SubmissionResponseDto>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/email`,
    formData,
  ).then(({ data }) => data)
}

export const submitStorageModeClearForm = async ({
  formFields,
  formLogics,
  formInputs,
  formId,
  captchaResponse = null,
  captchaType = '',
  paymentReceiptEmail,
  responseMetadata,
  paymentProducts,
  payments,
}: SubmitStorageFormClearArgs) => {
  const filteredInputs = filterHiddenInputs({
    formFields,
    formInputs,
    formLogics,
  })

  const formData = createClearSubmissionFormData({
    formFields,
    formInputs: filteredInputs,
    responseMetadata,
    paymentReceiptEmail,
    paymentProducts,
    payments,
    version: ENCRYPTION_BOUNDARY_SHIFT_SUBMISSION_VERSION,
  })

  return ApiService.post<SubmissionResponseDto>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/storage`,
    formData,
    {
      params: {
        captchaResponse: String(captchaResponse),
        captchaType: captchaType,
      },
    },
  ).then(({ data }) => data)
}

// TODO (#5826): Fallback mutation using Fetch. Remove once network error is resolved
export const submitStorageModeClearFormWithFetch = async ({
  formFields,
  formLogics,
  formInputs,
  formId,
  captchaResponse = null,
  captchaType = '',
  paymentReceiptEmail,
  responseMetadata,
  paymentProducts,
  payments,
}: SubmitStorageFormClearArgs) => {
  const filteredInputs = filterHiddenInputs({
    formFields,
    formInputs,
    formLogics,
  })

  const formData = createClearSubmissionFormData({
    formFields,
    formInputs: filteredInputs,
    responseMetadata,
    paymentReceiptEmail,
    paymentProducts,
    payments,
    version: ENCRYPTION_BOUNDARY_SHIFT_SUBMISSION_VERSION,
  })

  // Add captcha response to query string
  const queryString = new URLSearchParams({
    captchaResponse: String(captchaResponse),
    captchaType,
  }).toString()

  const response = await fetch(
    `${API_BASE_URL}${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/storage?${queryString}`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    },
  )

  return processFetchResponse(response)
}

// Submit storage mode form with virus scanning (storage v2.1+)
export const submitStorageModeClearFormWithVirusScanning = async ({
  formFields,
  formLogics,
  formInputs,
  formId,
  captchaResponse = null,
  captchaType = '',
  paymentReceiptEmail,
  responseMetadata,
  paymentProducts,
  payments,
  fieldIdToQuarantineKeyMap,
}: SubmitStorageFormWithVirusScanningArgs) => {
  const filteredInputs = filterHiddenInputs({
    formFields,
    formInputs,
    formLogics,
  })

  const formData = createClearSubmissionWithVirusScanningFormData(
    {
      formFields,
      formInputs: filteredInputs,
      responseMetadata,
      paymentReceiptEmail,
      paymentProducts,
      payments,
      version: VIRUS_SCANNER_SUBMISSION_VERSION,
    },
    fieldIdToQuarantineKeyMap,
  )

  return ApiService.post<SubmissionResponseDto>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/storage`,
    formData,
    {
      params: {
        captchaResponse: String(captchaResponse),
        captchaType: captchaType,
      },
    },
  ).then(({ data }) => data)
}

// TODO (#5826): Fallback mutation using Fetch. Remove once network error is resolved
export const submitEmailModeFormWithFetch = async ({
  formFields,
  formLogics,
  formInputs,
  formId,
  captchaResponse = null,
  captchaType = '',
  responseMetadata,
}: SubmitEmailFormArgs): Promise<SubmissionResponseDto> => {
  const filteredInputs = filterHiddenInputs({
    formFields,
    formInputs,
    formLogics,
  })
  const formData = createClearSubmissionFormData({
    formFields,
    formInputs: filteredInputs,
    responseMetadata,
  })

  // Add captcha response to query string
  const queryString = new URLSearchParams({
    captchaResponse: String(captchaResponse),
    captchaType,
  }).toString()

  const response = await fetch(
    `${API_BASE_URL}${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/email?${queryString}`,
    {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    },
  )

  return processFetchResponse(response)
}

/**
 * Post feedback for a given form.
 * @param formId the id of the form to post feedback for
 * @param submissionId the id of the form submission to post feedback for
 * @param feedbackToPost object containing the feedback
 * @returns success message
 */
export const submitFormFeedback = async (
  formId: string,
  submissionId: string,
  feedbackToPost: SubmitFormFeedbackBodyDto,
): Promise<SuccessMessageDto> => {
  return ApiService.post<SuccessMessageDto>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/${submissionId}/feedback`,
    feedbackToPost,
  ).then(({ data }) => data)
}

/**
 * Post issue for a given form.
 * @param formId the id of the form to post feedback for
 * @param issueToPost object containing the issue
 * @returns success message
 */
export const submitFormIssue = async (
  formId: string,
  issueToPost: SubmitFormIssueBodyDto,
): Promise<SuccessMessageDto> => {
  return ApiService.post<SuccessMessageDto>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/issue`,
    issueToPost,
  ).then(({ data }) => data)
}

export const getAttachmentSizes = async ({
  formFields,
  formInputs,
}: {
  formFields: FormFieldDto[]
  formInputs: FormFieldValues
}) => {
  const attachmentsMap = getAttachmentsMap(formFields, formInputs)
  const attachmentSizes: AttachmentSizeMapType[] = []
  for (const id in attachmentsMap) {
    // Check if id is a valid ObjectId. mongoose.isValidaObjectId cannot be used as it will throw a Reference Error.
    const isValidObjectId = new RegExp(/^[0-9a-fA-F]{24}$/).test(id)
    if (!isValidObjectId) throw new Error(`Invalid attachment id: ${id}`)
    attachmentSizes.push({ id, size: attachmentsMap[id].size })
  }
  return attachmentSizes
}

/**
 * Get presigned post data for attachments.
 * @returns presigned post data for attachments.
 */
export const getAttachmentPresignedPostData = async ({
  attachmentSizes,
  formId,
}: {
  attachmentSizes: AttachmentSizeMapType[]
  formId: string
}) => {
  return ApiService.post<AttachmentPresignedPostDataMapType[]>(
    `${PUBLIC_FORMS_ENDPOINT}/${formId}/submissions/storage/get-s3-presigned-post-data`,
    attachmentSizes,
  ).then(({ data }) => data)
}

export const uploadAttachmentToQuarantine = async (
  presignedPost: PresignedPost,
  file: File,
) => {
  return await axios.postForm(presignedPost.url, {
    ...presignedPost.fields,
    file,
  })
}
