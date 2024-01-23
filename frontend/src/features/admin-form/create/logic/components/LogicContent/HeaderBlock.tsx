import { useTranslation } from 'react-i18next'
import { Flex, Icon, Stack, Text } from '@chakra-ui/react'

import { ALLOWED_FIELDS_META } from '../../constants'

export const HeaderBlock = (): JSX.Element => {
  const { t } = useTranslation()

  return (
    <Flex
      px={{ base: '1.5rem', md: '2rem' }}
      py={{ base: '1rem', md: '2rem' }}
      flexDir="column"
      bg="white"
      border="1px solid"
      borderColor="neutral.300"
      borderRadius="4px"
    >
      <Text as="h2" textStyle="h2" mb="0.5rem">
        {t('features.logicPage.logic')}
      </Text>
      <Text textStyle="body-1" mb="1.5rem">
        {t('features.logicPage.logicInstruction')}
      </Text>
      <Stack spacing="0.75rem" maxW="28rem">
        <Text textStyle="subhead-3">
          {t('features.logicPage.allowedFields')}
        </Text>
        <Flex flexWrap="wrap" flexDir="row" columnGap="2rem" rowGap="0.75rem">
          {ALLOWED_FIELDS_META.map(({ icon, label }) => (
            <Stack
              key={label}
              direction="row"
              align="center"
              w="fit-content"
              minW="8rem"
            >
              <Icon fontSize="1rem" as={icon} />
              <Text textStyle="body-2" sx={{ textWrap: 'nowrap' }}>
                {t(label)}
              </Text>
            </Stack>
          ))}
        </Flex>
      </Stack>
    </Flex>
  )
}
