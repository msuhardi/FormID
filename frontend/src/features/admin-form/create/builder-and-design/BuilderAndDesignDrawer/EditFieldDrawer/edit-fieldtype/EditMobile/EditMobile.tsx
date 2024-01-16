import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, FormControl, useDisclosure } from '@chakra-ui/react'
import { extend, pick } from 'lodash'

import { MobileFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import Toggle from '~components/Toggle'

import { useFreeSmsQuota } from '~features/admin-form/common/queries'

import { CreatePageDrawerContentContainer } from '../../../../../common'
import { useCreateTabForm } from '../../../../useCreateTabForm'
import {
  Description,
  Question,
  RequiredToggle,
} from '../common/CommonFieldComponents'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

import { SmsCountMessage } from './SmsCountMessage'
import { SmsCountsModal } from './SmsCountsModal'
import { TwilioCredentialsMessage } from './TwilioCredentialsMessage'

const EDIT_MOBILE_KEYS = [
  'title',
  'description',
  'required',
  'isVerifiable',
  'allowIntlNumbers',
] as const

type EditMobileProps = EditFieldProps<MobileFieldBase>

type EditMobileInputs = Pick<MobileFieldBase, typeof EDIT_MOBILE_KEYS[number]>

export const EditMobile = ({ field }: EditMobileProps): JSX.Element => {
  const { t } = useTranslation()
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditMobileInputs, MobileFieldBase>({
    field,
    transform: {
      input: (inputField) => pick(inputField, EDIT_MOBILE_KEYS),
      output: (formOutput, originalField) =>
        extend({}, originalField, formOutput),
    },
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
  )

  const { data: form } = useCreateTabForm()
  const hasTwilioCredentials = useMemo(() => !!form?.msgSrvcName, [form])

  const { data: freeSmsCount } = useFreeSmsQuota()
  const isToggleVfnDisabled = useMemo(() => {
    if (!freeSmsCount) return true
    return (
      !field.isVerifiable &&
      !hasTwilioCredentials &&
      freeSmsCount.freeSmsCounts >= freeSmsCount.quota
    )
  }, [field.isVerifiable, freeSmsCount, hasTwilioCredentials])

  const smsCountsDisclosure = useDisclosure()

  return (
    <>
      <CreatePageDrawerContentContainer>
        <Question
          isLoading={isLoading}
          errors={errors}
          register={register}
          requiredValidationRule={requiredValidationRule}
        />
        <Description
          isLoading={isLoading}
          errors={errors}
          register={register}
        />
        <RequiredToggle isLoading={isLoading} register={register} />
        <FormControl isReadOnly={isLoading}>
          <Toggle
            {...register('allowIntlNumbers')}
            label={t(
              'features.adminFormBuilder.mobileNo.allowInternationalNumber',
            )}
          />
        </FormControl>
        <Box>
          <FormControl isReadOnly={isLoading} isDisabled={isToggleVfnDisabled}>
            <Toggle
              {...register('isVerifiable', {
                onChange: (e) => {
                  if (e.target.checked && !hasTwilioCredentials) {
                    smsCountsDisclosure.onOpen()
                  }
                },
              })}
              label={t(
                'features.adminFormBuilder.mobileNo.otpVerification.title',
              )}
              description={t(
                'features.adminFormBuilder.mobileNo.otpVerification.description',
              )}
            />
          </FormControl>
          <SmsCountMessage
            hasTwilioCredentials={hasTwilioCredentials}
            freeSmsCount={freeSmsCount}
          />
          <TwilioCredentialsMessage
            freeSmsCount={freeSmsCount}
            hasTwilioCredentials={hasTwilioCredentials}
          />
        </Box>
        <FormFieldDrawerActions
          isLoading={isLoading}
          buttonText={buttonText}
          handleClick={handleUpdateField}
          handleCancel={handleCancel}
        />
      </CreatePageDrawerContentContainer>
      <SmsCountsModal
        freeSmsCount={freeSmsCount}
        isOpen={smsCountsDisclosure.isOpen}
        onClose={smsCountsDisclosure.onClose}
      />
    </>
  )
}
