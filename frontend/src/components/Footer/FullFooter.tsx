import { Divider, Flex, Link, Stack, Text, Wrap } from '@chakra-ui/react'

import { AdaptedText } from '~components/Footer/AdaptedText'

import { FooterContainerProps, FooterVariantProps } from './common/types'

export const FullFooter = ({
  appName,
  appLink,
  tagline,
  footerLinks,
  textColorScheme = 'secondary',
  containerProps,
}: FooterVariantProps): JSX.Element => {
  const currentYear = new Date().getFullYear()

  return (
    <FullFooter.Container {...containerProps}>
      <FullFooter.Section>
        <Stack
          flex={1}
          direction={{ base: 'column', lg: 'row' }}
          spacing={{ base: 0, lg: '1rem' }}
          paddingBottom={{ base: '1.5rem', lg: 0 }}
          paddingEnd={{ base: 0, lg: '1.5rem' }}
          align="baseline"
        >
          <Link
            colorScheme={textColorScheme}
            variant="standalone"
            m="-0.25rem"
            p={0}
            isExternal
            href={appLink}
          >
            <Text textStyle="h4">{appName}</Text>
          </Link>
          <Text textStyle="body-2" color={`${textColorScheme}.500`}>
            {tagline}
          </Text>
        </Stack>
        <Wrap
          flex={1}
          shouldWrapChildren
          textStyle="body-2"
          spacing={{ base: '1rem', lg: '1.25rem' }}
          direction={{ base: 'column', lg: 'row' }}
          justify={{ base: 'normal', lg: 'flex-end' }}
        >
          {footerLinks?.map(({ label, href }, index) => (
            <Link
              isExternal
              m="-0.25rem"
              key={index}
              colorScheme={textColorScheme}
              variant="standalone"
              w="fit-content"
              href={href}
            >
              {label}
            </Link>
          ))}
        </Wrap>
      </FullFooter.Section>
      <Divider my="1.5rem" />
      <FullFooter.Section>
        <Stack spacing="1rem">
          <AdaptedText />
          <Text textStyle="legal" color={`${textColorScheme}.500`}>
            ©{currentYear} FormID
          </Text>
        </Stack>
      </FullFooter.Section>
    </FullFooter.Container>
  )
}

FullFooter.Container = ({
  children,
  ...props
}: FooterContainerProps): JSX.Element => {
  return (
    <Flex
      as="footer"
      flexDirection="column"
      py="3rem"
      px={{ base: '1.5rem', md: '5.5rem', lg: '9.25rem' }}
      {...props}
    >
      {children}
    </Flex>
  )
}

FullFooter.Section = ({
  children,
  ...props
}: FooterContainerProps): JSX.Element => {
  return (
    <Flex
      align={{ base: 'normal', lg: 'center' }}
      flex={1}
      justify="space-between"
      flexDir={{ base: 'column', lg: 'row' }}
      {...props}
    >
      {children}
    </Flex>
  )
}
