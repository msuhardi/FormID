import { useTranslation } from 'react-i18next'
import { BiTrash } from 'react-icons/bi'
import { Box, Flex, Stack } from '@chakra-ui/react'

import { useIsMobile } from '~hooks/useIsMobile'
import Button from '~components/Button'
import IconButton from '~components/IconButton'

export interface SaveActionGroupProps {
  handleCancel: () => void
  handleDelete?: () => void
  handleSubmit: () => void
  submitButtonLabel?: string
  isLoading: boolean
}

export const SaveActionGroup = ({
  submitButtonLabel = 'Save changes',
  handleCancel,
  handleDelete,
  handleSubmit,
  isLoading,
}: SaveActionGroupProps): JSX.Element => {
  const isMobile = useIsMobile()
  const { t } = useTranslation()

  return (
    <Flex
      justify="space-between"
      align="center"
      py="0.375rem"
      px={{ base: '1rem', md: '2rem' }}
      borderTop="1px solid"
      borderColor="neutral.300"
    >
      {handleDelete ? (
        <IconButton
          variant="clear"
          colorScheme="danger"
          aria-label="Delete logic"
          icon={<BiTrash />}
          onClick={handleDelete}
          isDisabled={isLoading}
        />
      ) : (
        <Box />
      )}
      <Stack
        spacing="1rem"
        direction={{ base: 'column', md: 'row-reverse' }}
        w="100%"
      >
        <Button
          isLoading={isLoading}
          onClick={handleSubmit}
          isFullWidth={isMobile}
        >
          {submitButtonLabel}
        </Button>
        <Button
          variant="clear"
          colorScheme="secondary"
          isDisabled={isLoading}
          onClick={handleCancel}
          isFullWidth={isMobile}
        >
          {t('features.common.cancel')}
        </Button>
      </Stack>
    </Flex>
  )
}
