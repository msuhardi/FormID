import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Flex } from '@chakra-ui/react'
import { useFeatureValue } from '@growthbook/growthbook-react'

import { FormResponseMode } from '~shared/types'

import {
  ACTIVE_ADMINFORM_RESULTS_ROUTE_REGEX,
  RESULTS_CHARTS_SUBROUTE,
  RESULTS_FEEDBACK_SUBROUTE,
  RESULTS_RESPONSES_SUBROUTE,
} from '~constants/routes'
import { useDraggable } from '~hooks/useDraggable'
import { noPrintCss } from '~utils/noPrintCss'
import Badge from '~components/Badge'
import { NavigationTab, NavigationTabList } from '~templates/NavigationTabs'

import { useAdminForm } from '~features/admin-form/common/queries'

export const FormResultsNavbar = (): JSX.Element => {
  const { t } = useTranslation()
  const { ref, onMouseDown } = useDraggable<HTMLDivElement>()

  const { data: form } = useAdminForm()

  const { pathname } = useLocation()

  const checkTabActive = useCallback(
    (to: string) => {
      const match = pathname.match(ACTIVE_ADMINFORM_RESULTS_ROUTE_REGEX)
      return (match?.[2] ?? '/') === `/${to}`
    },
    [pathname],
  )

  const isChartsEnabled = useFeatureValue('charts', false) // disabled by default
  const isFormEncryptMode = form?.responseMode === FormResponseMode.Encrypt
  const shouldShowCharts = isFormEncryptMode && isChartsEnabled
  return (
    <Flex
      sx={noPrintCss}
      w="100vw"
      position="sticky"
      top={0}
      flexDir="column"
      borderBottom="1px"
      borderBottomColor="neutral.300"
      bg="white"
      zIndex="docked"
      flex={0}
    >
      <NavigationTabList
        ref={ref}
        onMouseDown={onMouseDown}
        maxW="69.5rem"
        px="1.25rem"
        pt="0.625rem"
        m="auto"
        w="100vw"
        borderBottom="none"
        justifySelf="flex-start"
      >
        <NavigationTab
          to={RESULTS_RESPONSES_SUBROUTE}
          isActive={checkTabActive(RESULTS_RESPONSES_SUBROUTE)}
        >
          {t('features.common.responses')}
        </NavigationTab>
        <NavigationTab
          to={RESULTS_FEEDBACK_SUBROUTE}
          isActive={checkTabActive(RESULTS_FEEDBACK_SUBROUTE)}
        >
          {t('features.common.feedback')}
        </NavigationTab>
        {shouldShowCharts ? (
          <NavigationTab
            to={RESULTS_CHARTS_SUBROUTE}
            isActive={checkTabActive(RESULTS_CHARTS_SUBROUTE)}
          >
            Charts
            <Badge
              colorScheme="primary"
              variant="subtle"
              color="secondary.500"
              ml="0.5rem"
            >
              Beta
            </Badge>
          </NavigationTab>
        ) : null}
      </NavigationTabList>
    </Flex>
  )
}
