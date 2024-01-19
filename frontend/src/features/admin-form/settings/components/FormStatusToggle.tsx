import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Skeleton, Stack, Text, useDisclosure } from '@chakra-ui/react'
import parse from 'html-react-parser'

import { FormResponseMode, FormStatus } from '~shared/types/form/form'

import { Switch } from '~components/Toggle/Switch'

import { useMutateFormSettings } from '../mutations'
import { useAdminFormSettings } from '../queries'

import { SecretKeyActivationModal } from './SecretKeyActivationModal'

export const FormStatusToggle = (): JSX.Element => {
  const { t } = useTranslation()
  const { data: formSettings, isLoading: isLoadingSettings } =
    useAdminFormSettings()

  const { status, responseMode } = formSettings ?? {}

  const storageModalProps = useDisclosure()
  const { onOpen: onOpenActivationModal } = storageModalProps

  const isFormPublic = useMemo(() => status === FormStatus.Public, [status])

  const { mutateFormStatus } = useMutateFormSettings()

  const handleToggleStatus = useCallback(() => {
    if (!status || isLoadingSettings || mutateFormStatus.isLoading) return

    const nextStatus =
      status === FormStatus.Public ? FormStatus.Private : FormStatus.Public

    if (
      nextStatus === FormStatus.Public &&
      responseMode === FormResponseMode.Encrypt
    ) {
      return onOpenActivationModal()
    }

    return mutateFormStatus.mutate(nextStatus)
  }, [
    isLoadingSettings,
    mutateFormStatus,
    onOpenActivationModal,
    responseMode,
    status,
  ])

  return (
    <Skeleton isLoaded={!isLoadingSettings && !!status}>
      <Stack>
        {formSettings?.responseMode === FormResponseMode.Encrypt && (
          <SecretKeyActivationModal
            {...storageModalProps}
            publicKey={formSettings.publicKey}
          />
        )}
        <Flex
          bg={isFormPublic ? 'success.100' : 'danger.200'}
          py="1rem"
          px="1.125rem"
          justify="space-between"
        >
          <Text textStyle="subhead-1" id="form-status">
            {parse(
              t('features.settings.general.formStatus.description', {
                status: t(
                  `features.settings.general.formStatus.${
                    isFormPublic ? 'open' : 'closed'
                  }`,
                ).toUpperCase(),
              }),
            )}
          </Text>
          <Switch
            aria-label={t('features.settings.general.formStatus.ariaLabel')}
            aria-describedby="form-status"
            isLoading={mutateFormStatus.isLoading}
            isChecked={isFormPublic}
            onChange={handleToggleStatus}
          />
        </Flex>
      </Stack>
    </Skeleton>
  )
}
