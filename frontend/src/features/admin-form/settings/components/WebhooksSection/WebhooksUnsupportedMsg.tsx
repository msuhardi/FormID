import { Box, Flex, Text } from '@chakra-ui/react'

import WebhookUnsupportedSvg from '~/assets/svgs/webhook-not-allowed.svg'

import { GUIDE_WEBHOOKS } from '~constants/links'
import Link from '~components/Link'

export const WebhooksUnsupportedMsg = (): JSX.Element => {
  return (
    <Flex justify="center" flexDir="column" textAlign="center" h="100%">
      <Text textStyle="h2" as="h2" color="primary.500" mb="1rem">
        <i>Webhook</i> tidak diperbolehkan pada mode email
      </Text>
      <Text textStyle="body-1" color="secondary.500" mb="2.5rem">
        Webhook berguna untuk badan kepemerintahan yang mau hasil respon dikirim
        langsung ke sistem IT yang sudah ada. Fitur ini hanya bisa diakses pada
        mode penyimpanan.{' '}
        <Link isExternal href={GUIDE_WEBHOOKS}>
          Pelajari Webhook lebih lanjut
        </Link>
      </Text>
      <Box
        w="100%"
        flex={1}
        bgImage={WebhookUnsupportedSvg}
        bgRepeat="no-repeat"
        bgPosition="top center"
        bgSize="60%"
      />
    </Flex>
  )
}
