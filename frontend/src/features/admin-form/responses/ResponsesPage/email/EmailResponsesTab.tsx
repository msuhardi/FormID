import { useTranslation } from 'react-i18next'
import { Box, Container, Image, Skeleton, Stack, Text } from '@chakra-ui/react'
import simplur from 'simplur'

import EmailResponsesSvg from '~/assets/svgs/email-responses.svg'

import { useFormResponsesCount } from '../../queries'
import { EmptyResponses } from '../common/EmptyResponses'

export const EmailResponsesTab = (): JSX.Element => {
  const { t, i18n } = useTranslation()
  const { data: responsesCount, isLoading: isFormResponsesLoading } =
    useFormResponsesCount()

  if (responsesCount === 0) {
    return <EmptyResponses />
  }

  const count = responsesCount ?? 0
  const title = t('features.common.responsesResult.title', { count })

  return (
    <Container p={0} maxW="42.5rem">
      <Stack spacing="2rem">
        <Box w={{ base: '55%', sm: '28%' }}>
          <Image src={EmailResponsesSvg} />
        </Box>
        <Skeleton isLoaded={!isFormResponsesLoading} w="fit-content">
          <Text as="h2" textStyle="h2" whiteSpace="pre-wrap">
            {i18n.language.startsWith('en') ? simplur(title) : title}
          </Text>
        </Skeleton>
        <Text textStyle="body-1">
          {t('features.common.responsesResult.email.info')}
        </Text>
      </Stack>
    </Container>
  )
}
