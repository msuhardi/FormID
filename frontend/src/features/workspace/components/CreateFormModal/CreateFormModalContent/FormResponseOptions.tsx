import { BiLockAlt, BiMailSend } from 'react-icons/bi'
import { forwardRef, Stack, UnorderedList } from '@chakra-ui/react'
import parse from 'html-react-parser'

import { FormResponseMode } from '~shared/types/form/form'

import Badge from '~components/Badge'
import Tile from '~components/Tile'

export interface FormResponseOptionsProps {
  onChange: (option: FormResponseMode) => void
  value: FormResponseMode
}

const OptionDescription = ({ listItems = [] }: { listItems: string[] }) => {
  return (
    <>
      <UnorderedList color="secondary.400" ml="1.5rem">
        {listItems.map((text, index) => (
          <Tile.ListItem key={index} textStyle="body-2" textAlign="left">
            {parse(text)}
          </Tile.ListItem>
        ))}
      </UnorderedList>
    </>
  )
}

export const FormResponseOptions = forwardRef<
  FormResponseOptionsProps,
  'button'
>(({ value, onChange }, ref) => {
  return (
    <Stack spacing="1rem" w="100%" direction={{ base: 'column', md: 'row' }}>
      <Tile
        variant="complex"
        icon={BiLockAlt}
        badge={<Badge colorScheme="success">Disarankan</Badge>}
        isActive={value === FormResponseMode.Encrypt}
        onClick={() => onChange(FormResponseMode.Encrypt)}
        isFullWidth
        flex={1}
      >
        <Tile.Title>Disimpan di FormSG</Tile.Title>
        <Tile.Subtitle>
          Lihat / unduh hasil tanggapan formulir di FormSG
        </Tile.Subtitle>
        <OptionDescription
          listItems={[
            'Maks. ukuran lampiran: 20MB per formulir',
            'Mendukung Webhook untuk hasil tanggapan',
          ]}
        />
      </Tile>
      <Tile
        ref={ref}
        variant="complex"
        icon={BiMailSend}
        isActive={value === FormResponseMode.Email}
        onClick={() => onChange(FormResponseMode.Email)}
        isFullWidth
        flex={1}
      >
        <Tile.Title>Melalui Email</Tile.Title>
        <Tile.Subtitle>
          Hasil tanggapan formulir akan dikirim ke email Anda
        </Tile.Subtitle>
        <OptionDescription
          listItems={[
            'Maks. ukuran lampiran: 7MB per formulir',
            'Cocok untuk data <i>sensitive</i>',
          ]}
        />
      </Tile>
    </Stack>
  )
})
