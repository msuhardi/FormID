import { useMemo } from 'react'
import { extend, pick } from 'lodash'

import { NricFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'

import { CreatePageDrawerContentContainer } from '../../../../common'

import {
  Description,
  Question,
  RequiredToggle,
} from './common/CommonFieldComponents'
import { FormFieldDrawerActions } from './common/FormFieldDrawerActions'
import { EditFieldProps } from './common/types'
import { useEditFieldForm } from './common/useEditFieldForm'

type EditNricProps = EditFieldProps<NricFieldBase>

type EditNricInputs = Pick<NricFieldBase, 'title' | 'description' | 'required'>

// Reusing NRIC field for NIK
export const EditNric = ({ field }: EditNricProps): JSX.Element => {
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditNricInputs, NricFieldBase>({
    field,
    transform: {
      input: (inputField) =>
        pick(inputField, ['title', 'description', 'required']),
      output: (formOutput, originalField) =>
        extend({}, originalField, formOutput),
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
      <Description isLoading={isLoading} errors={errors} register={register} />
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
