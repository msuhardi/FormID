import { useEffect, useMemo, useRef } from 'react'
import { RegisterOptions } from 'react-hook-form'
import { extend, pick } from 'lodash'

import { ShortTextFieldBase, TextSelectedValidation } from '~shared/types/field'

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

export type EditShortTextProps = EditFieldProps<ShortTextFieldBase>

const EDIT_SHORTTEXT_FIELD_KEYS = [
  'title',
  'description',
  'required',
  'allowPrefill',
  'lockPrefill',
] as const

type EditShortTextInputs = Pick<
  ShortTextFieldBase,
  typeof EDIT_SHORTTEXT_FIELD_KEYS[number]
> & {
  ValidationOptions: {
    selectedValidation: TextSelectedValidation | ''
    customVal: number | ''
  }
}

const transformShortTextFieldToEditForm = (
  field: ShortTextFieldBase,
): EditShortTextInputs => {
  const nextValidationOptions = {
    selectedValidation:
      field.ValidationOptions.selectedValidation || ('' as const),
    customVal:
      (!!field.ValidationOptions.selectedValidation &&
        field.ValidationOptions.customVal) ||
      ('' as const),
  }
  return {
    ...pick(field, EDIT_SHORTTEXT_FIELD_KEYS),
    ValidationOptions: nextValidationOptions,
  }
}

const transformShortTextEditFormToField = (
  inputs: EditShortTextInputs,
  originalField: ShortTextFieldBase,
): ShortTextFieldBase => {
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

export const EditShortText = ({ field }: EditShortTextProps): JSX.Element => {
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
  } = useEditFieldForm<EditShortTextInputs, ShortTextFieldBase>({
    field,
    transform: {
      input: transformShortTextFieldToEditForm,
      output: transformShortTextEditFormToField,
    },
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
  )

  const watchedSelectedValidation = watch(
    'ValidationOptions.selectedValidation',
  )

  const hasLockPrefillRef = useRef<HTMLInputElement>(null)

  const watchAllowPrefill = watch('allowPrefill')
  const watchLockPrefill = watch('lockPrefill')

  useEffect(() => {
    // Prefill must be enabled for lockPrefill
    // We cannot simply use setValue as it does not update
    // the UI
    if (!watchAllowPrefill && watchLockPrefill) {
      hasLockPrefillRef.current?.click()
    }
  }, [watchAllowPrefill, watchLockPrefill])

  const customValValidationOptions: RegisterOptions<
    EditShortTextInputs,
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

  // Effect to clear validation option errors when selection limit is toggled off.
  useEffect(() => {
    if (!watchedSelectedValidation) {
      clearErrors('ValidationOptions')
      setValue('ValidationOptions.customVal', '')
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
      <NumOfCharsAllowed
        control={control}
        customValValidationOptions={customValValidationOptions}
        watchedSelectedValidation={watchedSelectedValidation}
        isLoading={isLoading}
        errors={errors}
      />
      {/*<FormControl isReadOnly={isLoading}>*/}
      {/*  <Toggle*/}
      {/*    {...register('allowPrefill')}*/}
      {/*    label="Enable pre-fill"*/}
      {/*    description={`Use Field ID in the form URL to pre-fill this field for respondents. [Learn how](${GUIDE_PREFILL})`}*/}
      {/*  />*/}
      {/*  {watchAllowPrefill ? (*/}
      {/*    <>*/}
      {/*      <InputGroup mt="0.5rem">*/}
      {/*        <Input*/}
      {/*          isReadOnly*/}
      {/*          isDisabled={!field._id}*/}
      {/*          value={*/}
      {/*            field._id ??*/}
      {/*            'Field ID will be generated after this field is saved'*/}
      {/*          }*/}
      {/*        />*/}
      {/*        {field._id ? (*/}
      {/*          <InputRightElement>*/}
      {/*            <CopyButton*/}
      {/*              stringToCopy={field._id}*/}
      {/*              aria-label="Copy field ID value"*/}
      {/*            />*/}
      {/*          </InputRightElement>*/}
      {/*        ) : null}*/}
      {/*      </InputGroup>*/}
      {/*    </>*/}
      {/*  ) : null}*/}
      {/*</FormControl>*/}
      {/*<FormControl isReadOnly={isLoading}>*/}
      {/*  <Toggle*/}
      {/*    {...lockPrefillRegister}*/}
      {/*    ref={mergedLockPrefillRef}*/}
      {/*    label="Prevent pre-fill editing"*/}
      {/*    description="This prevents respondents from clicking the field to edit it. However, field content can still be modified via the URL."*/}
      {/*    isDisabled={!watchAllowPrefill}*/}
      {/*  />*/}
      {/*</FormControl>*/}
      <FormFieldDrawerActions
        isLoading={isLoading}
        buttonText={buttonText}
        handleClick={handleUpdateField}
        handleCancel={handleCancel}
      />
    </CreatePageDrawerContentContainer>
  )
}
