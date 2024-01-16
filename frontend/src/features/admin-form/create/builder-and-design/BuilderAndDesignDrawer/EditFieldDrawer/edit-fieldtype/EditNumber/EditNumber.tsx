import { useEffect, useMemo } from 'react'
import { Controller, RegisterOptions } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormControl, SimpleGrid } from '@chakra-ui/react'
import { extend, isEmpty, pick } from 'lodash'

import {
  NumberFieldBase,
  NumberSelectedLengthValidation,
  NumberSelectedValidation,
} from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import { SingleSelect } from '~components/Dropdown'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import NumberInput from '~components/NumberInput'

import { validateNumberInput } from '~features/admin-form/create/builder-and-design/utils/validateNumberInput'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

type EditNumberProps = EditFieldProps<NumberFieldBase>

const EDIT_NUMBER_FIELD_KEYS = ['title', 'description', 'required'] as const

// As we want to keep the values in the shared type simple,
// we create a separate enum for frontend options and transform them as needed
enum NumberSelectedValidationInputs {
  Length = 'Number of characters allowed',
  Range = 'Range of values allowed',
}

type EditNumberInputs = Pick<
  NumberFieldBase,
  typeof EDIT_NUMBER_FIELD_KEYS[number]
> & {
  ValidationOptions: {
    selectedValidation: NumberSelectedValidationInputs | ''
    LengthValidationOptions: {
      customVal: number | ''
      selectedLengthValidation: NumberSelectedLengthValidation | ''
    }
    RangeValidationOptions: {
      customMin: number | ''
      customMax: number | ''
    }
  }
}

const transformNumberFieldToEditForm = (
  field: NumberFieldBase,
): EditNumberInputs => {
  const {
    selectedValidation,
    LengthValidationOptions,
    RangeValidationOptions,
  } = field.ValidationOptions

  const nextSelectedValidation =
    selectedValidation === NumberSelectedValidation.Length
      ? NumberSelectedValidationInputs.Length
      : selectedValidation === NumberSelectedValidation.Range
      ? NumberSelectedValidationInputs.Range
      : ('' as const)

  const nextLengthValidationOptions = {
    selectedLengthValidation:
      LengthValidationOptions.selectedLengthValidation || ('' as const),
    customVal:
      (!!LengthValidationOptions.selectedLengthValidation &&
        LengthValidationOptions.customVal) ||
      ('' as const),
  }

  const nextRangeValidationOptions = {
    customMin: RangeValidationOptions.customMin || ('' as const),
    customMax: RangeValidationOptions.customMax || ('' as const),
  }

  return {
    ...pick(field, EDIT_NUMBER_FIELD_KEYS),
    ValidationOptions: {
      selectedValidation: nextSelectedValidation,
      LengthValidationOptions: nextLengthValidationOptions,
      RangeValidationOptions: nextRangeValidationOptions,
    },
  }
}

const transformNumberEditFormToField = (
  inputs: EditNumberInputs,
  originalField: NumberFieldBase,
): NumberFieldBase => {
  const {
    selectedValidation,
    LengthValidationOptions,
    RangeValidationOptions,
  } = inputs.ValidationOptions

  const hasSelectedLengthValidationOption =
    selectedValidation === NumberSelectedValidationInputs.Length

  const nextSelectedValidation =
    selectedValidation === NumberSelectedValidationInputs.Length
      ? NumberSelectedValidation.Length
      : selectedValidation === NumberSelectedValidationInputs.Range
      ? NumberSelectedValidation.Range
      : null

  const nextLengthValidationOptions = hasSelectedLengthValidationOption
    ? LengthValidationOptions
    : {
        selectedLengthValidation: null,
        customVal: null,
      }

  const nextRangeValidationOptions =
    selectedValidation === NumberSelectedValidationInputs.Range
      ? RangeValidationOptions
      : {
          customMin: null,
          customMax: null,
        }

  const nextValidationOptions = {
    selectedValidation: nextSelectedValidation,
    LengthValidationOptions: nextLengthValidationOptions,
    RangeValidationOptions: nextRangeValidationOptions,
  }

  return extend({}, originalField, inputs, {
    ValidationOptions: nextValidationOptions,
  })
}

export const EditNumber = ({ field }: EditNumberProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
    getValues,
    buttonText,
    handleUpdateField,
    watch,
    control,
    clearErrors,
    isLoading,
    handleCancel,
    setValue,
  } = useEditFieldForm<EditNumberInputs, NumberFieldBase>({
    field,
    transform: {
      input: transformNumberFieldToEditForm,
      output: transformNumberEditFormToField,
    },
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
  )

  const watchedSelectedValidation = watch(
    'ValidationOptions.selectedValidation',
  )

  const watchedSelectedLengthValidation = watch(
    'ValidationOptions.LengthValidationOptions.selectedLengthValidation',
  )

  const selectedLengthValidationOptions: RegisterOptions<
    EditNumberInputs,
    'ValidationOptions.LengthValidationOptions.selectedLengthValidation'
  > = useMemo(
    () => ({
      required: {
        value: true,
        message: t('features.adminFormBuilder.number.error.validationType'),
      },
    }),
    [t],
  )

  const customValLengthValidationOptions: RegisterOptions<
    EditNumberInputs,
    'ValidationOptions.LengthValidationOptions.customVal'
  > = useMemo(
    () => ({
      // customVal is required if there is selected validation.
      validate: {
        hasValidation: (customVal) => {
          const selectedLengthValidation = getValues(
            'ValidationOptions.LengthValidationOptions.selectedLengthValidation',
          )
          return (
            selectedLengthValidation === '' ||
            customVal !== '' ||
            t('features.adminFormBuilder.number.error.numOfCharacter')
          )
        },
      },
      min: {
        value: 1,
        message: t('features.adminFormBuilder.number.error.min'),
      },
      max: {
        value: 10000,
        message: t('features.adminFormBuilder.number.error.max'),
      },
    }),
    [getValues, t],
  )

  // We use the customMin field to perform cross-field validation for
  // the number range
  const customMinRangeValidationOptions: RegisterOptions<
    EditNumberInputs,
    'ValidationOptions.RangeValidationOptions.customMin'
  > = useMemo(
    () => ({
      validate: {
        // Validate that at least one of customMin/customMax is specified
        hasRange: (customMin) => {
          const customMax = getValues(
            'ValidationOptions.RangeValidationOptions.customMax',
          )
          return (
            customMax !== '' ||
            customMin !== '' ||
            t('features.adminFormBuilder.number.error.rangeValue')
          )
        },
        hasValidRange: (customMin) => {
          const customMax = getValues(
            'ValidationOptions.RangeValidationOptions.customMax',
          )

          return (
            customMax === '' ||
            customMin === '' ||
            customMin < customMax ||
            t('features.adminFormBuilder.number.maxValueGreaterThanMin')
          )
        },
      },
      min: {
        value: 1,
        message: t('features.adminFormBuilder.number.error.minRangeValue'),
      },
    }),
    [getValues, t],
  )

  const customMaxRangeValidationOptions: RegisterOptions<
    EditNumberInputs,
    'ValidationOptions.RangeValidationOptions.customMax'
  > = useMemo(
    () => ({
      min: {
        value: 1,
        message: t('features.adminFormBuilder.number.error.maxRangeValue'),
      },
    }),
    [t],
  )

  useEffect(() => {
    // Effect to clear validation errors and inputs
    // when the selected validation is cleared.
    if (!watchedSelectedValidation) {
      clearErrors('ValidationOptions')
      setValue(
        'ValidationOptions.LengthValidationOptions.selectedLengthValidation',
        '',
      )
      setValue('ValidationOptions.LengthValidationOptions.customVal', '')
      setValue('ValidationOptions.RangeValidationOptions.customMin', '')
      setValue('ValidationOptions.RangeValidationOptions.customMax', '')
    }
  }, [clearErrors, setValue, watchedSelectedValidation])

  return (
    <CreatePageDrawerContentContainer>
      <Question
        isLoading={isLoading}
        errors={errors}
        register={register}
        requiredValidationRule={requiredValidationRule}
      />
      <Description isLoading={isLoading} errors={errors} register={register} />
      <RequiredToggle isLoading={isLoading} register={register} />
      <FormControl
        isReadOnly={isLoading}
        isInvalid={!isEmpty(errors.ValidationOptions)}
      >
        <FormLabel id={'ValidationOptions.selectedValidation-label'} isRequired>
          {t('features.adminFormBuilder.number.fieldRestriction.title')}
        </FormLabel>
        <Controller
          name="ValidationOptions.selectedValidation"
          control={control}
          render={({ field }) => (
            <SingleSelect
              items={Object.keys(NumberSelectedValidationInputs).map((key) => ({
                label: t(
                  `features.adminFormBuilder.number.fieldRestriction.${key}`,
                ),
                value:
                  NumberSelectedValidationInputs[
                    key as keyof typeof NumberSelectedValidationInputs
                  ],
              }))}
              {...field}
            />
          )}
        />
        {watchedSelectedValidation ===
          NumberSelectedValidationInputs.Length && (
          <>
            <SimpleGrid
              mt="0.5rem"
              columns={{ base: 2, md: 1, lg: 2 }}
              spacing="0.5rem"
            >
              <Controller
                name="ValidationOptions.LengthValidationOptions.selectedLengthValidation"
                control={control}
                rules={selectedLengthValidationOptions}
                render={({ field }) => (
                  <SingleSelect
                    items={Object.keys(NumberSelectedLengthValidation).map(
                      (key) => ({
                        label: t(`features.common.${key.toLowerCase()}`),
                        value:
                          NumberSelectedLengthValidation[
                            key as keyof typeof NumberSelectedLengthValidation
                          ],
                      }),
                    )}
                    placeholder={t(
                      'features.adminFormBuilder.number.fieldRestriction.lengthRestriction',
                    )}
                    isClearable={false}
                    {...field}
                  />
                )}
              />
              <Controller
                name="ValidationOptions.LengthValidationOptions.customVal"
                control={control}
                rules={customValLengthValidationOptions}
                render={({ field: { onChange, ...rest } }) => (
                  <NumberInput
                    flex={1}
                    inputMode="numeric"
                    showSteppers={false}
                    placeholder={t(
                      'features.adminFormBuilder.commonFieldComponents.charactersAllowedPlaceholder',
                    )}
                    isDisabled={!watchedSelectedLengthValidation}
                    onChange={validateNumberInput(onChange)}
                    {...rest}
                  />
                )}
              />
            </SimpleGrid>
            <FormErrorMessage>
              {errors?.ValidationOptions?.LengthValidationOptions
                ?.selectedLengthValidation?.message ||
                errors?.ValidationOptions?.LengthValidationOptions?.customVal
                  ?.message}
            </FormErrorMessage>
          </>
        )}
        {watchedSelectedValidation === NumberSelectedValidationInputs.Range && (
          <>
            <SimpleGrid
              mt="0.5rem"
              columns={{ base: 2, md: 1, lg: 2 }}
              spacing="0.5rem"
            >
              <Controller
                name="ValidationOptions.RangeValidationOptions.customMin"
                control={control}
                rules={customMinRangeValidationOptions}
                render={({ field: { onChange, ...rest } }) => (
                  <NumberInput
                    inputMode="numeric"
                    showSteppers={false}
                    placeholder={t('features.adminFormBuilder.number.minValue')}
                    onChange={validateNumberInput(onChange)}
                    {...rest}
                  />
                )}
              />
              <Controller
                name="ValidationOptions.RangeValidationOptions.customMax"
                control={control}
                rules={customMaxRangeValidationOptions}
                render={({ field: { onChange, ...rest } }) => (
                  <NumberInput
                    inputMode="numeric"
                    showSteppers={false}
                    placeholder={t('features.adminFormBuilder.number.maxValue')}
                    onChange={validateNumberInput(onChange)}
                    {...rest}
                  />
                )}
              />
            </SimpleGrid>
            <FormErrorMessage>
              {errors?.ValidationOptions?.RangeValidationOptions?.customMin
                ?.message ||
                errors?.ValidationOptions?.RangeValidationOptions?.customMax
                  ?.message}
            </FormErrorMessage>
          </>
        )}
      </FormControl>
      <FormFieldDrawerActions
        isLoading={isLoading}
        buttonText={buttonText}
        handleClick={handleUpdateField}
        handleCancel={handleCancel}
      />
    </CreatePageDrawerContentContainer>
  )
}
