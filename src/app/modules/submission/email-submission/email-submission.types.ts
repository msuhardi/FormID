import { ResponseMetadata } from 'shared/types'

import { FieldResponse, IPopulatedEmailForm } from '../../../../types'
import ParsedResponsesObject from '../ParsedResponsesObject.class'
import { ProcessedResponse } from '../submission.types'

// When a response has been formatted for email, all answerArray
// should have been converted to answer
export type ResponseFormattedForEmail = Omit<FieldResponse, 'answerArray'> & {
  answer: string
} & ProcessedResponse

export interface ParsedMultipartForm {
  responses: FieldResponse[]
  responseMetadata: ResponseMetadata
}

export interface SubmissionHash {
  hash: string
  salt: string
}

export interface IPopulatedEmailFormWithResponsesAndHash {
  form: IPopulatedEmailForm
  parsedResponses: ParsedResponsesObject
}

export interface IPopulatedStorageFormWithResponsesAndHash {
  parsedResponses: ParsedResponsesObject
}
