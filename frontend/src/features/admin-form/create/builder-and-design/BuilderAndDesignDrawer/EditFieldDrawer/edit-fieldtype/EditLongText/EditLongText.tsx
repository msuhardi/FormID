import { useMemo } from 'react'
import { RegisterOptions } from 'react-hook-form'
import { extend, pick } from 'lodash'

import { LongTextFieldBase, TextSelectedValidation } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  Description,
  NumOfCharsAllowed,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

export type EditLongTextProps = EditFieldProps<LongTextFieldBase>

const EDIT_LONGTEXT_FIELD_KEYS = ['title', 'description', 'required'] as const

type EditLongTextInputs = Pick<
  LongTextFieldBase,
  typeof EDIT_LONGTEXT_FIELD_KEYS[number]
> & {
  ValidationOptions: {
    selectedValidation: TextSelectedValidation | ''
    customVal: number | ''
  }
}

const transformLongTextFieldToEditForm = (
  field: LongTextFieldBase,
): EditLongTextInputs => {
  const nextValidationOptions = {
    selectedValidation:
      field.ValidationOptions.selectedValidation || ('' as const),
    customVal:
      (!!field.ValidationOptions.selectedValidation &&
        field.ValidationOptions.customVal) ||
      ('' as const),
  }
  return {
    ...pick(field, EDIT_LONGTEXT_FIELD_KEYS),
    ValidationOptions: nextValidationOptions,
  }
}

const transformLongTextEditFormToField = (
  inputs: EditLongTextInputs,
  originalField: LongTextFieldBase,
): LongTextFieldBase => {
  const nextValidationOptions =
    inputs.ValidationOptions.selectedValidation === ''
      ? {
          selectedValidation: null,
          customVal: null,
        }
      : inputs.ValidationOptions
  return extend({}, originalField, inputs, {
    ValidationOptions: nextValidationOptions,
  })
}

export const EditLongText = ({ field }: EditLongTextProps): JSX.Element => {
  const {
    register,
    formState: { errors },
    getValues,
    buttonText,
    handleUpdateField,
    watch,
    control,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditLongTextInputs, LongTextFieldBase>({
    field,
    transform: {
      input: transformLongTextFieldToEditForm,
      output: transformLongTextEditFormToField,
    },
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
  )

  const watchedSelectedValidation = watch(
    'ValidationOptions.selectedValidation',
  )

  const customValValidationOptions: RegisterOptions<
    EditLongTextInputs,
    'ValidationOptions.customVal'
  > = useMemo(
    () => ({
      // customVal is required if there is selected validation.
      validate: {
        hasValidation: (val) => {
          return (
            !!val ||
            !getValues('ValidationOptions.selectedValidation') ||
            'Please enter number of characters'
          )
        },
        validNumber: (val) => {
          // Check whether input is a valid number, avoid e
          return !isNaN(Number(val)) || 'Please enter a valid number'
        },
      },
      min: {
        value: 1,
        message: 'Cannot be less than 1',
      },
      max: {
        value: 10000,
        message: 'Cannot be more than 10000',
      },
    }),
    [getValues],
  )

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
      <NumOfCharsAllowed
        control={control}
        customValValidationOptions={customValValidationOptions}
        watchedSelectedValidation={watchedSelectedValidation}
        isLoading={isLoading}
        errors={errors}
      />
      <FormFieldDrawerActions
        isLoading={isLoading}
        buttonText={buttonText}
        handleClick={handleUpdateField}
        handleCancel={handleCancel}
      />
    </CreatePageDrawerContentContainer>
  )
}
