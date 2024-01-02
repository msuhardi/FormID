import { chain, left, right } from 'fp-ts/lib/Either'
import { flow } from 'fp-ts/lib/function'

import {
  IDropdownFieldSchema,
  OmitUnusedValidatorProps,
} from '../../../../types/field'
import { ResponseValidator } from '../../../../types/field/utils/validation'
import { ProcessedSingleAnswerResponse } from '../../../modules/submission/submission.types'

import { notEmptySingleAnswerResponse } from './common'
import { isOneOfOptions } from './options'

type DropdownValidator = ResponseValidator<ProcessedSingleAnswerResponse>
type DropdownValidatorConstructor = (
  dropdownField: OmitUnusedValidatorProps<IDropdownFieldSchema>,
) => DropdownValidator

/**
 * Returns a validation function
 * to check if dropdown selection is one of the options.
 */
const makeDropdownValidator: DropdownValidatorConstructor =
  (dropdownField) => (response) => {
    const { fieldOptions } = dropdownField
    const validOptions = fieldOptions.map((opt) => opt.trim())
    const { answer } = response
    const trimmedAnswer = answer.trim()
    return isOneOfOptions(validOptions, trimmedAnswer)
      ? right(response)
      : left(`DropdownValidator:\t answer is not a valid dropdown option`)
  }

/**
 * Returns a validation function for a dropdown field when called.
 */
export const constructDropdownValidator: DropdownValidatorConstructor = (
  dropdownField,
) =>
  flow(
    notEmptySingleAnswerResponse,
    chain(makeDropdownValidator(dropdownField)),
  )
