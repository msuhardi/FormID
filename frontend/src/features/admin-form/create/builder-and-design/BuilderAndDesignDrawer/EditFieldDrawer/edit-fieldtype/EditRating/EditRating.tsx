import { useMemo } from 'react'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormControl } from '@chakra-ui/react'
import { extend, pick } from 'lodash'

import { RatingFieldBase, RatingShape } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import { SingleSelect } from '~components/Dropdown'
import FormLabel from '~components/FormControl/FormLabel'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

type EditRatingProps = EditFieldProps<RatingFieldBase>

const EDIT_RATING_FIELD_KEYS = [
  'title',
  'description',
  'required',
  'ratingOptions',
] as const

type EditRatingInputs = Pick<
  RatingFieldBase,
  typeof EDIT_RATING_FIELD_KEYS[number]
>

const EDIT_RATING_OPTIONS = {
  stepOptions: Array.from(Array(10), (_e, i) => String(i + 1)),
  shapeOptions: Object.keys(RatingShape),
}

export const EditRating = ({ field }: EditRatingProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    register,
    control,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditRatingInputs, RatingFieldBase>({
    field,
    transform: {
      input: (inputField) => pick(inputField, EDIT_RATING_FIELD_KEYS),
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
      <FormControl id="ratingOptions.steps" isReadOnly={isLoading}>
        <FormLabel isRequired>
          {t('features.adminFormBuilder.rating.numOfSteps')}
        </FormLabel>
        <Controller
          control={control}
          name="ratingOptions.steps"
          render={({ field: { value, ...field } }) => (
            <SingleSelect
              isClearable={false}
              items={EDIT_RATING_OPTIONS.stepOptions}
              value={String(value)}
              {...field}
            />
          )}
        />
      </FormControl>
      <FormControl id="ratingOptions.shape" isReadOnly={isLoading}>
        <FormLabel isRequired>
          {t('features.adminFormBuilder.rating.shape')}
        </FormLabel>
        <Controller
          control={control}
          name="ratingOptions.shape"
          render={({ field }) => (
            <SingleSelect
              isClearable={false}
              items={EDIT_RATING_OPTIONS.shapeOptions.map((shape) => ({
                value: shape,
                label: t(`features.adminFormBuilder.rating.shapes.${shape}`),
              }))}
              {...field}
            />
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
