import { useTranslation } from 'react-i18next'
import {
  Box,
  Divider,
  Flex,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'

import { featureFlags } from '~shared/constants'

import { Tab } from '~components/Tabs'

import { useCreatePageSidebar } from '~features/admin-form/create/common/CreatePageSidebarContext'
import { useFeatureFlags } from '~features/feature-flags/queries'
import { useUser } from '~features/user/queries'

import { useCreateTabForm } from '../../../builder-and-design/useCreateTabForm'
import { CreatePageDrawerCloseButton } from '../../../common'
import { FieldListTabIndex } from '../../constants'

import { BasicFieldPanel } from './field-panels'

export const FieldListDrawer = (): JSX.Element => {
  const { t } = useTranslation()
  const { fieldListTabIndex, setFieldListTabIndex } = useCreatePageSidebar()
  const { isLoading } = useCreateTabForm()

  const { user } = useUser()
  const { data: flags } = useFeatureFlags()

  const displayPayments =
    user?.betaFlags?.payment || flags?.has(featureFlags.payment)

  const tabsDataList = [
    {
      component: BasicFieldPanel,
      isHidden: false,
      isDisabled: isLoading,
      key: FieldListTabIndex.Basic,
    },
  ].filter((tab) => !tab.isHidden)

  return (
    <Tabs
      pos="relative"
      h="100%"
      display="flex"
      flexDir="column"
      index={fieldListTabIndex}
      onChange={setFieldListTabIndex}
      isLazy
    >
      <Box pt="1rem" px="1.5rem" bg="white">
        <Flex justify="space-between">
          <Text textStyle="subhead-3" color="secondary.500" mb="1rem">
            {t('features.adminFormBuilder.builder.title')}
          </Text>
          <CreatePageDrawerCloseButton />
        </Flex>
        <Divider w="auto" mx="-1.5rem" />
      </Box>
      <TabPanels pb="1rem" flex={1} overflowY="auto">
        {tabsDataList.map((tab) => (
          <TabPanel key={tab.key}>
            <tab.component />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  )
}
