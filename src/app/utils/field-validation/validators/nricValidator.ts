import { chain, left, right } from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'

import { isValidNik } from '../../../../../frontend/src/utils/nikValidation'
import { ResponseValidator } from '../../../../types/field/utils/validation'
import { ProcessedSingleAnswerResponse } from '../../../modules/submission/submission.types'

import { notEmptySingleAnswerResponse } from './common'

type NricValidator = ResponseValidator<ProcessedSingleAnswerResponse>
type NricValidatorConstructor = () => NricValidator

/**
 * Returns a validator to check if nric
 * format is correct.
 */
const nricValidator: NricValidator = (response) => {
  return isValidNik(response.answer)
    ? right(response)
    : left(`NikValidator:\tanswer is not a valid NIK`)
}

/**
 * Returns a validation function for a nric field when called.
 */
export const constructNricValidator: NricValidatorConstructor = () =>
  flow(notEmptySingleAnswerResponse, chain(nricValidator))
