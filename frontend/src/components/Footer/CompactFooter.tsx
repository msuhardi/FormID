import { Flex, Link, Stack, Wrap } from '@chakra-ui/react'

import { AdaptedText } from '~components/Footer/AdaptedText'

import { FooterContainerProps, FooterVariantProps } from './common/types'

interface CompactedFooterProps extends FooterVariantProps {
  compactMonochromeLogos?: boolean
}

/** Desktop only compact footer variant */
export const CompactFooter = ({
  footerLinks,
  containerProps,
}: CompactedFooterProps): JSX.Element => {
  return (
    <CompactFooter.Container {...containerProps} justifyContent="flex-end">
      <Stack spacing="1.5rem">
        <Wrap
          flex={1}
          shouldWrapChildren
          textStyle="body-2"
          spacing="1.5rem"
          justify="flex-end"
        >
          {footerLinks?.map(({ label, href }, index) => (
            <Link
              isExternal
              m="-0.25rem"
              key={index}
              variant="standalone"
              w="fit-content"
              href={href}
            >
              {label}
            </Link>
          ))}
        </Wrap>
        <AdaptedText />
      </Stack>
    </CompactFooter.Container>
  )
}

CompactFooter.Container = ({
  children,
  ...props
}: FooterContainerProps): JSX.Element => {
  return (
    <Flex
      align="center"
      width="100%"
      justify="space-between"
      flexDir="row"
      as="footer"
      {...props}
    >
      {children}
    </Flex>
  )
}
