import {
  Control,
  Controller,
  FieldErrors,
  FieldName,
  FieldValues,
  RegisterOptions,
  UseFormRegister,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormControl, SimpleGrid } from '@chakra-ui/react'
import { isEmpty } from 'lodash'

import { TextSelectedValidation } from '~shared/types'

import { SingleSelect } from '~components/Dropdown'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Input from '~components/Input'
import NumberInput from '~components/NumberInput'
import Textarea from '~components/Textarea'
import Toggle from '~components/Toggle'

import { validateNumberInput } from '~features/admin-form/create/builder-and-design/utils/validateNumberInput'

interface CommonFieldComponentsProps {
  isLoading: boolean
  isRequired?: boolean
  errors?: FieldErrors<any>
  register?: UseFormRegister<any>
  requiredValidationRule?: RegisterOptions<FieldValues, FieldName<any>>
}

export const Question = ({
  isLoading,
  isRequired = true,
  errors,
  register,
  requiredValidationRule,
}: CommonFieldComponentsProps) => {
  const { t } = useTranslation()

  return (
    <FormControl
      isRequired={isRequired}
      isReadOnly={isLoading}
      isInvalid={!!errors.title}
    >
      <FormLabel>
        {t('features.adminFormBuilder.commonFieldComponents.title')}
      </FormLabel>
      <Input autoFocus {...register?.('title', requiredValidationRule)} />
      <FormErrorMessage>{errors?.title?.message}</FormErrorMessage>
    </FormControl>
  )
}

export const Description = ({
  isLoading,
  isRequired = true,
  errors,
  register,
  requiredValidationRule,
}: CommonFieldComponentsProps) => {
  const { t } = useTranslation()

  return (
    <FormControl
      isRequired={isRequired}
      isReadOnly={isLoading}
      isInvalid={!!errors.description}
    >
      <FormLabel isRequired={isRequired && !!requiredValidationRule}>
        {t(
          'features.adminFormBuilder.commonFieldComponents.description',
          requiredValidationRule,
        )}
      </FormLabel>
      <Textarea {...register?.('description', requiredValidationRule)} />
      <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
    </FormControl>
  )
}

export const RequiredToggle = ({
  isLoading,
  register,
}: CommonFieldComponentsProps) => {
  const { t } = useTranslation()

  return (
    <FormControl isReadOnly={isLoading}>
      <Toggle
        {...register?.('required')}
        label={t('features.adminFormBuilder.commonFieldComponents.required')}
      />
    </FormControl>
  )
}

interface NumOfCharsAllowedProps extends CommonFieldComponentsProps {
  control: Control<any, any>
  customValValidationOptions: RegisterOptions<
    any,
    'ValidationOptions.customVal'
  >
  watchedSelectedValidation: '' | TextSelectedValidation
}

export const NumOfCharsAllowed = ({
  isLoading,
  errors,
  control,
  customValValidationOptions,
  watchedSelectedValidation,
}: NumOfCharsAllowedProps) => {
  const { t } = useTranslation()

  return (
    <FormControl
      isReadOnly={isLoading}
      isInvalid={!isEmpty(errors.ValidationOptions)}
    >
      <FormLabel isRequired>
        {t(
          'features.adminFormBuilder.commonFieldComponents.noCharactersAllowed',
        )}
      </FormLabel>
      <SimpleGrid
        mt="0.5rem"
        columns={{ base: 2, md: 1, lg: 2 }}
        spacing="0.5rem"
      >
        <Controller
          name="ValidationOptions.selectedValidation"
          control={control}
          rules={{
            deps: ['ValidationOptions.customVal'],
          }}
          render={({ field }) => {
            const items = Object.values(TextSelectedValidation).map(
              (value) => ({
                value,
                label: t(`features.common.${value.toLowerCase()}`),
              }),
            )

            return <SingleSelect items={items} {...field} />
          }}
        />
        <Controller
          name="ValidationOptions.customVal"
          control={control}
          rules={customValValidationOptions}
          render={({ field: { onChange, ...rest } }) => (
            <NumberInput
              flex={1}
              inputMode="numeric"
              showSteppers={false}
              placeholder={t(
                'features.adminFormBuilder.commonFieldComponents.charactersAllowedPlaceholder',
              )}
              isDisabled={!watchedSelectedValidation}
              onChange={validateNumberInput(onChange)}
              {...rest}
            />
          )}
        />
      </SimpleGrid>
      <FormErrorMessage>
        {errors?.ValidationOptions?.customVal?.message}
      </FormErrorMessage>
    </FormControl>
  )
}
