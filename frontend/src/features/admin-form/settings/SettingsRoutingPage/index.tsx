import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BiPlus } from 'react-icons/bi'
import { Box, Flex, Stack, Text, useDisclosure } from '@chakra-ui/react'

import RouteMapEmptySvg from '~/assets/svgs/route-map-empty.svg'

import Button from '~components/Button'

import { useAdminForm } from '~features/admin-form/common/queries'
// import { CategoryHeader } from '~features/admin-form/settings/components/CategoryHeader'
import { CreateRouteMapModal } from '~features/admin-form/settings/components/CreateRoutingModal'
import { useAdminFormSettings } from '~features/admin-form/settings/queries'
import {
  EditState,
  EditStateType,
} from '~features/admin-form/settings/SettingsRoutingPage/RouteMapContext'

import { BuilderContent } from './components/BuilderContent'
import { BuilderDrawer } from './components/BuilderDrawer'

export const SettingsRoutingPage = (): JSX.Element => {
  const { t } = useTranslation()

  const { data: form } = useAdminForm()
  const { data: settings } = useAdminFormSettings()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [editState, setEditState] = useState<EditState>({
    type: EditStateType.Inactive,
  })

  if (!settings?.routeMap || !form) {
    return (
      <>
        <Stack
          spacing={{ base: '2rem', md: '4rem' }}
          w="100%"
          alignItems={{ base: 'left', md: 'center' }}
          justifyContent="center"
          minH={{ base: '100%', md: '80%' }}
        >
          <Stack
            w="100%"
            spacing={{ base: '1rem', md: '2.5rem' }}
            alignItems={{ base: 'left', md: 'center' }}
          >
            <Stack
              w="100%"
              spacing="1rem"
              alignItems={{ base: 'left', md: 'center' }}
            >
              <Text
                as="h2"
                textStyle="h2"
                whiteSpace="pre-wrap"
                color="primary.500"
              >
                Belum ada <i>routing</i> formulir yang ditetapkan
              </Text>
              <Text textStyle="body-1" color="secondary.500">
                Tetapkan <i>routing</i> untuk otomasi persetujuan formulir Anda
              </Text>
            </Stack>

            <Button
              // isDisabled={isLoading}
              onClick={onOpen}
              leftIcon={<BiPlus fontSize="1.5rem" />}
            >
              {t('features.settings.routing.cta')}
            </Button>
          </Stack>

          <Box
            flex={1}
            bgImage={RouteMapEmptySvg}
            h="100%"
            maxH="18.75rem"
            w="100%"
            bgRepeat="no-repeat"
            bgPosition={{ base: 'left', md: 'center' }}
          />
        </Stack>
        <CreateRouteMapModal isOpen={isOpen} onClose={onClose} />
      </>
    )
  }

  return (
    <Flex flexDir="row" justifyContent="space-between">
      <BuilderContent
        routeMap={settings?.routeMap}
        editState={editState}
        setEditState={setEditState}
      />
      <BuilderDrawer
        form={form}
        editState={editState}
        setEditState={setEditState}
      />
    </Flex>
  )
}
