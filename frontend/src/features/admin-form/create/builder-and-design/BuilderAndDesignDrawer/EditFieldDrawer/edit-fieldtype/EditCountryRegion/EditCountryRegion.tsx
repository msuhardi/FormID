import { useMemo } from 'react'
import { extend, pick } from 'lodash'

import { CountryRegionFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'

import { CreatePageDrawerContentContainer } from '~features/admin-form/create/common'

import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

type EditCountryRegionProps = EditFieldProps<CountryRegionFieldBase>

const EDIT_COUNTRY_FIELD_KEYS = ['title', 'description', 'required'] as const

type EditCountryRegionKeys = typeof EDIT_COUNTRY_FIELD_KEYS[number]

type EditCountryRegionInputs = Pick<
  CountryRegionFieldBase,
  EditCountryRegionKeys
>

const transformCountryRegionFieldToEditForm = (
  field: CountryRegionFieldBase,
): EditCountryRegionInputs => {
  return {
    ...pick(field, EDIT_COUNTRY_FIELD_KEYS),
  }
}

const transformCountryRegionEditFormToField = (
  inputs: EditCountryRegionInputs,
  originalField: CountryRegionFieldBase,
): CountryRegionFieldBase => {
  return extend({}, originalField, inputs, {})
}

export const EditCountryRegion = ({
  field,
}: EditCountryRegionProps): JSX.Element => {
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditCountryRegionInputs, CountryRegionFieldBase>({
    field,
    transform: {
      input: transformCountryRegionFieldToEditForm,
      output: transformCountryRegionEditFormToField,
    },
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
        isRequired={false}
        isLoading={isLoading}
        errors={errors}
        register={register}
      />
      <RequiredToggle isLoading={isLoading} register={register} />
      <FormFieldDrawerActions
        isLoading={isLoading}
        buttonText={buttonText}
        handleClick={handleUpdateField}
        handleCancel={handleCancel}
      />
    </CreatePageDrawerContentContainer>
  )
}
