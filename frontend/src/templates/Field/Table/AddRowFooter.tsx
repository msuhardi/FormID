import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BiPlus } from 'react-icons/bi'
import { Box, Stack, Text, VisuallyHidden } from '@chakra-ui/react'
import simplur from 'simplur'

import Button from '~components/Button'

interface AddRowFooterProps {
  handleAddRow: () => void
  currentRows: number
  maxRows: number | ''
}

export const AddRowFooter = ({
  currentRows,
  maxRows,
  handleAddRow: handleAddRowProp,
}: AddRowFooterProps): JSX.Element => {
  const { t, i18n } = useTranslation()
  // State to decide whether to announce row changes to screen readers
  const [hasAddedRows, setHasAddedRows] = useState(false)
  const maxRowDescription = useMemo(() => {
    const desc = maxRows
      ? t('features.form.table.rowWithMax', {
          row: currentRows,
          maxRow: maxRows,
        })
      : t('features.form.table.row', { row: currentRows })

    return i18n.language.startsWith('en') ? simplur(desc) : desc
  }, [currentRows, maxRows, t])

  const maxRowAriaDescription = useMemo(() => {
    return maxRows
      ? simplur`There [is|are] currently ${currentRows} out of max ${maxRows} row[|s].`
      : simplur`There [is|are] currently ${currentRows} row[|s].`
  }, [currentRows, maxRows])

  const handleAddRow = useCallback(() => {
    handleAddRowProp()
    setHasAddedRows(true)
  }, [handleAddRowProp])

  return (
    <Stack
      mt="0.75rem"
      direction={{ base: 'column', lg: 'row' }}
      justify="space-between"
      align={{ base: 'start', lg: 'center' }}
      spacing="0.75rem"
    >
      <Button
        isDisabled={!!maxRows && currentRows >= maxRows}
        leftIcon={<BiPlus fontSize="1.5rem" />}
        type="button"
        onClick={handleAddRow}
      >
        {t('features.form.table.addAnotherRow')}
        <VisuallyHidden>
          to the table field. {maxRowAriaDescription}
        </VisuallyHidden>
      </Button>

      <Box>
        <VisuallyHidden aria-live={hasAddedRows ? 'polite' : 'off'} aria-atomic>
          The table field currently has {maxRowDescription}
        </VisuallyHidden>

        <Text aria-hidden textStyle="body-2" color="secondary.400">
          {maxRowDescription}
        </Text>
      </Box>
    </Stack>
  )
}
