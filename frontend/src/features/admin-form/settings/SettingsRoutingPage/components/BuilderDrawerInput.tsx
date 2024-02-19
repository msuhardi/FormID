import { useEffect, useState } from 'react'
import {
  Controller,
  useFieldArray,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { BiFlag, BiMailSend, BiUser } from 'react-icons/bi'
import {
  Circle,
  Divider,
  Flex,
  FormControl,
  Icon,
  RadioGroup,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react'
import isEmail from 'validator/lib/isEmail'

import {
  ActionRoutingType,
  ActionStepCheckboxRouting,
  BasicField,
  FormField,
  RouteStepParentType,
} from '~shared/types'

import { useToast } from '~hooks/useToast'
import { getApiError } from '~utils/getApiError'
import Button from '~components/Button'
import { SingleSelect } from '~components/Dropdown'
import { ComboboxItem } from '~components/Dropdown/types'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import Radio from '~components/Radio'
import { TagInput } from '~components/TagInput'

import { BuilderDrawerProps } from '~features/admin-form/settings/SettingsRoutingPage/components/BuilderDrawer'
import { EditStateType } from '~features/admin-form/settings/SettingsRoutingPage/RouteMapContext'

// import {
//   DeleteRouteStepModal,
//   DeleteRouteStepModalProps,
// } from './DeleteRouteStepModal'

export enum RouteStepType {
  Condition = 'condition',
  Approval = 'approval',
  Termination = 'termination',
}

type BuilderDrawerInputFields = {
  routeStepType: RouteStepType | ''
  conditionQuestion: string
  conditionAnswers: string[]
  actionRoutingType: ActionRoutingType
  actionEmails: string[]
  actionEmailField: string
  actionCheckboxField: ActionStepCheckboxRouting
}

export const BuilderDrawerInput = ({
  editState,
  setEditState,
  form,
}: BuilderDrawerProps) => {
  const toast = useToast({
    isClosable: true,
  })
  //
  // const [deleteRouteStepProps, setDeleteRouteStepProps] =
  //   useState<Pick<DeleteRouteStepModalProps, 'id' | 'type'>>()

  const routeStepTypeOptions: ComboboxItem[] = [
    {
      value: RouteStepType.Condition,
      label: 'Add a routing condition',
    },
    {
      value: RouteStepType.Approval,
      label: 'Request for approval',
    },
    {
      value: RouteStepType.Termination,
      label: 'End the route',
    },
  ]
  //
  // const {
  //   onOpen: onDeleteRouteStepModalOpen,
  //   onClose: onDeleteRouteStepModalClose,
  //   isOpen: isDeleteRouteStepModalOpen,
  // } = useDisclosure()
  //
  // const onDeleteRouteStep = (
  //   routeStepMeta: Pick<DeleteRouteStepModalProps, 'id' | 'type'>,
  // ) => {
  //   setDeleteRouteStepProps(routeStepMeta)
  //   onDeleteRouteStepModalOpen()
  // }

  const formMethods = useForm<BuilderDrawerInputFields>()

  const {
    formState: { errors },
    control,
    handleSubmit,
    watch,
    reset,
  } = formMethods

  // Effect to reset the default form values when edit state changes.
  useEffect(() => {
    reset(
      editState.type === EditStateType.EditCondition
        ? {
            routeStepType: RouteStepType.Condition,
            conditionQuestion: editState.question,
            actionEmails: [],
          }
        : editState.type === EditStateType.EditApproval
        ? {
            routeStepType: RouteStepType.Approval,
            actionRoutingType: editState.routingType,
            actionEmails: editState.emails ?? [],
            actionEmailField: editState.emailField,
            actionCheckboxField: editState.checkboxField,
          }
        : editState.type === EditStateType.EditTermination
        ? {
            routeStepType: RouteStepType.Termination,
            actionRoutingType: editState.routingType,
            actionEmails: editState.emails ?? [],
            actionEmailField: editState.emailField,
            actionCheckboxField: editState.checkboxField,
          }
        : { actionEmails: [] },
    )
  }, [reset, editState])

  const routeStepType = watch('routeStepType')
  //
  // const {
  //   createActionMutation,
  //   updateActionMutation,
  //   deleteRouteStepMutation,
  //   createConditionMutation,
  //   areMutationsLoading: isLoading,
  // } = useRouteStepMutations(routeMap.id)

  const onClose = () => setEditState({ type: EditStateType.Inactive })

  const handleClick = handleSubmit((data: BuilderDrawerInputFields) => {
    const handleSuccess = () => {
      // refetch()
      toast({
        description: 'The route map was successfully updated.',
        status: 'success',
      })
      onClose()
    }

    const handleError = (toastMessage: string) => (e: unknown) => {
      toast({
        description: `${toastMessage} Error: ${getApiError(e)}`,
        status: 'danger',
      })
      onClose()
    }

    switch (editState.type) {
      case EditStateType.AddStep: {
        switch (data.routeStepType) {
          case RouteStepType.Condition: {
            // Case: create new condition
            // createConditionMutation.mutate(
            //   {
            //     parent: editState.parent,
            //     question: data.conditionQuestion,
            //     answers: data.conditionAnswers,
            //   },
            //   {
            //     onSuccess: handleSuccess,
            //     onError: handleError(
            //       'Something went wrong while creating condition step.',
            //     ),
            //   },
            // )
            break
          }
          case RouteStepType.Approval: {
            // Case: create new approval action
            // createActionMutation.mutate(
            //   {
            //     parent: editState.parent,
            //     type: ActionStepType.APPROVAL,
            //     routingType: data.actionRoutingType,
            //     ...(data.actionRoutingType === ActionRoutingType.EMAILS
            //       ? { emails: data.actionEmails }
            //       : data.actionRoutingType === ActionRoutingType.EMAIL_FIELD
            //       ? { emailField: data.actionEmailField }
            //       : { checkboxField: data.actionCheckboxField }),
            //   },
            //   {
            //     onSuccess: handleSuccess,
            //     onError: handleError(
            //       'Something went wrong while creating approval step.',
            //     ),
            //   },
            // )
            break
          }
          case RouteStepType.Termination: {
            // Case: create new termination action
            // createActionMutation.mutate(
            //   {
            //     parent: editState.parent,
            //     type: ActionStepType.TERMINATION,
            //     // HARDCODED HERE - we won't allow termination steps to be dynamically routed
            //     routingType: ActionRoutingType.EMAILS,
            //     emails: data.actionEmails,
            //   },
            //   {
            //     onSuccess: handleSuccess,
            //     onError: handleError(
            //       'Something went wrong while creating termination step.',
            //     ),
            //   },
            // )
            break
          }
          default:
            // case ''
            break
        }
        break
      }
      case EditStateType.EditCondition: {
        // To edit conditions, always delete the old condition and recreate.
        const mutateUpdateCondition = (onSuccess: () => void) => undefined
        // deleteRouteStepMutation.mutate(editState.routeStepId, {
        //   onSuccess,
        //   onError: handleError(
        //     'Something went wrong while deleting original condition step.',
        //   ),
        // })

        switch (data.routeStepType) {
          case RouteStepType.Condition: {
            if (data.conditionQuestion === editState.question) {
              // No change
              onClose()
              return
            }

            // Case: Edit condition - change from condition to condition
            // mutateUpdateCondition(() =>
            //   createConditionMutation.mutate(
            //     {
            //       parent: editState.parent,
            //       question: data.conditionQuestion,
            //       answers: data.conditionAnswers,
            //     },
            //     {
            //       onSuccess: handleSuccess,
            //       onError: handleError(
            //         'Something went wrong while creating new condition step.',
            //       ),
            //     },
            //   ),
            // )
            break
          }
          case RouteStepType.Approval: {
            // Case: Edit condition - change from condition to approval
            // mutateUpdateCondition(() =>
            //   createActionMutation.mutate(
            //     {
            //       parent: editState.parent,
            //       type: ActionStepType.APPROVAL,
            //       routingType: data.actionRoutingType,
            //       ...(data.actionRoutingType === ActionRoutingType.EMAILS
            //         ? { emails: data.actionEmails }
            //         : data.actionRoutingType === ActionRoutingType.EMAIL_FIELD
            //         ? { emailField: data.actionEmailField }
            //         : { checkboxField: data.actionCheckboxField }),
            //     },
            //     {
            //       onSuccess: handleSuccess,
            //       onError: handleError(
            //         'Something went wrong while creating new action step.',
            //       ),
            //     },
            //   ),
            // )
            break
          }
          case RouteStepType.Termination: {
            // // Case: Edit condition - change from condition to termination
            // mutateUpdateCondition(() =>
            //   createActionMutation.mutate(
            //     {
            //       parent: editState.parent,
            //       type: ActionStepType.TERMINATION,
            //       // HARDCODED HERE - we won't allow termination steps to be dynamically routed
            //       routingType: ActionRoutingType.EMAILS,
            //       emails: data.actionEmails,
            //     },
            //     {
            //       onSuccess: handleSuccess,
            //       onError: handleError(
            //         'Something went wrong while creating new action step.',
            //       ),
            //     },
            //   ),
            // )
            break
          }
          default:
            // case ''
            break
        }
        break
      }
      case EditStateType.EditApproval:
      case EditStateType.EditTermination: {
        switch (data.routeStepType) {
          case RouteStepType.Condition: {
            // Case: Edit action - change from action to condition
            // deleteRouteStepMutation.mutate(editState.routeStepId, {
            //   onSuccess: () => {
            //     createConditionMutation.mutate(
            //       {
            //         parent: editState.parent,
            //         question: data.conditionQuestion,
            //         answers: data.conditionAnswers,
            //       },
            //       {
            //         onSuccess: handleSuccess,
            //         onError: handleError(
            //           'Something went wrong while creating new condition step.',
            //         ),
            //       },
            //     )
            //   },
            //   onError: handleError(
            //     'Something went wrong while deleting original action step.',
            //   ),
            // })
            break
          }
          case RouteStepType.Approval:
          case RouteStepType.Termination: {
            // Case: Edit action - change action
            const routingType =
              data.routeStepType === RouteStepType.Termination
                ? ActionRoutingType.EMAILS
                : data.actionRoutingType

            // updateActionMutation.mutate(
            //   {
            //     routeStepId: editState.routeStepId,
            //     body: {
            //       type:
            //         data.routeStepType === RouteStepType.Approval
            //           ? ActionStepType.APPROVAL
            //           : ActionStepType.TERMINATION,
            //       routingType,
            //       ...(routingType === ActionRoutingType.EMAILS
            //         ? { emails: data.actionEmails }
            //         : routingType === ActionRoutingType.EMAIL_FIELD
            //         ? { emailField: data.actionEmailField }
            //         : { checkboxField: data.actionCheckboxField }),
            //     },
            //   },
            //   {
            //     onSuccess: handleSuccess,
            //     onError: handleError(
            //       'Something went wrong while updating action step.',
            //     ),
            //   },
            // )
            break
          }
          default:
            // case ''
            break
        }
        break
      }
      default:
        // case EditStateType.Inactive
        break
    }
  })

  const handleDelete = () => {
    if (editState.type === EditStateType.EditCondition) {
      //   onDeleteRouteStep({
      //     id: editState.routeStepId,
      //     type: RouteStepType.Condition,
      //   })
      // } else if (editState.type === EditStateType.EditApproval) {
      //   onDeleteRouteStep({
      //     id: editState.routeStepId,
      //     type: RouteStepType.Approval,
      //   })
      // } else if (editState.type === EditStateType.EditTermination) {
      //   onDeleteRouteStep({
      //     id: editState.routeStepId,
      //     type: RouteStepType.Termination,
      //   })
    }
  }

  const componentToRender = (() => {
    switch (routeStepType) {
      case RouteStepType.Condition:
        return (
          <BuilderDrawerConditionInput
            formMethods={formMethods}
            formFields={form.form_fields}
          />
        )
      case RouteStepType.Approval:
        return (
          <BuilderDrawerApprovalInput
            formMethods={formMethods}
            formFields={form.form_fields}
          />
        )
      case RouteStepType.Termination: {
        return <BuilderDrawerTerminationInput formMethods={formMethods} />
      }
      default:
        // case ''
        return <></>
    }
  })()

  if (editState.type === EditStateType.Inactive) return null

  return (
    <Stack gap={8} p={4} flex={1} pos="relative" overflow="auto">
      <FormControl isRequired isInvalid={!!errors.routeStepType}>
        <FormLabel>
          {`Select what will happen
          ${
            editState.parent.type === RouteStepParentType.TRIGGER
              ? ' after a form response comes in'
              : ' next'
          }`}
        </FormLabel>
        <Controller
          name="routeStepType"
          control={control}
          rules={{ required: 'Next step is required' }}
          render={({ field: { onChange, ...field } }) => (
            <SingleSelect
              {...field}
              onChange={(value: string) =>
                onChange(value as BuilderDrawerInputFields['routeStepType'])
              }
              items={routeStepTypeOptions}
              isClearable={false}
            />
          )}
        />
        <FormErrorMessage>{errors.routeStepType?.message}</FormErrorMessage>
      </FormControl>

      {componentToRender}

      <Flex justifyContent="space-between" flexDir="row-reverse">
        {routeStepType && (
          <>
            <Flex flexDir="row-reverse" gap={4}>
              <Button isLoading={false} onClick={handleClick}>
                Save
              </Button>
              <Button
                isDisabled={false}
                variant="clear"
                colorScheme="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
            </Flex>
          </>
        )}
        {editState.type !== EditStateType.AddStep && (
          <Button
            // isDisabled={isLoading}
            variant="clear"
            // colorScheme="critical"
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </Flex>
      {/*{deleteRouteStepProps && (*/}
      {/*  <DeleteRouteStepModal*/}
      {/*    {...deleteRouteStepProps}*/}
      {/*    isOpen={isDeleteRouteStepModalOpen}*/}
      {/*    onClose={() => {*/}
      {/*      onDeleteRouteStepModalClose()*/}
      {/*      onClose()*/}
      {/*    }}*/}
      {/*  />*/}
      {/*)}*/}
    </Stack>
  )
}

const BuilderDrawerConditionInput = ({
  formMethods,
  formFields,
}: {
  formMethods: UseFormReturn<BuilderDrawerInputFields>
  formFields: FormField[]
}) => {
  const {
    formState: { errors },
    control,
    setValue,
  } = formMethods

  const conditionableFields = (
    formFields.filter(
      (ff) =>
        (ff.fieldType === BasicField.Dropdown ||
          ff.fieldType === BasicField.Radio) &&
        ff.fieldOptions instanceof Array &&
        ff.fieldOptions.length > 0,
    ) as { fieldOptions: string[]; title: string }[]
  ).map(({ title, fieldOptions }) => ({
    title,
    fieldOptions,
  }))

  return (
    <>
      <Divider colorScheme="neutral.300" />
      <FormControl isRequired isInvalid={!!errors.conditionQuestion}>
        <FormLabel description="This should be a dropdown or radio field">
          Route a form response based on
        </FormLabel>
        <Controller
          name="conditionQuestion"
          control={control}
          rules={{ required: 'Field title is required' }}
          render={({ field: { onChange, ...field } }) => (
            <SingleSelect
              {...field}
              placeholder="Select a field"
              onChange={(title: string) => {
                const field = conditionableFields.find(
                  (ff) => ff.title === title,
                )
                if (!field) return
                onChange(title)
                setValue('conditionAnswers', field.fieldOptions)
              }}
              items={conditionableFields.map((ff) => ff.title)}
              isClearable={false}
              nothingFoundLabel="No field found. Ensure that you have added a radio or dropdown field."
            />
          )}
        />
        <FormErrorMessage>{errors.conditionQuestion?.message}</FormErrorMessage>
      </FormControl>
    </>
  )
}

const BuilderDrawerApprovalInput = ({
  formMethods,
  formFields,
}: {
  formMethods: UseFormReturn<BuilderDrawerInputFields>
  formFields: FormField[]
}) => {
  const {
    formState: { errors },
    control,
    watch,
  } = formMethods

  const actionRoutingType = watch('actionRoutingType')

  const routableFields = formFields
    .filter((ff) => ff.fieldType === BasicField.Email)
    .map(({ title }) => title)

  return (
    <>
      <Divider colorScheme="neutral.300" />
      <Stack alignItems="start" gap={6}>
        <Flex flexDir="column" gap={2}>
          <Text fontWeight="500">
            What happens when you request for approval
          </Text>
          <Flex>
            <Icon as={BiUser} fontSize="1.5rem" mr="0.5rem" />
            <Text>
              Checkpoint will forward the response to the specified email
              addresses below for approval
            </Text>
          </Flex>
        </Flex>

        <FormControl isInvalid={!!errors.actionRoutingType} isRequired>
          <FormLabel>Who is approving this?</FormLabel>
          <Controller
            control={control}
            name="actionRoutingType"
            rules={{
              validate: (v?: ActionRoutingType) =>
                !!v || 'Please select an option',
            }}
            render={({ field: { onChange, value, ...rest } }) => (
              <RadioGroup {...rest}>
                <Radio
                  isChecked={value === ActionRoutingType.EMAILS}
                  onChange={() => onChange(ActionRoutingType.EMAILS)}
                >
                  Specify by email addresses
                </Radio>
                {actionRoutingType === ActionRoutingType.EMAILS && (
                  <FormControl
                    isInvalid={!!errors.actionEmails}
                    isRequired
                    my={2}
                  >
                    <FormLabel description="Separate multiple email addresses with a comma">
                      {''}
                    </FormLabel>
                    <Controller
                      name="actionEmails"
                      control={control}
                      rules={{
                        validate: {
                          isEmail: (emails) =>
                            emails.every((email) => isEmail(email)) ||
                            'Please enter only valid emails',
                          required: (emails) =>
                            emails.length > 0 ||
                            'At least one email approver is required',
                        },
                      }}
                      render={({ field: { onChange, value, ...field } }) => (
                        <TagInput
                          placeholder={
                            value.length === 0 ? 'me@example.com' : undefined
                          }
                          tagValidation={isEmail}
                          onChange={(value) =>
                            // Lowercase all emails by default
                            onChange(
                              value.map((email) => email.toLowerCase().trim()),
                            )
                          }
                          value={value}
                          {...field}
                        />
                      )}
                    />
                    {/*<FormErrorMessage>*/}
                    {/*  {errors.actionEmails?.message}*/}
                    {/*</FormErrorMessage>*/}
                  </FormControl>
                )}
                <Radio
                  isChecked={value === ActionRoutingType.EMAIL_FIELD}
                  onChange={() => onChange(ActionRoutingType.EMAIL_FIELD)}
                >
                  Specify from email form field
                </Radio>
                {actionRoutingType === ActionRoutingType.EMAIL_FIELD && (
                  <FormControl
                    isRequired
                    isInvalid={!!errors.actionEmailField}
                    my={2}
                  >
                    <Controller
                      name="actionEmailField"
                      control={control}
                      rules={{ required: 'Field title is required' }}
                      render={({ field: { onChange, ...field } }) => (
                        <SingleSelect
                          {...field}
                          placeholder="Select a field"
                          onChange={(title) => {
                            const field = routableFields.find(
                              (fieldTitle) => fieldTitle === title,
                            )
                            if (!field) return
                            onChange(title)
                          }}
                          items={routableFields}
                          isClearable={false}
                          nothingFoundLabel="No field found. Ensure that you have added an email field."
                        />
                      )}
                    />
                    <FormErrorMessage>
                      {errors.actionEmailField?.message}
                    </FormErrorMessage>
                  </FormControl>
                )}
              </RadioGroup>
            )}
          />
          <FormErrorMessage>
            {errors.actionRoutingType?.message}
          </FormErrorMessage>
        </FormControl>
      </Stack>
    </>
  )
}

const BuilderDrawerTerminationInput = ({
  formMethods,
}: {
  formMethods: UseFormReturn<BuilderDrawerInputFields>
}) => {
  const {
    formState: { errors },
    control,
  } = formMethods

  return (
    <>
      <Divider colorScheme="neutral.300" />
      <Stack alignItems="start" gap={6}>
        <Flex flexDir="column" gap={2}>
          <Text fontWeight="500">What happens when you end the route</Text>
          <Flex>
            <Icon as={BiFlag} fontSize="1.5rem" mr="0.5rem" />
            <Text>
              Process ends here and respondent will receive a completed status
              email
            </Text>
          </Flex>
          <Flex>
            <Icon as={BiMailSend} fontSize="1.5rem" mr="0.5rem" />
            <Text>
              Checkpoint will send a copy of the email thread to the specified
              email addresses below (optional)
            </Text>
          </Flex>
        </Flex>

        <FormControl isInvalid={!!errors.actionEmails}>
          <FormLabel description="Separate multiple email addresses with a comma">
            Send copy of email thread to
          </FormLabel>
          <Controller
            name="actionEmails"
            control={control}
            rules={{
              validate: {
                isEmail: (emails) =>
                  emails.every((email) => isEmail(email)) ||
                  'Please enter only valid emails',
              },
            }}
            render={({ field: { onChange, value, ...field } }) => (
              <TagInput
                placeholder={value.length === 0 ? 'me@example.com' : undefined}
                tagValidation={isEmail}
                onChange={(value) =>
                  // Lowercase all emails by default
                  onChange(value.map((email) => email.toLowerCase().trim()))
                }
                value={value}
                {...field}
              />
            )}
          />
          {/*<FormErrorMessage>{errors.actionEmails?.message}</FormErrorMessage>*/}
        </FormControl>
      </Stack>
    </>
  )
}
