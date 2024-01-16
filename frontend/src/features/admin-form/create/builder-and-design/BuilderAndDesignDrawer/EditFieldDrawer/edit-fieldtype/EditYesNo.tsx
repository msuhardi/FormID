import { useMemo } from 'react'
import { extend, pick } from 'lodash'

import { YesNoFieldBase } from '~shared/types/field'

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

type EditYesNoProps = EditFieldProps<YesNoFieldBase>

type EditYesNoInputs = Pick<
  YesNoFieldBase,
  'title' | 'description' | 'required'
>

export const EditYesNo = ({ field }: EditYesNoProps): JSX.Element => {
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditYesNoInputs, YesNoFieldBase>({
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
