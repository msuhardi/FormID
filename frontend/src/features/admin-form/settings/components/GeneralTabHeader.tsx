import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton, Wrap } from '@chakra-ui/react'

import { FormResponseMode } from '~shared/types/form'

import Badge from '~components/Badge'

import { useAdminFormSettings } from '../queries'

import { CategoryHeader } from './CategoryHeader'

export const GeneralTabHeader = (): JSX.Element => {
  const { t } = useTranslation()
  const { data: settings, isLoading: isLoadingSettings } =
    useAdminFormSettings()

  const readableFormResponseMode = useMemo(() => {
    switch (settings?.responseMode) {
      case FormResponseMode.Email:
        return t('features.common.responseMode.email')
      case FormResponseMode.Encrypt:
        return t('features.common.responseMode.storage')
    }
    return t('features.common.loading')
  }, [settings?.responseMode, t])
  return (
    <Wrap
      shouldWrapChildren
      spacing="0.5rem"
      justify="space-between"
      mb="2.5rem"
    >
      <CategoryHeader mb={0}>
        {t('features.settings.general.title')}
      </CategoryHeader>
      <Skeleton isLoaded={!isLoadingSettings}>
        <Badge variant="subtle" colorScheme="primary" color="secondary.500">
          {readableFormResponseMode}
        </Badge>
      </Skeleton>
    </Wrap>
  )
}
