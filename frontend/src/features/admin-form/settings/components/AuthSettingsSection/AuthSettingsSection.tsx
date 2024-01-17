import {
  Fragment,
  KeyboardEventHandler,
  MouseEventHandler,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { Box, Flex, Skeleton, Text } from '@chakra-ui/react'

import { FormAuthType, FormSettings, FormStatus } from '~shared/types/form'

import { GUIDE_SPCP_ESRVCID } from '~constants/links'
import InlineMessage from '~components/InlineMessage'
import Link from '~components/Link'
import Radio from '~components/Radio'

import { useMutateFormSettings } from '../../mutations'

import { FORM_AUTHTYPES } from './constants'
import { EsrvcIdBox } from './EsrvcIdBox'

const esrvcidRequired = (authType: FormAuthType) => {
  switch (authType) {
    default:
      return false
  }
}

interface AuthSettingsSectionProps {
  settings: FormSettings
}

export const AuthSettingsSectionSkeleton = (): JSX.Element => {
  return (
    <Radio.RadioGroup>
      {Object.entries(FORM_AUTHTYPES).map(([authType, textToRender]) => (
        <Radio isDisabled key={authType}>
          <Skeleton>{textToRender}</Skeleton>
        </Radio>
      ))}
    </Radio.RadioGroup>
  )
}

export const AuthSettingsSection = ({
  settings,
}: AuthSettingsSectionProps): JSX.Element => {
  const { mutateFormAuthType } = useMutateFormSettings()

  const [focusedValue, setFocusedValue] = useState<FormAuthType>()

  const isFormPublic = useMemo(
    () => settings.status === FormStatus.Public,
    [settings],
  )

  const isDisabled = useCallback(
    () => isFormPublic || mutateFormAuthType.isLoading,
    [isFormPublic, mutateFormAuthType.isLoading],
  )

  const isEsrvcIdBoxDisabled = useMemo(
    () => isFormPublic || mutateFormAuthType.isLoading,
    [isFormPublic, mutateFormAuthType.isLoading],
  )

  const handleEnterKeyDown: KeyboardEventHandler = useCallback(
    (e) => {
      if (
        (e.key === 'Enter' || e.key === ' ') &&
        focusedValue &&
        !isDisabled() &&
        focusedValue !== settings.authType
      ) {
        return mutateFormAuthType.mutate(focusedValue)
      }
    },
    [focusedValue, isDisabled, mutateFormAuthType, settings.authType],
  )

  const handleOptionClick = useCallback(
    (authType: FormAuthType): MouseEventHandler =>
      (e) => {
        if (
          !isDisabled() &&
          e.type === 'click' &&
          // Required so only real clicks get registered.
          // Typical radio behaviour is that the 'click' event is triggered on change.
          // See: https://www.w3.org/TR/2012/WD-html5-20121025/content-models.html#interactive-content
          // https://github.com/facebook/react/issues/7407#issuecomment-237082712
          e.clientX !== 0 &&
          e.clientY !== 0 &&
          authType !== settings.authType
        ) {
          return mutateFormAuthType.mutate(authType)
        }
      },
    [isDisabled, mutateFormAuthType, settings.authType],
  )

  const radioOptions: [FormAuthType, string][] = Object.entries(
    FORM_AUTHTYPES,
  ) as [FormAuthType, string][]

  return (
    <Box>
      <Text
        textStyle="subhead-1"
        color="secondary.500"
        marginBottom="40px"
        marginTop="40px"
      >
        Authenticate respondents by NRIC.{' '}
        <Link
          textStyle="subhead-1"
          href={GUIDE_SPCP_ESRVCID}
          isExternal
          // Needed for link to open since there are nested onClicks
          onClickCapture={(e) => e.stopPropagation()}
        >
          Learn more about Singpass authentication
        </Link>
      </Text>
      {isFormPublic ? (
        <InlineMessage marginBottom="16px">
          To change authentication method, close your form to new responses.
        </InlineMessage>
      ) : null}
      <Radio.RadioGroup
        value={settings.authType}
        onKeyDown={handleEnterKeyDown}
        onChange={(e: FormAuthType) => setFocusedValue(e)}
      >
        {radioOptions.map(([authType, text]) => (
          <Fragment key={authType}>
            <Box onClick={handleOptionClick(authType)}>
              <Radio value={authType} isDisabled={isDisabled()}>
                <Flex>{text}</Flex>
              </Radio>
            </Box>
            {esrvcidRequired(authType) && authType === settings.authType ? (
              <EsrvcIdBox
                settings={settings}
                isDisabled={isEsrvcIdBoxDisabled}
              />
            ) : null}
          </Fragment>
        ))}
      </Radio.RadioGroup>
    </Box>
  )
}
