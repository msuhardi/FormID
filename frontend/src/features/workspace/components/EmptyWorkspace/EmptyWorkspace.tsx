import { useTranslation } from 'react-i18next'
import { BiPlus } from 'react-icons/bi'
import { Box, Flex, Text } from '@chakra-ui/react'

import EmptyWorkspaceSvg from '~assets/svgs/empty-workspace.svg'
import { useIsMobile } from '~hooks/useIsMobile'
import { fillHeightCss } from '~utils/fillHeightCss'
import Button from '~components/Button'

export interface EmptyWorkspacePage {
  isLoading: boolean
  handleOpenCreateFormModal?: () => void
}

interface EmptyWorkspaceProps extends EmptyWorkspacePage {
  title: string
  subText: string
}

export const EmptyWorkspace = ({
  isLoading,
  handleOpenCreateFormModal,
  title,
  subText,
}: EmptyWorkspaceProps): JSX.Element => {
  const { t } = useTranslation()
  const isMobile = useIsMobile()

  return (
    <Flex
      justify="flex-start"
      flexDir="column"
      align="center"
      px="2rem"
      py="4rem"
      bg="neutral.100"
      css={fillHeightCss}
    >
      <Text
        as="h2"
        textStyle="h2"
        color="primary.500"
        mb="1rem"
        textAlign="center"
      >
        {title}
      </Text>
      <Text textStyle="body-1" color="secondary.500" textAlign="center">
        {subText}
      </Text>
      {!!handleOpenCreateFormModal && (
        <Button
          isFullWidth={isMobile}
          isDisabled={isLoading}
          onClick={handleOpenCreateFormModal}
          leftIcon={<BiPlus fontSize="1.5rem" />}
          mt={{ base: '2.5rem', md: '2rem' }}
        >
          {t('features.common.createForm')}
        </Button>
      )}
      <Box
        w="100%"
        flex={1}
        bgImage={EmptyWorkspaceSvg}
        bgRepeat="no-repeat"
        bgPosition="center"
      />
    </Flex>
  )
}
