import { useEffect, useState } from 'react'
import { Controller, useForm, UseFormReturn } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { Flex, FormControl, Stack, Text } from '@chakra-ui/react'

import { FormResponseMode } from '~shared/types'

import { useToast } from '~hooks/useToast'
import { getApiError } from '~utils/getApiError'
import Button from '~components/Button'
import { SingleSelect } from '~components/Dropdown'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'

import { useAdminForm } from '~features/admin-form/common/queries'
import { useAdminFormSettings } from '~features/admin-form/settings/queries'

import { useMutateFormSettings } from '../../mutations'

type CreateRouteMapInputs = {
  respondentEmailField: string
}

enum CreateStageViewState {
  EnterDetails = 0,
  ConfirmCreationWithoutEmailField = 1,
}

export const CreateStageContent = ({
  onSubmit: onSubmitProps,
  onClose,
}: {
  onSubmit: (created: boolean) => void
  onClose: () => void
}): JSX.Element => {
  const toast = useToast({
    status: 'danger',
    isClosable: true,
  })
  const { data: settings } = useAdminFormSettings()
  const { formId } = useParams()

  const [viewState, setViewState] = useState(CreateStageViewState.EnterDetails)

  const formMethods = useForm<CreateRouteMapInputs>({
    defaultValues: {},
  })

  const { mutateFormRouteMap } = useMutateFormSettings()

  const { reset, handleSubmit } = formMethods

  const onCancel = () => {
    reset()
    onClose()
  }

  const onSubmit = handleSubmit((data) => {
    // Transition to confirmation screen if no respondent email field is specified.
    if (
      !data.respondentEmailField &&
      viewState === CreateStageViewState.EnterDetails
    ) {
      setViewState(CreateStageViewState.ConfirmCreationWithoutEmailField)
      return
    }

    mutateFormRouteMap.mutate(
      {
        routeMap: {
          active: false,
          respondentEmailField: data.respondentEmailField,
          isDecisionPublic: true,
        },
        emails: [
          ...((settings?.responseMode === FormResponseMode.Email &&
            settings?.emails) ||
            []),
          `${formId}@form.morowaliutarakab.go.id`,
          `${formId}@mail.jsfdf.xyz`, // temporary. Remove once create MX record for the real domain
        ],
      },
      {
        onSuccess: () => {
          onSubmitProps(true)
        },
        onError: (e) => {
          toast({
            description: `Something went wrong while creating new route map. Error: ${getApiError(
              e,
            )}`,
          })
          onSubmitProps(false)
          onClose()
        },
      },
    )
  })

  return viewState === CreateStageViewState.EnterDetails ? (
    <EnterDetails
      formMethods={formMethods}
      isLoading={mutateFormRouteMap.isLoading}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  ) : (
    <ConfirmCreationWithoutEmailField
      isLoading={mutateFormRouteMap.isLoading}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  )
}

const EnterDetails = ({
  formMethods,
  isLoading,
  onCancel,
  onSubmit,
}: {
  formMethods: UseFormReturn<CreateRouteMapInputs>
  isLoading: boolean
  onCancel: () => void
  onSubmit: () => void
}) => {
  return (
    <Stack gap={4}>
      <Text as="h4" textStyle="h4">
        Create new route map
      </Text>

      <RespondentEmailFieldInput formMethods={formMethods} />

      <Flex alignSelf="flex-end" flexDir="row-reverse" gap={4}>
        <Button onClick={onSubmit} isLoading={isLoading}>
          Create
        </Button>
        <Button
          variant="clear"
          colorScheme="secondary"
          onClick={onCancel}
          isDisabled={isLoading}
        >
          Cancel
        </Button>
      </Flex>
    </Stack>
  )
}

const RespondentEmailFieldInput = ({
  formMethods,
}: {
  formMethods: UseFormReturn<CreateRouteMapInputs>
}): JSX.Element | null => {
  const { formState, control, resetField } = formMethods

  const { data } = useAdminForm()

  const isDisabled = !data

  // Effect to clear respondent email when the disabled state changes
  useEffect(() => {
    if (isDisabled) {
      resetField('respondentEmailField')
    }
  }, [isDisabled, resetField])

  const items = data
    ? data.form_fields
        .filter((ff) => ff.fieldType === 'email')
        .map((ff) => ff.title)
    : []

  return (
    <FormControl isInvalid={!!formState.errors.respondentEmailField} isRequired>
      <FormLabel
        isRequired
        description="This should be the field where respondents provide their email address."
      >
        Email field
      </FormLabel>
      <Controller
        name="respondentEmailField"
        control={control}
        render={({ field }) => (
          <SingleSelect
            {...field}
            isSearchable={false}
            isDisabled={isDisabled}
            items={items}
            placeholder={
              isDisabled ? 'Add a FormSG URL first' : 'Select a field'
            }
            nothingFoundLabel="No email field found. Ensure that you have added an email field to your form."
          />
        )}
      />
      <FormErrorMessage>
        {formState.errors.respondentEmailField?.message}
      </FormErrorMessage>
    </FormControl>
  )
}

const ConfirmCreationWithoutEmailField = ({
  isLoading,
  onCancel,
  onSubmit,
}: {
  isLoading: boolean
  onCancel: () => void
  onSubmit: () => void
}) => {
  return (
    <Stack gap={8}>
      <Text as="h4" textStyle="h4">
        Proceed without sending tracking link
      </Text>

      <Text>
        We noticed that you did not specify an email field in the previous step.
        We recommend doing so to allow respondents to check the status of their
        response.
      </Text>

      <Flex alignSelf="flex-end" flexDir="row-reverse" gap={4}>
        <Button onClick={onSubmit} isLoading={isLoading}>
          Proceed without sending tracking link
        </Button>
        <Button
          variant="clear"
          colorScheme="secondary"
          onClick={onCancel}
          isDisabled={isLoading}
        >
          Cancel
        </Button>
      </Flex>
    </Stack>
  )
}
