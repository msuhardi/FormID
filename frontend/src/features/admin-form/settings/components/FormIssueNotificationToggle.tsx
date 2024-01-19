import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@chakra-ui/react'

import Toggle from '~components/Toggle'

import { useMutateFormSettings } from '../mutations'
import { useAdminFormSettings } from '../queries'

export const FormIssueNotificationToggle = (): JSX.Element => {
  const { t } = useTranslation()
  const { data: settings, isLoading: isLoadingSettings } =
    useAdminFormSettings()

  const hasIssueNotification = useMemo(
    () => settings && settings?.hasIssueNotification,
    [settings],
  )

  const { mutateFormIssueNotification } = useMutateFormSettings()

  const handleToggleIssueNotification = useCallback(() => {
    if (!settings || isLoadingSettings || mutateFormIssueNotification.isLoading)
      return
    const nextHasIssueNotification = !settings.hasIssueNotification
    return mutateFormIssueNotification.mutate(nextHasIssueNotification)
  }, [isLoadingSettings, mutateFormIssueNotification, settings])

  return (
    <Skeleton isLoaded={!isLoadingSettings}>
      <Toggle
        isLoading={mutateFormIssueNotification.isLoading}
        isChecked={hasIssueNotification}
        label={t('features.settings.general.emailNotification.label')}
        description={t(
          'features.settings.general.emailNotification.description',
        )}
        onChange={() => handleToggleIssueNotification()}
      />
    </Skeleton>
  )
}
