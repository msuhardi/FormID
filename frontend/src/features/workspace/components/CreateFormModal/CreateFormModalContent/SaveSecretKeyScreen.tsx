import { SyntheticEvent, useCallback, useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { BiMailSend, BiRightArrowAlt } from 'react-icons/bi'
import {
  Box,
  ButtonGroup,
  Code,
  Container,
  Icon,
  Link,
  ModalBody,
  Stack,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import dedent from 'dedent'
import FileSaver from 'file-saver'

import { BxsError } from '~assets/icons'
import Button from '~components/Button'
import Checkbox from '~components/Checkbox'
import IconButton from '~components/IconButton'
import Tooltip from '~components/Tooltip'

import { trackClickSecretKeyMailTo } from '~features/analytics/AnalyticsService'

import { useCreateFormWizard } from '../CreateFormWizardContext'

/** Default hook to be used in SaveSecretKeyScreen */
const useSaveSecretKeyDefault = () => {
  const {
    formMethods: {
      control,
      register,
      formState: { isValid },
    },
    handleCreateStorageModeForm,
    isLoading,
    keypair: { secretKey },
  } = useCreateFormWizard()

  const [hasDownloaded, setHasDownloaded] = useState(false)

  const { hasCopied, onCopy } = useClipboard(secretKey)

  const titleInputValue = useWatch({ control, name: 'title' })

  trackClickSecretKeyMailTo(titleInputValue)
  const mailToHref = useMemo(() => {
    const subject = `Shared Secret Key for ${titleInputValue}`
    const body = dedent`
        Dear collaborator,

        I am sharing my form's secret key with you for safekeeping and backup. This is an important key that is needed to access all form responses.

        Form title: ${titleInputValue}

        Secret key: ${secretKey}

        All you need to do is keep this email as a record, and please do not share this key with anyone else.

        Thank you for helping to safekeep my form!`

    const href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    return href
  }, [secretKey, titleInputValue])

  const handleDownloadKey = useCallback(() => {
    FileSaver.saveAs(
      new Blob([secretKey], { type: 'text/plain;charset=utf-8' }),
      `Kode form - ${titleInputValue}.txt`,
    )
    setHasDownloaded(true)
  }, [secretKey, titleInputValue])

  const handleCopyKey = useCallback(
    (e?: SyntheticEvent) => {
      e?.preventDefault()
      e?.stopPropagation()
      onCopy()
    },
    [onCopy],
  )

  return {
    isLoading,
    hasDownloaded,
    isSubmitEnabled: isValid && hasDownloaded,
    hasCopiedKey: hasCopied,
    handleCopyKey,
    handleDownloadKey,
    mailToHref,
    handleCreateStorageModeForm,
    secretKey,
    register,
  }
}

interface SaveSecretKeyScreenProps {
  useSaveSecretKey?: typeof useSaveSecretKeyDefault
}

export const SaveSecretKeyScreen = ({
  useSaveSecretKey = useSaveSecretKeyDefault,
}: SaveSecretKeyScreenProps): JSX.Element => {
  const {
    isLoading,
    handleCopyKey,
    handleCreateStorageModeForm,
    handleDownloadKey,
    mailToHref,
    hasDownloaded,
    isSubmitEnabled,
    hasCopiedKey,
    secretKey,
    register,
  } = useSaveSecretKey()

  return (
    <>
      <ModalBody whiteSpace="pre-wrap">
        <Container maxW="42.5rem" p={0}>
          <Box
            bg="white"
            borderRadius="4px"
            border="1px solid"
            borderColor="neutral.200"
            py="3rem"
            px={{ base: '1.5rem', md: '2.5rem' }}
            mt={{ base: '5.5rem', md: '1rem' }}
          >
            <Stack direction="column" spacing="1rem" mb="1rem">
              <Icon
                as={BxsError}
                fontSize="3rem"
                aria-hidden
                color="danger.500"
              />
              <Text as="header" textStyle="h2" color="secondary.700">
                Unduh kode untuk lanjut
              </Text>
            </Stack>
            <Text textStyle="body-1" color="secondary.500" mb="2.5rem">
              Kode berikut dibutuhkan tiap kali Anda mengakses hasil tanggapan
              formulir ini. Apabila hilang,{' '}
              <Text color="danger.500" textStyle="subhead-1" as="span">
                semua hasil tanggapan akan hilang
              </Text>
              . Anda juga bisa{' '}
              <Link variant="inline" href={mailToHref}>
                kirim kode melalui email
              </Link>
              .
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }}>
              <Tooltip mt={0} label={hasCopiedKey ? 'Copied!' : 'Copy key'}>
                <Code
                  // To allow for focus styling on code element.
                  data-group
                  tabIndex={0}
                  flex={1}
                  transition="background 0.2s ease"
                  cursor="pointer"
                  onClick={handleCopyKey}
                  _groupFocus={{
                    bg: 'neutral.400',
                  }}
                  _hover={{
                    bg: 'neutral.300',
                  }}
                  wordBreak="break-word"
                  display="inline-flex"
                  alignItems="center"
                  w="100%"
                  h="auto"
                  px="0.75rem"
                  py="0.625rem"
                  bg="neutral.200"
                  color="secondary.500"
                  borderRadius="4px"
                >
                  {secretKey}
                </Code>
              </Tooltip>
              <ButtonGroup>
                <Button onClick={handleDownloadKey}>Unduh kode</Button>
                <IconButton
                  as="a"
                  icon={<BiMailSend />}
                  aria-label="Kirim kode melalui email"
                  href={mailToHref}
                  variant="outline"
                />
              </ButtonGroup>
            </Stack>
          </Box>
          {hasDownloaded && (
            <Box mt="1rem">
              <Checkbox
                aria-label="Syarat penyimpanan hasil tanggapan"
                {...register('storageAck', {
                  required: true,
                })}
              >
                Saya mengerti semua hasil tanggapan formulir akan hilang apabila
                saya kehilangan kode ini.
              </Checkbox>
            </Box>
          )}
          <Button
            mt="2.25rem"
            isDisabled={!isSubmitEnabled}
            rightIcon={<BiRightArrowAlt fontSize="1.5rem" />}
            type="submit"
            isLoading={isLoading}
            onClick={handleCreateStorageModeForm}
            isFullWidth
          >
            <Text lineHeight="1.5rem">
              Saya sudah menyimpan kode formulir secara aman
            </Text>
          </Button>
        </Container>
      </ModalBody>
    </>
  )
}
