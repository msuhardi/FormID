import { Dispatch, SetStateAction } from 'react'
import { BiX } from 'react-icons/bi'
import { Box, CloseButton, Divider, Flex, Stack, Text } from '@chakra-ui/react'
import { AnimatePresence, motion, MotionProps } from 'framer-motion'

import { AdminFormDto } from '~shared/types/form/form'

import {
  EditState,
  EditStateType,
} from '~features/admin-form/settings/SettingsRoutingPage/RouteMapContext'

import { BuilderDrawerInput } from './BuilderDrawerInput'

const MotionBox = motion(Box)

export type BuilderDrawerProps = {
  form: AdminFormDto
  editState: EditState
  setEditState: Dispatch<SetStateAction<EditState>>
}

export const BuilderDrawer = (props: BuilderDrawerProps) => {
  const { editState } = props
  const drawerMotionProps: MotionProps = {
    initial: { minWidth: 0, width: 0 },
    animate: {
      minWidth: '35%',
      width: '40%',
      transition: { duration: 0.2 },
    },
    exit: {
      minWidth: 0,
      width: 0,
      transition: { duration: 0.2 },
    },
  }

  return (
    <AnimatePresence>
      {editState.type && (
        <MotionBox
          bg="white"
          key="sidebar"
          pos="relative"
          as="aside"
          overflow="hidden"
          h="calc(100vh - 64px)"
          display="block"
          {...drawerMotionProps}
        >
          <BuilderDrawerContent {...props} />
        </MotionBox>
      )}
    </AnimatePresence>
  )
}

const BuilderDrawerContent = (props: BuilderDrawerProps) => {
  const { editState, setEditState } = props
  const drawerName = (() => {
    switch (editState.type) {
      case EditStateType.AddStep:
        return 'Next step'
      case EditStateType.EditCondition:
        return 'Edit routing condition'
      case EditStateType.EditApproval:
        return 'Edit request for approval'
      case EditStateType.EditTermination:
        return 'Edit end of route'
      default:
        return ''
    }
  })()

  const handleCloseDrawer = () => setEditState({ type: EditStateType.Inactive })

  return (
    <Flex
      flexDir="column"
      h="100%"
      overflow="hidden"
      borderLeft="1px"
      borderColor="neutral.300"
    >
      <Stack direction="row" pos="sticky" top={0} p={4} align="center">
        <Text textStyle="subhead-1" flex={1} textAlign="center">
          {drawerName}
        </Text>
        <CloseButton
          zIndex={1}
          fontSize="1.5rem"
          w={6}
          h={6}
          variant="clear"
          colorScheme="neutral"
          onClick={handleCloseDrawer}
        >
          <BiX />
        </CloseButton>
      </Stack>
      <Divider w="auto" />
      <BuilderDrawerInput {...props} />
    </Flex>
  )
}
