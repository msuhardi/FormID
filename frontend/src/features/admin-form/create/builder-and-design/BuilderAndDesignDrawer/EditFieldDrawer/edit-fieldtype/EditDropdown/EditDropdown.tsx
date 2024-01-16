import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormControl } from '@chakra-ui/react'
import { extend, pick } from 'lodash'

import { DropdownFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Textarea from '~components/Textarea'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import {
  SPLIT_TEXTAREA_TRANSFORM,
  SPLIT_TEXTAREA_VALIDATION,
} from '../common/constants'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

type EditDropdownProps = EditFieldProps<DropdownFieldBase>

const EDIT_DROPDOWN_FIELD_KEYS = ['title', 'description', 'required'] as const

type EditDropdownKeys = typeof EDIT_DROPDOWN_FIELD_KEYS[number]

type EditDropdownInputs = Pick<DropdownFieldBase, EditDropdownKeys> & {
  fieldOptionsString: string // Differs from fieldOptions in DropdownFieldBase because input is a string. Will be converted to array using SPLIT_TEXTAREA_TRANSFORM
}

const transformDropdownFieldToEditForm = (
  field: DropdownFieldBase,
): EditDropdownInputs => {
  return {
    ...pick(field, EDIT_DROPDOWN_FIELD_KEYS),
    fieldOptionsString: SPLIT_TEXTAREA_TRANSFORM.input(field.fieldOptions),
  }
}

const transformDropdownEditFormToField = (
  inputs: EditDropdownInputs,
  originalField: DropdownFieldBase,
): DropdownFieldBase => {
  return extend({}, originalField, inputs, {
    fieldOptions: SPLIT_TEXTAREA_TRANSFORM.output(inputs.fieldOptionsString),
  })
}

export const EditDropdown = ({ field }: EditDropdownProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditDropdownInputs, DropdownFieldBase>({
    field,
    transform: {
      input: transformDropdownFieldToEditForm,
      output: transformDropdownEditFormToField,
    },
    mode: 'onBlur',
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
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
            validate: SPLIT_TEXTAREA_VALIDATION,
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
