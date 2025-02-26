import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormControl } from '@chakra-ui/react'
import { extend, pick } from 'lodash'

import { RadioFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Textarea from '~components/Textarea'
import Toggle from '~components/Toggle'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import {
  DUPLICATE_OTHERS_VALIDATION,
  SPLIT_TEXTAREA_TRANSFORM,
  SPLIT_TEXTAREA_VALIDATION,
} from '../common/constants'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

type EditRadioProps = EditFieldProps<RadioFieldBase>

const EDIT_RADIO_FIELD_KEYS = [
  'title',
  'description',
  'required',
  'othersRadioButton',
] as const

type EditRadioKeys = typeof EDIT_RADIO_FIELD_KEYS[number]

type EditRadioInputs = Pick<RadioFieldBase, EditRadioKeys> & {
  fieldOptionsString: string // Differs from fieldOptions in RadioFieldBase because input is a string. Will be converted to array using SPLIT_TEXTAREA_TRANSFORM
}

const transformRadioFieldToEditForm = (
  field: RadioFieldBase,
): EditRadioInputs => {
  return {
    ...pick(field, EDIT_RADIO_FIELD_KEYS),
    fieldOptionsString: SPLIT_TEXTAREA_TRANSFORM.input(field.fieldOptions),
  }
}

const transformRadioEditFormToField = (
  inputs: EditRadioInputs,
  originalField: RadioFieldBase,
): RadioFieldBase => {
  return extend({}, originalField, inputs, {
    fieldOptions: SPLIT_TEXTAREA_TRANSFORM.output(inputs.fieldOptionsString),
  })
}

export const EditRadio = ({ field }: EditRadioProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
    watch,
  } = useEditFieldForm<EditRadioInputs, RadioFieldBase>({
    field,
    transform: {
      input: transformRadioFieldToEditForm,
      output: transformRadioEditFormToField,
    },
    mode: 'onBlur',
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
  )

  const hasRadio = watch('othersRadioButton')
  const optionsValidation = useCallback(
    (opts: string) => {
      const textareaValidation = SPLIT_TEXTAREA_VALIDATION.validate(opts)
      // Explicit check for !== true, since the error strings returned by the validator will also be truthy.
      if (textareaValidation !== true) return textareaValidation
      return DUPLICATE_OTHERS_VALIDATION(hasRadio).validate(opts)
    },
    [hasRadio],
  )

  return (
    <CreatePageDrawerContentContainer>
      <Question
        isLoading={isLoading}
        errors={errors}
        register={register}
        requiredValidationRule={requiredValidationRule}
      />
      <Description
        isLoading={isLoading}
        isRequired={false}
        errors={errors}
        register={register}
      />
      <RequiredToggle isLoading={isLoading} register={register} />
      <FormControl isReadOnly={isLoading}>
        <Toggle
          {...register('othersRadioButton')}
          label={t('features.adminFormBuilder.radio.others')}
        />
      </FormControl>
      <FormControl
        isRequired
        isReadOnly={isLoading}
        isInvalid={!!errors.fieldOptionsString}
      >
        <FormLabel>
          {t('features.adminFormBuilder.radio.options.title')}
        </FormLabel>
        <Textarea
          placeholder={t('features.adminFormBuilder.radio.options.placeholder')}
          {...register('fieldOptionsString', {
            validate: optionsValidation,
          })}
        />
        <FormErrorMessage>
          {errors?.fieldOptionsString?.message}
        </FormErrorMessage>
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
