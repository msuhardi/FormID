import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { Flex, Text, Tooltip, useClipboard } from '@chakra-ui/react'

import { OGP_POSTMAN } from '~constants/links'
import Link from '~components/Link'

import { EmptyResponsesSvgr } from './EmptyResponsesSvgr'

const PATH_REGEX = RegExp('/admin/form/(.*)/')

export const EmptyResponses = (): JSX.Element => {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()

  const formId = PATH_REGEX.exec(pathname)?.[1]
  const shareLink = useMemo(
    () => `${window.location.origin}/${formId}`,
    [formId],
  )

  const { onCopy, hasCopied } = useClipboard(shareLink)

  return (
    <Flex justify="center" flexDir="column" align="center" px="2rem" py="4rem">
      <Text as="h2" textStyle="h2" color="primary.500" mb="1rem">
        {t('features.emptyPlaceholder.emptyResponses.noResponses')}
      </Text>
      <Text textStyle="body-1" color="secondary.500">
        {t('features.emptyPlaceholder.emptyResponses.helper', {
          link:
            i18n.language === 'id-ID' ? (
              <>
                <Tooltip
                  label={hasCopied ? 'Copied!' : 'Klik untuk copy link'}
                  closeOnClick={false}
                >
                  <Link onClick={onCopy}>disini</Link>
                </Tooltip>
              </>
            ) : (
              <Link isExternal href={OGP_POSTMAN}>
                Postman.gov.sg
              </Link>
            ),
        })}
      </Text>
      <EmptyResponsesSvgr mt="1.5rem" w="280px" maxW="100%" />
    </Flex>
  )
}
