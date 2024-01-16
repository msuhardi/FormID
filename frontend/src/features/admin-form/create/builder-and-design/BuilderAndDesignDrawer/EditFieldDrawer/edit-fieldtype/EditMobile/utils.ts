import { TFunction } from 'i18next'

import { SmsCountsDto } from '~shared/types/form'

export const formatSmsCounts = (
  smsCounts?: SmsCountsDto,
  t?: TFunction,
): string => {
  if (!smsCounts) {
    return 'Loading...'
  }
  return `${smsCounts.freeSmsCounts.toLocaleString()}/${smsCounts.quota.toLocaleString()} ${
    t ? t('features.adminFormBuilder.mobileNo.smsCounts') : 'SMSes used'
  }`
}
