import { useCallback, useEffect, useMemo } from 'react'
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormControl } from '@chakra-ui/react'
import { get, isEmpty, isEqual } from 'lodash'
import isEmail from 'validator/lib/isEmail'

import { GUIDE_PREVENT_EMAIL_BOUNCE } from '~constants/links'
import { ADMIN_EMAIL_VALIDATION_RULES } from '~utils/formValidation'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import { TagInput } from '~components/TagInput'

import { useMutateFormSettings } from '../mutations'

interface EmailFormSectionProps {
  emails: string[]
}

export const EmailFormSection = ({
  emails: initialEmails,
}: EmailFormSectionProps): JSX.Element => {
  const { t } = useTranslation()
  const initialEmailSet = useMemo(() => new Set(initialEmails), [initialEmails])
  const formMethods = useForm({
    mode: 'onChange',
    defaultValues: { emails: initialEmails },
  })

  const {
    formState: { errors },
    reset,
  } = formMethods

  const { mutateFormEmails } = useMutateFormSettings()

  const handleSubmitEmails = useCallback(
    ({ emails }: { emails: string[] }) => {
      if (isEqual(new Set(emails.filter(Boolean)), initialEmailSet)) return
      return mutateFormEmails.mutate(emails)
    },
    [initialEmailSet, mutateFormEmails],
  )

  useEffect(() => reset({ emails: initialEmails }), [initialEmails, reset])

  return (
    <FormProvider {...formMethods}>
      <FormControl isInvalid={!isEmpty(errors)}>
        <FormLabel
          isRequired
          useMarkdownForDescription
          description={t('features.settings.general.formResponse.description', {
            guideLink: GUIDE_PREVENT_EMAIL_BOUNCE,
          })}
        >
          {t('features.settings.general.formResponse.inputLabel')}
        </FormLabel>
        <AdminEmailRecipientsInput onSubmit={handleSubmitEmails} />
        <FormErrorMessage>{get(errors, 'emails.message')}</FormErrorMessage>
      </FormControl>
    </FormProvider>
  )
}

interface AdminEmailRecipientsInputProps {
  onSubmit: (params: { emails: string[] }) => void
}

const AdminEmailRecipientsInput = ({
  onSubmit,
}: AdminEmailRecipientsInputProps): JSX.Element => {
  const { t } = useTranslation()
  const { getValues, setValue, control, handleSubmit } =
    useFormContext<{ emails: string[] }>()

  const tagValidation = useMemo(() => isEmail, [])

  const handleBlur = useCallback(() => {
    // Get rid of bad tags before submitting.
    setValue(
      'emails',
      getValues('emails').filter((email) => tagValidation(email)),
    )
    handleSubmit(onSubmit)()
  }, [getValues, handleSubmit, onSubmit, setValue, tagValidation])

  return (
    <Controller
      control={control}
      name="emails"
      rules={ADMIN_EMAIL_VALIDATION_RULES}
      render={({ field }) => (
        <TagInput
          placeholder={t('features.settings.general.formResponse.placeholder')}
          {...field}
          tagValidation={tagValidation}
          onBlur={handleBlur}
        />
      )}
    />
  )
}
