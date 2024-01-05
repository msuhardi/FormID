import { Link, Text } from '@chakra-ui/react'

export const AdaptedText = () => (
  <Text textStyle="legal" color="gray.500">
    Platform ini diadaptasi dari{' '}
    <Link
      href="https://form.gov.sg/"
      target="_blank"
      rel="noreferrer"
      textDecorationLine="none"
    >
      FormSG
    </Link>{' '}
    (dibuat oleh Open Government Products, Singapore).
  </Text>
)
