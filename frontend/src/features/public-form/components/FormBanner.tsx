import { useMemo } from 'react'

import { getBannerProps } from '~utils/getBannerProps'
import { Banner } from '~components/Banner'

import { useEnv } from '~features/env/queries'

export const FormBanner = (): JSX.Element | null => {
  const { data: { siteBannerContent, isGeneralMaintenance } = {} } = useEnv()

  const bannerContent = useMemo(
    // Use || instead of ?? so that we fall through even if previous banners are empty string.
    () => siteBannerContent || isGeneralMaintenance || undefined,
    [isGeneralMaintenance, siteBannerContent],
  )

  const bannerProps = useMemo(
    () => getBannerProps(bannerContent),
    [bannerContent],
  )

  if (!bannerProps) return null

  return (
    <Banner useMarkdown variant={bannerProps.variant}>
      {bannerProps.msg}
    </Banner>
  )
}
