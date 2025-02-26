import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { FormControl, Skeleton } from '@chakra-ui/react'

import FormLabel from '~components/FormControl/FormLabel'
import Input from '~components/Input'

import { useMutateFormSettings } from '../mutations'
import { useAdminFormSettings } from '../queries'

export const FormCustomisationSection = (): JSX.Element => {
  const { t } = useTranslation()
  const { data: settings, isLoading: isLoadingSettings } =
    useAdminFormSettings()

  return (
    <Skeleton isLoaded={!isLoadingSettings && !!settings}>
      <FormControl mt="2rem">
        <FormLabel isRequired>
          {t('features.settings.general.formCustomisation.closedFormMessage')}
        </FormLabel>
        {settings && (
          <PrivateFormMessageInput initialMessage={settings.inactiveMessage} />
        )}
      </FormControl>
    </Skeleton>
  )
}

interface PrivateFormMessageInputProps {
  initialMessage: string
}
const PrivateFormMessageInput = ({
  initialMessage,
}: PrivateFormMessageInputProps): JSX.Element => {
  const [value, setValue] = useState(initialMessage)

  const inputRef = useRef<HTMLInputElement>(null)
  const { mutateFormInactiveMessage } = useMutateFormSettings()

  const handleValueChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setValue(e.target.value)
    },
    [],
  )

  const handleBlur = useCallback(() => {
    if (value === initialMessage) return
    if (value === '') {
      return setValue(initialMessage)
    }

    return mutateFormInactiveMessage.mutate(value, {
      onError: () => {
        setValue(initialMessage)
      },
    })
  }, [initialMessage, mutateFormInactiveMessage, value])

  const handleKeydown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        inputRef.current?.blur()
      }
    },
    [],
  )

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={handleValueChange}
      onKeyDown={handleKeydown}
      onBlur={handleBlur}
    />
  )
}
