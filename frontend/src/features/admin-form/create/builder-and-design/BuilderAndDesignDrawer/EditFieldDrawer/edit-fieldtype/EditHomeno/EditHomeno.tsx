import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormControl } from '@chakra-ui/react'
import { extend, pick } from 'lodash'

import { HomenoFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import Toggle from '~components/Toggle'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

const EDIT_HOMENO_KEYS = [
  'title',
  'description',
  'required',
  'allowIntlNumbers',
] as const

type EditHomenoProps = EditFieldProps<HomenoFieldBase>

type EditHomenoInputs = Pick<HomenoFieldBase, typeof EDIT_HOMENO_KEYS[number]>

export const EditHomeno = ({ field }: EditHomenoProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditHomenoInputs, HomenoFieldBase>({
    field,
    transform: {
      input: (inputField) => pick(inputField, EDIT_HOMENO_KEYS),
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
      <FormControl isReadOnly={isLoading}>
        <Toggle
          {...register('allowIntlNumbers')}
          label={t(
            'features.adminFormBuilder.mobileNo.allowInternationalNumber',
          )}
        />
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
