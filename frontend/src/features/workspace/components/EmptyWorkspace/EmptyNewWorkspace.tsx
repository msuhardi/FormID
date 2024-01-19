import { useTranslation } from 'react-i18next'

import { EmptyWorkspace, EmptyWorkspacePage } from './EmptyWorkspace'

export const EmptyNewWorkspace = ({ isLoading }: EmptyWorkspacePage) => {
  const { t } = useTranslation()

  return (
    <EmptyWorkspace
      isLoading={isLoading}
      title={t('features.emptyPlaceholder.emptyFolder.title')}
      subText={t('features.emptyPlaceholder.emptyFolder.helper')}
    />
  )
}
