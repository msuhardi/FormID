/**
 * This utility file creates validation rules for `react-hook-form` according
 * to the field schema.
 */
import { RegisterOptions } from 'react-hook-form'
import { isValid, parse } from 'date-fns'
import i18n from 'i18next'
import { identity } from 'lodash'
import simplur from 'simplur'
import validator from 'validator'

import { DATE_PARSE_FORMAT } from '~shared/constants/dates'
import {
  AttachmentFieldBase,
  BasicField,
  CheckboxFieldBase,
  ChildrenCompoundFieldBase,
  DateFieldBase,
  DateSelectedValidation,
  DecimalFieldBase,
  DropdownFieldBase,
  EmailFieldBase,
  FieldBase,
  HomenoFieldBase,
  LongTextFieldBase,
  MobileFieldBase,
  NricFieldBase,
  NumberFieldBase,
  NumberSelectedLengthValidation,
  NumberSelectedValidation,
  RadioFieldBase,
  RatingFieldBase,
  ShortTextFieldBase,
  TextSelectedValidation,
} from '~shared/types/field'
import { isDateAnInvalidDay } from '~shared/utils/date-validation'
import { isValidNik } from '~shared/utils/nikValidation'
import {
  isHomePhoneNumber,
  isMobilePhoneNumber,
} from '~shared/utils/phone-num-validation'

import {
  INVALID_COUNTRY_REGION_OPTION_ERROR,
  INVALID_DROPDOWN_OPTION_ERROR,
  INVALID_EMAIL_DOMAIN_ERROR,
  INVALID_EMAIL_ERROR,
  REQUIRED_ERROR,
} from '~constants/validation'
import {
  CheckboxFieldValues,
  SingleAnswerValue,
  VerifiableFieldValues,
} from '~templates/Field/types'

import { VerifiableFieldBase } from '~features/verifiable-fields/types'

import {
  isDateAfterToday,
  isDateBeforeToday,
  isDateOutOfRange,
  loadDateFromNormalizedDate,
} from './date'
import { formatNumberToLocaleString } from './stringFormat'

// Omit unused props
type MinimumFieldValidationProps<T extends FieldBase> = Omit<
  T,
  'fieldType' | 'description' | 'disabled'
>

// fieldType is only used in email and mobile field verification, so we don't omit it
type MinimumFieldValidationPropsEmailAndMobile<T extends FieldBase> = Omit<
  T,
  'description' | 'disabled'
>

type ValidationRuleFn<T extends FieldBase = FieldBase> = (
  schema: MinimumFieldValidationProps<T>,
) => RegisterOptions

type ValidationRuleFnEmailAndMobile<T extends FieldBase = FieldBase> = (
  schema: MinimumFieldValidationPropsEmailAndMobile<T>,
) => RegisterOptions

const requiredSingleAnswerValidationFn =
  (schema: Pick<FieldBase, 'required'>) => (value?: SingleAnswerValue) => {
    if (!schema.required) return true
    return !!value?.trim() || REQUIRED_ERROR
  }

/**
 * Validation rules for verifiable fields.
 * @param schema verifiable field schema
 * @returns base verifiable fields' validation rules
 */
const createBaseVfnFieldValidationRules: ValidationRuleFnEmailAndMobile<
  VerifiableFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: {
      required: (value?: VerifiableFieldValues) => {
        return requiredSingleAnswerValidationFn(schema)(value?.value)
      },
      hasSignature: (val?: VerifiableFieldValues) => {
        if (!schema.isVerifiable) return true
        // Either signature is filled, or both fields have no input.
        if (!!val?.signature || (!val?.value && !val?.signature)) {
          return true
        }
        if (schema.fieldType === BasicField.Mobile) {
          return i18n.t(
            'features.common.errors.validation.mobileNoVerification',
          )
        }
        if (schema.fieldType === BasicField.Email) {
          return i18n.t('features.common.errors.validation.emailVerification')
        }
      },
    },
  }
}

export const createBaseValidationRules = (
  schema: Pick<FieldBase, 'required'>,
): RegisterOptions => {
  return {
    validate: requiredSingleAnswerValidationFn(schema),
  }
}

export const createDropdownValidationRules: ValidationRuleFn<
  DropdownFieldBase
> = (schema): RegisterOptions => {
  return createDropdownValidationRulesWithCustomErrorMessage(
    INVALID_DROPDOWN_OPTION_ERROR,
  )(schema)
}

export const createCountryRegionValidationRules: ValidationRuleFn<
  DropdownFieldBase
> = (schema): RegisterOptions => {
  return createDropdownValidationRulesWithCustomErrorMessage(
    INVALID_COUNTRY_REGION_OPTION_ERROR,
  )(schema)
}

export const createDropdownValidationRulesWithCustomErrorMessage: (
  errorMessage: string,
) => ValidationRuleFn<DropdownFieldBase> =
  (errorMessage) =>
  (schema): RegisterOptions => {
    return {
      validate: {
        required: requiredSingleAnswerValidationFn(schema),
        validOptions: (value: string) => {
          if (!value) return
          return schema.fieldOptions.includes(value) || errorMessage
        },
      },
    }
  }

export const createRatingValidationRules: ValidationRuleFn<RatingFieldBase> = (
  schema,
): RegisterOptions => {
  return createBaseValidationRules(schema)
}

export const createAttachmentValidationRules: ValidationRuleFn<
  AttachmentFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: (value?: File) => {
      if (!schema.required) return true
      return !!value || REQUIRED_ERROR
    },
  }
}

export const createHomeNoValidationRules: ValidationRuleFn<HomenoFieldBase> = (
  schema,
): RegisterOptions => {
  return {
    validate: {
      required: requiredSingleAnswerValidationFn(schema),
      validHomeNo: (val?: string) => {
        if (!val) return true
        return (
          isHomePhoneNumber(val) ||
          i18n.t('features.common.errors.validation.homeNo')
        )
      },
    },
  }
}

export const createMobileValidationRules: ValidationRuleFnEmailAndMobile<
  MobileFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: {
      baseValidations: (val?: VerifiableFieldValues) => {
        return baseMobileValidationFn(schema)(val?.value)
      },
      ...createBaseVfnFieldValidationRules(schema).validate,
    },
  }
}

export const createNumberValidationRules: ValidationRuleFn<NumberFieldBase> = (
  schema,
): RegisterOptions => {
  const { selectedValidation } = schema.ValidationOptions
  const { selectedLengthValidation, customVal } =
    schema.ValidationOptions.LengthValidationOptions
  const { customMin, customMax } =
    schema.ValidationOptions.RangeValidationOptions

  return {
    validate: {
      required: requiredSingleAnswerValidationFn(schema),
      validNumberLength: (val: string) => {
        if (
          selectedValidation !== NumberSelectedValidation.Length ||
          !val ||
          !customVal
        )
          return true

        const currLen = val.trim().length

        switch (selectedLengthValidation) {
          case NumberSelectedLengthValidation.Exact:
            return (
              currLen === customVal ||
              simplur`Please enter ${customVal} digit[|s] (${currLen}/${customVal})`
            )
          case NumberSelectedLengthValidation.Min:
            return (
              currLen >= customVal ||
              simplur`Please enter at least ${customVal} digit[|s] (${currLen}/${customVal})`
            )
          case NumberSelectedLengthValidation.Max:
            return (
              currLen <= customVal ||
              simplur`Please enter at most ${customVal} digit[|s] (${currLen}/${customVal})`
            )
        }
      },
      validNumberRange: (val: string) => {
        if (selectedValidation !== NumberSelectedValidation.Range || !val)
          return true

        const numVal = parseInt(val)
        if (Number.isNaN(numVal)) {
          return 'Please enter a valid number'
        }

        const hasMinimum = customMin !== null
        const hasMaximum = customMax !== null
        const satisfiesMinimum = !hasMinimum || customMin <= numVal
        const satisfiesMaximum = !hasMaximum || numVal <= customMax
        const isInRange = satisfiesMinimum && satisfiesMaximum

        if (isInRange) {
          return true
        } else if (hasMinimum && hasMaximum) {
          return `Please enter a number between ${customMin} and ${customMax}`
        } else if (hasMinimum) {
          return `Please enter a number that is at least ${customMin}`
        } else if (hasMaximum) {
          return `Please enter a number that is at most ${customMax}`
        }
      },
    },
  }
}

export const createDecimalValidationRules: ValidationRuleFn<
  DecimalFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: {
      required: requiredSingleAnswerValidationFn(schema),
      validDecimal: (val: string) => {
        const {
          ValidationOptions: { customMax, customMin },
          validateByValue,
        } = schema
        if (!val) return true

        const numVal = Number(val)
        if (isNaN(numVal)) {
          return 'Please enter a valid decimal'
        }

        // Validate leading zeros
        if (/^0[0-9]/.test(val)) {
          return 'Please enter a valid decimal without leading zeros'
        }

        if (!validateByValue) return true

        if (
          customMin !== null &&
          customMax !== null &&
          (numVal < customMin || numVal > customMax)
        ) {
          return `Please enter a decimal between ${formatNumberToLocaleString(
            customMin,
          )} and ${formatNumberToLocaleString(customMax)} (inclusive)`
        }
        if (customMin !== null && numVal < customMin) {
          return `Please enter a decimal greater than or equal to ${formatNumberToLocaleString(
            customMin,
          )}`
        }
        if (customMax !== null && numVal > customMax) {
          return `Please enter a decimal less than or equal to ${formatNumberToLocaleString(
            customMax,
          )}`
        }

        return true
      },
    },
  }
}

export const createTextValidationRules: ValidationRuleFn<
  ShortTextFieldBase | LongTextFieldBase
> = (schema): RegisterOptions => {
  const { selectedValidation, customVal } = schema.ValidationOptions
  return {
    validate: {
      required: requiredSingleAnswerValidationFn(schema),
      validText: (val?: string) => {
        if (!val || !customVal) return true

        const currLen = val.trim().length

        switch (selectedValidation) {
          case TextSelectedValidation.Exact:
            return (
              currLen === customVal ||
              simplur`Please enter ${customVal} character[|s] (${currLen}/${customVal})`
            )
          case TextSelectedValidation.Minimum:
            return (
              currLen >= customVal ||
              simplur`Please enter at least ${customVal} character[|s] (${currLen}/${customVal})`
            )
          case TextSelectedValidation.Maximum:
            return (
              currLen <= customVal ||
              simplur`Please enter at most ${customVal} character[|s] (${currLen}/${customVal})`
            )
        }
      },
    },
  }
}

export const createNikValidationRules: ValidationRuleFn<NricFieldBase> = (
  schema,
): RegisterOptions => {
  return {
    validate: {
      required: requiredSingleAnswerValidationFn(schema),
      validNric: (val?: string) => {
        if (!val) return true
        return (
          isValidNik(val) ||
          i18n.t('features.common.errors.validValue', { fieldName: 'NIK / KK' })
        )
      },
    },
  }
}

export const createCheckboxValidationRules: ValidationRuleFn<
  CheckboxFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: {
      required: (val?: CheckboxFieldValues['value']) => {
        if (!schema.required) return true
        if (!val) return REQUIRED_ERROR
        // Trim strings before checking for emptiness
        return val.map((v) => v.trim()).some(identity) || REQUIRED_ERROR
      },
      validOptions: (val?: CheckboxFieldValues['value']) => {
        const {
          ValidationOptions: { customMin, customMax },
          validateByValue,
        } = schema
        if (!val || val.length === 0 || !validateByValue) return true

        if (
          customMin &&
          customMax &&
          customMin === customMax &&
          val.length !== customMin
        ) {
          return simplur`Please select exactly ${customMin} option[|s] (${val.length}/${customMin})`
        }

        if (customMin && val.length < customMin) {
          return simplur`Please select at least ${customMin} option[|s] (${val.length}/${customMin})`
        }

        if (customMax && val.length > customMax) {
          return simplur`Please select at most ${customMax} option[|s] (${val.length}/${customMax})`
        }

        return true
      },
    },
  }
}

const parseDate = (val: string) => {
  return parse(val, DATE_PARSE_FORMAT, new Date())
}

export const createDateValidationRules: ValidationRuleFn<DateFieldBase> = (
  schema,
): RegisterOptions => {
  return {
    validate: {
      required: requiredSingleAnswerValidationFn(schema),
      validDate: (val) => {
        if (!val) return true
        if (val === DATE_PARSE_FORMAT.toLowerCase()) {
          return REQUIRED_ERROR
        }
        return isValid(parseDate(val)) || 'Please enter a valid date'
      },
      noFuture: (val) => {
        if (
          !val ||
          schema.dateValidation.selectedDateValidation !==
            DateSelectedValidation.NoFuture
        ) {
          return true
        }
        return (
          !isDateAfterToday(parseDate(val)) ||
          'Only dates today or before are allowed'
        )
      },
      noPast: (val) => {
        if (
          !val ||
          schema.dateValidation.selectedDateValidation !==
            DateSelectedValidation.NoPast
        ) {
          return true
        }
        return (
          !isDateBeforeToday(parseDate(val)) ||
          'Only dates today or after are allowed'
        )
      },
      range: (val) => {
        if (
          !val ||
          schema.dateValidation.selectedDateValidation !==
            DateSelectedValidation.Custom
        ) {
          return true
        }

        const { customMinDate, customMaxDate } = schema.dateValidation ?? {}
        return (
          !isDateOutOfRange(
            parseDate(val),
            loadDateFromNormalizedDate(customMinDate),
            loadDateFromNormalizedDate(customMaxDate),
          ) || 'Selected date is not within the allowed date range'
        )
      },
      invalidDays: (val) =>
        !val ||
        !schema.invalidDays ||
        !schema.invalidDays.length ||
        !isDateAnInvalidDay(parseDate(val), schema.invalidDays) ||
        'This date is not allowed by the form admin',
    },
  }
}

export const createRadioValidationRules: ValidationRuleFn<RadioFieldBase> = (
  schema,
): RegisterOptions => {
  return createBaseValidationRules(schema)
}

export const createEmailValidationRules: ValidationRuleFnEmailAndMobile<
  EmailFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: {
      baseValidations: (val?: VerifiableFieldValues) => {
        return baseEmailValidationFn(schema)(val?.value)
      },
      ...createBaseVfnFieldValidationRules(schema).validate,
    },
  }
}

/**
 * To be shared between the verifiable and non-verifiable variant.
 * @returns error string if field is invalid, true otherwise.
 */
export const baseEmailValidationFn =
  (schema: MinimumFieldValidationProps<EmailFieldBase>) =>
  (inputValue?: string) => {
    if (!inputValue) return true

    const trimmedInputValue = inputValue.trim()

    // Valid email check
    if (!validator.isEmail(trimmedInputValue)) return INVALID_EMAIL_ERROR

    // Valid domain check
    const allowedDomains = new Set(schema.allowedEmailDomains)
    if (allowedDomains.size !== 0) {
      const domainInValue = trimmedInputValue.split('@')[1].toLowerCase()
      if (domainInValue && !allowedDomains.has(`@${domainInValue}`)) {
        return INVALID_EMAIL_DOMAIN_ERROR
      }
    }

    // Passed all error validation.
    return true
  }

export const baseMobileValidationFn =
  (_schema: MinimumFieldValidationProps<MobileFieldBase>) =>
  (inputValue?: string) => {
    if (!inputValue) return true

    // Valid mobile check
    return (
      isMobilePhoneNumber(inputValue) || 'Please enter a valid mobile number a'
    )
  }

export const createChildrenValidationRules: ValidationRuleFn<
  ChildrenCompoundFieldBase
> = (schema): RegisterOptions => {
  return {
    validate: {
      required: (value: string) => {
        if (!schema.required) return true
        if (!value || !value.trim()) return REQUIRED_ERROR
      },
    },
  }
}
