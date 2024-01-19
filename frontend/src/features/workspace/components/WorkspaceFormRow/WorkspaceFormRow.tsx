import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as ReactLink } from 'react-router-dom'
import { Box, ButtonProps, chakra, Flex, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { AdminDashboardFormMetaDto, FormStatus } from '~shared/types/form/form'

import { ADMINFORM_ROUTE } from '~constants/routes'

import { FormStatusLabel } from './FormStatusLabel'
import { RowActions } from './RowActions'

export interface WorkspaceFormRowProps extends ButtonProps {
  formMeta: AdminDashboardFormMetaDto
}

const getRelativeDateFormat = (t: TFunction) => {
  return {
    sameDay: `[${t('features.common.today')},] D MMM h:mma`, // today, 16 Jun 9:30am
    nextDay: `[${t('features.common.tomorrow')},] D MMM h:mma`, // tomorrow, 16 Jun 9:30am
    lastDay: `[${t('features.common.yesterday')},] D MMM h:mma`, // yesterday, 16 Jun 9:30am
    nextWeek: 'ddd, D MMM YYYY h:mma', // Tue, 17 Oct 2021 9:30pm
    lastWeek: 'ddd, D MMM YYYY h:mma', // Tue, 17 Oct 2021 9:30pm
    sameElse: 'D MMM YYYY h:mma', // 6 Oct 2021 9:30pm
  }
}

export const WorkspaceFormRow = ({
  formMeta,
  ...buttonProps
}: WorkspaceFormRowProps): JSX.Element => {
  const { t } = useTranslation()
  const prettyLastModified = useMemo(() => {
    return dayjs(formMeta.lastModified).calendar(null, getRelativeDateFormat(t))
  }, [formMeta.lastModified])

  return (
    <Box pos="relative">
      <chakra.button
        data-testid={`form-row-${formMeta._id}`}
        as={ReactLink}
        transitionProperty="common"
        transitionDuration="normal"
        to={`${ADMINFORM_ROUTE}/${formMeta._id}`}
        w="100%"
        py="1.5rem"
        display="grid"
        justifyContent="space-between"
        gridTemplateColumns={{
          base: '1fr 2.75rem',
          md: '1fr 4rem 8rem',
        }}
        gridTemplateRows={{ base: 'auto 2.75rem', md: 'auto' }}
        gridTemplateAreas={{
          base: "'title title' 'status actions'",
          md: "'title status actions'",
        }}
        gridGap={{ base: '0.5rem', md: '1.5rem' }}
        _hover={{
          bg: 'primary.100',
        }}
        _active={{
          bg: 'primary.200',
        }}
        _focus={{
          boxShadow: '0 0 0 2px var(--chakra-colors-primary-500)',
        }}
        {...buttonProps}
      >
        <Flex
          flexDir="column"
          gridArea="title"
          textAlign="initial"
          overflow="auto"
          opacity={formMeta.status !== FormStatus.Public ? '30%' : '100%'}
        >
          <Text
            noOfLines={{ base: 0, md: 1 }}
            title={formMeta.title}
            textStyle="subhead-1"
            color="secondary.700"
          >
            {formMeta.title}
          </Text>
          <Text textStyle="body-2" color="secondary.400">
            {t('features.formRow.edited', { date: prettyLastModified })}
          </Text>
        </Flex>
        <Box gridArea="status" alignSelf="center">
          <FormStatusLabel status={formMeta.status} />
        </Box>
        {/* Blank spacing for absolutely positioned RowActions component */}
        <Box gridArea="actions" />
      </chakra.button>
      <RowActions formMeta={formMeta} />
    </Box>
  )
}
