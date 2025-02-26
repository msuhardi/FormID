import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { FormControl, Stack, Text, useBreakpointValue } from '@chakra-ui/react'

import Button from '~components/Button'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Input from '~components/Input'
import ResendOtpButton from '~templates/ResendOtpButton'

export type OtpFormInputs = {
  otp: string
}

interface OtpFormProps {
  email: string
  otpPrefix: string
  onSubmit: (inputs: OtpFormInputs) => Promise<void>
  onResendOtp: () => Promise<void>
}

export const OtpForm = ({
  email,
  otpPrefix,
  onSubmit,
  onResendOtp,
}: OtpFormProps): JSX.Element => {
  const { handleSubmit, register, formState, setError } =
    useForm<OtpFormInputs>()

  const isMobile = useBreakpointValue({ base: true, xs: true, lg: false })

  const validateOtp = useCallback(
    (value: string) =>
      value.length === 6 || 'Silahkan masukan 6 digit kode OTP.',
    [],
  )

  const onSubmitForm = async (inputs: OtpFormInputs) => {
    return onSubmit(inputs).catch((e) => {
      setError('otp', { type: 'server', message: e.message })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <FormControl isInvalid={!!formState.errors.otp} mb="2.5rem">
        <FormLabel isRequired htmlFor="otp">
          {
            (
              <>
                Masukan kode OTP yang telah dikirim ke alamat{' '}
                <Text color="primary.500">{email.toLowerCase()}</Text>
              </>
            ) as unknown as string
          }
        </FormLabel>
        <Input
          type="text"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          {...register('otp', {
            required: 'Kode OTP harus diisi.',
            pattern: {
              value: /^[0-9\b]+$/,
              message: 'Hanya diperbolehkan angka.',
            },
            validate: validateOtp,
          })}
          prefix={otpPrefix === undefined ? undefined : `${otpPrefix} -`}
        />
        {formState.errors.otp && (
          <FormErrorMessage>{formState.errors.otp.message}</FormErrorMessage>
        )}
      </FormControl>
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        spacing="1rem"
        align="center"
      >
        <Button
          isFullWidth={isMobile}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Sign in
        </Button>
        <ResendOtpButton onResendOtp={onResendOtp} />
      </Stack>
    </form>
  )
}
