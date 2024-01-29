import React, { useCallback, useMemo, useRef } from 'react'
import { RegisterOptions, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BiUpload } from 'react-icons/bi'
import {
  Container,
  FormControl,
  FormErrorMessage,
  IconButton,
  Input,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import simplur from 'simplur'

import { GUIDE_SECRET_KEY_LOSS } from '~constants/links'
import { useIsMobile } from '~hooks/useIsMobile'
import formsgSdk from '~utils/formSdk'
import Button from '~components/Button'
import FormLabel from '~components/FormControl/FormLabel'
import Link from '~components/Link'

import { useStorageResponsesContext } from '../../ResponsesPage/storage'

const SECRET_KEY_NAME = 'secretKey'
const SECRET_KEY_REGEX = /^[a-zA-Z0-9/+]+={0,2}$/

interface SecretKeyFormInputs {
  [SECRET_KEY_NAME]: string
}

const useSecretKeyVerification = () => {
  const { t } = useTranslation()
  const { setSecretKey, formPublicKey, isLoading, totalResponsesCount } =
    useStorageResponsesContext()

  const {
    formState: { errors },
    setError,
    register,
    setValue,
    handleSubmit,
  } = useForm<SecretKeyFormInputs>()

  const fileUploadRef = useRef<HTMLInputElement | null>(null)

  const secretKeyValidationRules: RegisterOptions = useMemo(() => {
    return {
      required: t('features.common.responsesResult.secretKey.required'),
      validate: (secretKey) => {
        // Should not see this error message.
        if (!formPublicKey) return 'This form is not a storage mode form'

        const trimmedSecretKey = secretKey.trim()
        const isKeypairValid =
          SECRET_KEY_REGEX.test(trimmedSecretKey) &&
          formsgSdk.crypto.valid(formPublicKey, trimmedSecretKey)

        return (
          isKeypairValid ||
          t('features.common.responsesResult.secretKey.incorrectSecretKey')
        )
      },
    }
  }, [formPublicKey, t])

  const handleVerifyKeypair = handleSubmit(({ secretKey }) => {
    return setSecretKey(secretKey.trim())
  })

  const handleFileSelect = useCallback(
    ({ target }: React.ChangeEvent<HTMLInputElement>) => {
      const file = target.files?.[0]
      // Reset file input so the same file selected will trigger this onChange
      // function.
      if (fileUploadRef.current) {
        fileUploadRef.current.value = ''
      }

      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        if (!e.target) return
        const text = e.target.result?.toString().trim()

        if (!text || !SECRET_KEY_REGEX.test(text)) {
          return setError(
            SECRET_KEY_NAME,
            {
              type: 'invalidFile',
              message: t(
                'features.common.responsesResult.secretKey.incorrectSecretKeyFile',
              ),
            },
            { shouldFocus: true },
          )
        }

        setValue(SECRET_KEY_NAME, text, { shouldValidate: true })
      }
      reader.readAsText(file)
    },
    [setError, setValue, t],
  )

  return {
    isLoading,
    totalResponsesCount,
    fileUploadRef,
    handleFileSelect,
    handleVerifyKeypair,
    secretKeyValidationRules,
    register,
    errors,
  }
}

export const SecretKeyVerification = ({
  heroSvg,
  ctaText,
  label,
  hideResponseCount,
}: {
  heroSvg: JSX.Element
  ctaText: string
  label: string
  hideResponseCount?: boolean
}): JSX.Element => {
  const { t, i18n } = useTranslation()
  const {
    isLoading,
    totalResponsesCount,
    fileUploadRef,
    handleVerifyKeypair,
    register,
    handleFileSelect,
    errors,
    secretKeyValidationRules,
  } = useSecretKeyVerification()

  const isMobile = useIsMobile()

  const count = totalResponsesCount ?? 0
  const title = t('features.common.responsesResult.title', { count })

  return (
    <Container p={0} maxW="42.5rem">
      <Stack spacing="2rem">
        {heroSvg}
        {!hideResponseCount ? (
          <Skeleton isLoaded={!isLoading} w="fit-content">
            <Text as="h2" textStyle="h2" whiteSpace="pre-wrap">
              {i18n.language.startsWith('en') ? simplur(title) : title}
            </Text>
          </Skeleton>
        ) : null}
        <form onSubmit={handleVerifyKeypair} noValidate>
          {/* Hidden input field to trigger file selector, can be anywhere in the DOM */}
          <Input
            name="secretKeyFile"
            ref={fileUploadRef}
            type="file"
            accept="text/plain"
            onChange={handleFileSelect}
            display="none"
          />
          <FormControl isRequired isInvalid={!!errors.secretKey} mb="1rem">
            <FormLabel
              description={t(
                'features.common.responsesResult.secretKey.inputDescription',
              )}
            >
              {label}
            </FormLabel>
            <Stack direction="row" spacing="0.5rem">
              <Skeleton isLoaded={!isLoading} w="100%">
                <Input
                  type="password"
                  isDisabled={isLoading}
                  {...register(SECRET_KEY_NAME, secretKeyValidationRules)}
                />
              </Skeleton>
              <Skeleton isLoaded={!isLoading}>
                <IconButton
                  isDisabled={isLoading}
                  variant="outline"
                  aria-label="Pass secret key from file"
                  icon={<BiUpload />}
                  onClick={() => fileUploadRef.current?.click()}
                />
              </Skeleton>
            </Stack>
            <FormErrorMessage>{errors.secretKey?.message}</FormErrorMessage>
          </FormControl>
          <Stack
            spacing={{ base: '1.5rem', md: '2rem' }}
            align="center"
            direction={{ base: 'column', md: 'row' }}
            mt="2rem"
          >
            <Button isFullWidth={isMobile} isDisabled={isLoading} type="submit">
              {ctaText}
            </Button>
            <Link variant="standalone" isExternal href={GUIDE_SECRET_KEY_LOSS}>
              {t(
                'features.common.responsesResult.secretKey.missingSecretKeyCta',
              )}
            </Link>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}
