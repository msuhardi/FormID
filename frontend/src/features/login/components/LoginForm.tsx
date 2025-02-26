import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormControl, Stack } from '@chakra-ui/react'
import parse from 'html-react-parser'
import isEmail from 'validator/lib/isEmail'

import { INVALID_EMAIL_ERROR } from '~constants/validation'
import Button from '~components/Button'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Input from '~components/Input'

export type LoginFormInputs = {
  email: string
}

interface LoginFormProps {
  onSubmit: (inputs: LoginFormInputs) => Promise<void>
}

export const LoginForm = ({ onSubmit }: LoginFormProps): JSX.Element => {
  const { t } = useTranslation()

  const { handleSubmit, register, formState, setError } =
    useForm<LoginFormInputs>()

  const validateEmail = useCallback((value: string) => {
    return isEmail(value.trim()) || INVALID_EMAIL_ERROR
  }, [])

  const onSubmitForm = async (inputs: LoginFormInputs) => {
    return onSubmit(inputs).catch((e) => {
      setError('email', { type: 'server', message: e.message })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <FormControl
        isInvalid={!!formState.errors.email}
        isReadOnly={formState.isSubmitting}
        mb="2.5rem"
      >
        <FormLabel isRequired>
          {
            parse(
              t(
                'features.login.components.LoginForm.onlyAvailableForPublicOfficers',
              ),
            ) as unknown as string
          }
        </FormLabel>
        <Input
          autoComplete="email"
          autoFocus
          placeholder="e.g. budi@morowaliutarakab.go.id"
          {...register('email', {
            required: t(
              'features.login.components.LoginForm.emailEmptyErrorMsg',
            ),
            validate: validateEmail,
          })}
        />
        {formState.errors.email && (
          <FormErrorMessage>{formState.errors.email.message}</FormErrorMessage>
        )}
      </FormControl>
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        spacing="1.5rem"
        align="center"
      >
        <Button isFullWidth isLoading={formState.isSubmitting} type="submit">
          {t('features.login.components.LoginForm.login')}
        </Button>
      </Stack>
    </form>
  )
}
