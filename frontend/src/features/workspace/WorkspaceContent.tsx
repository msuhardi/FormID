import { Box, Container, Grid, useDisclosure } from '@chakra-ui/react'

import { GUIDE_PAYMENTS_ENTRY } from '~constants/links'
import InlineMessage from '~components/InlineMessage'

import CreateFormModal from './components/CreateFormModal'
import {
  EmptyDefaultWorkspace,
  EmptyNewWorkspace,
} from './components/EmptyWorkspace'
import { WorkspaceFormRows } from './components/WorkspaceFormRow'
import { WorkspaceHeader } from './components/WorkspaceHeader'
import { useWorkspaceContext } from './WorkspaceContext'

export const WorkspaceContent = (): JSX.Element => {
  const { isLoading, totalFormsCount, isDefaultWorkspace } =
    useWorkspaceContext()
  const createFormModalDisclosure = useDisclosure()

  return (
    <>
      <CreateFormModal
        isOpen={createFormModalDisclosure.isOpen}
        onClose={createFormModalDisclosure.onClose}
      />
      {totalFormsCount === 0 && isDefaultWorkspace ? (
        <EmptyDefaultWorkspace
          handleOpenCreateFormModal={createFormModalDisclosure.onOpen}
          isLoading={isLoading}
        />
      ) : (
        <Grid
          bg="neutral.100"
          templateColumns="1fr"
          templateRows="auto 1fr auto"
          minH="100vh"
          templateAreas=" 'header' 'main'"
          overflowY="auto"
        >
          <Container
            gridArea="header"
            maxW="100%"
            borderBottom="1px solid var(--chakra-colors-neutral-300)"
            px={{ base: '2rem', md: '4rem' }}
            py="1rem"
          >
            <WorkspaceHeader
              handleOpenCreateFormModal={createFormModalDisclosure.onOpen}
            />
          </Container>
          {totalFormsCount === 0 && !isDefaultWorkspace ? (
            <EmptyNewWorkspace isLoading={isLoading} />
          ) : (
            <Box gridArea="main">
              <WorkspaceFormRows />
            </Box>
          )}

          <Container pt={{ base: '1rem', md: '1.5rem' }} />
        </Grid>
      )}
    </>
  )
}
