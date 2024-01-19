import { useTranslation } from 'react-i18next'

import { EmptyWorkspace, EmptyWorkspacePage } from './EmptyWorkspace'

export const EmptyDefaultWorkspace = ({
  isLoading,
  handleOpenCreateFormModal,
}: EmptyWorkspacePage) => {
  const { t } = useTranslation()

  return (
    <EmptyWorkspace
      isLoading={isLoading}
      handleOpenCreateFormModal={handleOpenCreateFormModal}
      title={t('features.emptyPlaceholder.noFormCreated.title')}
      subText={t('features.emptyPlaceholder.noFormCreated.helper')}
    />
  )
}
