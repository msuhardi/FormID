import React from 'react'
import { Divider, Stack } from '@chakra-ui/react'

/**
 * Presentational wrapper over chakra-ui's `<Stack />` for payment elements.
 */
export const PaymentStack = ({ children }: { children: React.ReactNode }) => (
  <Stack
    spacing={{ base: '1.5rem', md: '2.25rem' }}
    py={{ base: '1.5rem', md: '3rem' }}
    px={{ base: '1.5rem', md: '4rem' }}
    bg="white"
    w="100%"
    divider={<Divider />}
  >
    {children}
  </Stack>
)
