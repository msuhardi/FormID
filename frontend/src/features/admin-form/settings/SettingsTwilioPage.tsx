import { useTranslation } from 'react-i18next'
import { Wrap } from '@chakra-ui/react'

import { CategoryHeader } from './components/CategoryHeader'
import { TwilioSettingsSection } from './components/TwilioSettingsSection'
import { FreeSmsQuota } from './components/TwilioSettingsSection/FreeSmsQuota'

export const SettingsTwilioPage = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <>
      <Wrap
        shouldWrapChildren
        justify="space-between"
        align="center"
        mb="2.5rem"
      >
        <CategoryHeader mb={0} mr="2rem">
          {t('features.settings.tabs.twilioCredentials')}
        </CategoryHeader>
        <FreeSmsQuota />
      </Wrap>
      <TwilioSettingsSection />
    </>
  )
}
