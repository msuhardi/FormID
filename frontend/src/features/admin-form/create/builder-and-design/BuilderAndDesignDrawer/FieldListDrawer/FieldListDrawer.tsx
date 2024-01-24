import { useTranslation } from 'react-i18next'
import {
  Box,
  Divider,
  Flex,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react'

import { useCreatePageSidebar } from '~features/admin-form/create/common/CreatePageSidebarContext'

import { useCreateTabForm } from '../../../builder-and-design/useCreateTabForm'
import { CreatePageDrawerCloseButton } from '../../../common'
import { FieldListTabIndex } from '../../constants'

import { BasicFieldPanel } from './field-panels'

export const FieldListDrawer = (): JSX.Element => {
  const { t } = useTranslation()
  const { fieldListTabIndex, setFieldListTabIndex } = useCreatePageSidebar()
  const { isLoading } = useCreateTabForm()

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
