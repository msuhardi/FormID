import { chain, left, right } from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'

import {
  isMobilePhoneNumber,
  startsWithIdPrefix,
} from '../../../../../shared/utils/phone-num-validation'
import {
  IMobileFieldSchema,
  OmitUnusedValidatorProps,
} from '../../../../types/field'
import { ResponseValidator } from '../../../../types/field/utils/validation'
import { ProcessedSingleAnswerResponse } from '../../../modules/submission/submission.types'

import { makeSignatureValidator, notEmptySingleAnswerResponse } from './common'

type MobileNoValidator = ResponseValidator<ProcessedSingleAnswerResponse>
type MobileNoValidatorConstructor = (
  mobileNumberField: OmitUnusedValidatorProps<IMobileFieldSchema>,
) => MobileNoValidator

/**
 * Returns a validator to check if mobile
 * number format is correct.
 */
const mobilePhoneNumberValidator: MobileNoValidator = (response) => {
  return isMobilePhoneNumber(response.answer)
    ? right(response)
    : left(`MobileNoValidator:\t answer is not a valid mobile phone number`)
}

/**
 * Returns a validator to check if mobile
 * number starts with singapore prefix.
 */
const idPrefixValidator: MobileNoValidator = (response) => {
  return startsWithIdPrefix(response.answer)
    ? right(response)
    : left(
        `MobileNoValidator:\t answer is not an ID number but intl numbers are not allowed`,
      )
}

/**
 * Returns a validator to check if mobile
 * number prefix is correct.
 */
const makePrefixValidator: MobileNoValidatorConstructor = (
  mobileNumberField,
) => {
  return mobileNumberField.allowIntlNumbers ? right : idPrefixValidator
}

/**
 * Constructs validator for mobile number field.
 */
export const constructMobileNoValidator: MobileNoValidatorConstructor = (
  mobileNumberField,
) =>
  flow(
    notEmptySingleAnswerResponse,
    chain(mobilePhoneNumberValidator),
    chain(makeSignatureValidator(mobileNumberField)),
    chain(makePrefixValidator(mobileNumberField)),
  )
