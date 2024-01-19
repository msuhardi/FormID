import { useTranslation } from 'react-i18next'
import { Skeleton, Text } from '@chakra-ui/react'

import { GUIDE_TWILIO } from '~constants/links'
import InlineMessage from '~components/InlineMessage'
import Link from '~components/Link'

import { useFreeSmsQuota } from '~features/admin-form/common/queries'

import { TwilioDetailsInputs } from './TwilioDetailsInputs'

export const TwilioSettingsSection = (): JSX.Element => {
  const { t } = useTranslation()
  const { data: freeSmsQuota } = useFreeSmsQuota()

  return (
    <>
      <Text mb="1rem">
        {t('features.settings.twilioCredentials.description', {
          quota: (
            <Skeleton as="span" isLoaded={!!freeSmsQuota}>
              {freeSmsQuota?.quota.toLocaleString() ?? '10,000'}
            </Skeleton>
          ),
        })}
        <Link href={GUIDE_TWILIO} isExternal>
          {t('features.settings.twilioCredentials.link')}
        </Link>
      </Text>
      <InlineMessage mb="1rem">
        {t('features.settings.twilioCredentials.info')}
      </InlineMessage>
      <TwilioDetailsInputs />
    </>
  )
}
