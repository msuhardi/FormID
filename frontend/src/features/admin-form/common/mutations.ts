import { useCallback } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { useNavigate, useParams } from 'react-router-dom'

import {
  AdminFormDto,
  AdminStorageFormDto,
  EndPageUpdateDto,
  FormPermission,
  FormPermissionsDto,
  PaymentsProductUpdateDto,
  PaymentsUpdateDto,
  StartPageUpdateDto,
} from '~shared/types/form/form'

import { DASHBOARD_ROUTE } from '~constants/routes'
import { useToast } from '~hooks/useToast'
import { HttpError } from '~services/ApiService'

import {
  SubmitEmailFormArgs,
  SubmitStorageFormArgs,
} from '~features/public-form/PublicFormService'
import { workspaceKeys } from '~features/workspace/queries'

import {
  submitEmailModeFormPreview,
  submitEmailModeFormPreviewWithFetch,
  submitStorageModeFormPreview,
  submitStorageModeFormPreviewWithFetch,
} from '../common/AdminViewFormService'
import { downloadFormIssue } from '../responses/FeedbackPage/issue/IssueService'
import { downloadFormReview } from '../responses/FeedbackPage/review/ReviewService'

import { useCollaboratorWizard } from './components/CollaboratorModal/CollaboratorWizardContext'
import { permissionsToRole } from './components/CollaboratorModal/utils'
import {
  updateFormEndPage,
  updateFormPaymentProducts,
  updateFormPayments,
  updateFormStartPage,
} from './AdminFormPageService'
import {
  removeSelfFromFormCollaborators,
  transferFormOwner,
  updateFormCollaborators,
} from './AdminViewFormService'
import { adminFormKeys } from './queries'

export type MutateAddCollaboratorArgs = {
  newPermission: FormPermission
  currentPermissions: FormPermissionsDto
}

export type MutateRemoveCollaboratorArgs = {
  permissionToRemove: FormPermission
  currentPermissions: FormPermissionsDto
}

export type DownloadFormFeedbackMutationArgs = {
  formId: string
  formTitle: string
}

export type DownloadFormIssuesMutationArgs = {
  formId: string
  formTitle: string
  count: number | undefined
}

enum FormCollaboratorAction {
  UPDATE,
  ADD,
  REMOVE,
  TRANSFER_OWNERSHIP,
  REMOVE_SELF,
}

export const useMutateCollaborators = () => {
  const { formId } = useCollaboratorWizard()
  if (!formId) throw new Error('No formId provided to useMutateCollaborators')

  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast({ status: 'success', isClosable: true })

  const updateFormData = useCallback(
    (newData: FormPermissionsDto) => {
      queryClient.setQueryData(adminFormKeys.collaborators(formId), newData)
      // Only update adminForm if it already has prior data.
      queryClient.setQueryData<AdminFormDto | undefined>(
        adminFormKeys.id(formId),
        (oldData) =>
          oldData
            ? {
                ...oldData,
                permissionList: newData,
              }
            : undefined,
      )
    },
    [formId, queryClient],
  )

  const getMappedBadRequestErrorMessage = (
    formCollaboratorAction: FormCollaboratorAction,
    originalErrorMessage: string,
  ): string => {
    let badRequestErrorMessage
    switch (formCollaboratorAction) {
      case FormCollaboratorAction.ADD:
        badRequestErrorMessage = `The collaborator was unable to be added or edited. Please try again or refresh the page.`
        break
      case FormCollaboratorAction.TRANSFER_OWNERSHIP:
        badRequestErrorMessage = originalErrorMessage
        break
      default:
        badRequestErrorMessage = `Sorry, an error occurred. Please refresh the page and try again later.`
    }

    return badRequestErrorMessage
  }

  const getMappedDefaultErrorMessage = (
    formCollaboratorAction: FormCollaboratorAction,
  ): string => {
    let defaultErrorMessage
    switch (formCollaboratorAction) {
      case FormCollaboratorAction.ADD:
        defaultErrorMessage = 'Error adding collaborator.'
        break
      case FormCollaboratorAction.UPDATE:
        defaultErrorMessage = 'Error updating collaborator.'
        break
      case FormCollaboratorAction.REMOVE:
        defaultErrorMessage = 'Error removing collaborator.'
        break
      case FormCollaboratorAction.REMOVE_SELF:
        defaultErrorMessage = 'Error removing self.'
        break
      case FormCollaboratorAction.TRANSFER_OWNERSHIP:
        defaultErrorMessage = 'Error transfering form ownership.'
        break
      //should not reach
      default:
        defaultErrorMessage = 'Error.'
    }
    return defaultErrorMessage
  }

  const getMappedErrorMessage = useCallback(
    (
      error: Error,
      formCollaboratorAction: FormCollaboratorAction,
      requestEmail?: string,
    ): string => {
      // check if error is an instance of HttpError to be able to access status code of error
      if (error instanceof HttpError) {
        let errorMessage
        switch (error.code) {
          case 422:
            errorMessage = requestEmail
              ? `${requestEmail} is not part of a whitelisted agency`
              : `An unexpected error 422 happened`
            break
          case 400:
            errorMessage = getMappedBadRequestErrorMessage(
              formCollaboratorAction,
              error.message,
            )
            break
          default:
            errorMessage = getMappedDefaultErrorMessage(formCollaboratorAction)
        }
        return errorMessage
      }
      // if error is not of type HttpError return the error message encapsulated in Error object
      return error.message
    },
    [],
  )

  const handleSuccess = useCallback(
    ({
      newData,
      toastDescription,
    }: {
      newData: FormPermissionsDto
      toastDescription: React.ReactNode
    }) => {
      toast.closeAll()
      updateFormData(newData)

      // Show toast on success.
      toast({
        description: toastDescription,
      })
    },
    [toast, updateFormData],
  )

  const handleError = useCallback(
    (
      error: Error,
      formCollaboratorAction: FormCollaboratorAction,
      requestEmail?: string,
    ) => {
      toast.closeAll()
      toast({
        description: getMappedErrorMessage(
          error,
          formCollaboratorAction,
          requestEmail,
        ),
        status: 'danger',
      })
    },
    [getMappedErrorMessage, toast],
  )

  const mutateUpdateCollaborator = useMutation(
    ({
      permissionToUpdate,
      currentPermissions,
    }: {
      permissionToUpdate: FormPermission
      currentPermissions: FormPermissionsDto
    }) => {
      const index = currentPermissions.findIndex(
        (c) => c.email === permissionToUpdate.email,
      )
      if (index === -1)
        throw new Error(
          'Collaborator to update does not seem to exist. Refresh and try again.',
        )
      const permissionListToUpdate = currentPermissions.slice()
      // Replace old permissions with new permission.
      permissionListToUpdate[index] = permissionToUpdate

      return updateFormCollaborators(formId, permissionListToUpdate)
    },
    {
      onSuccess: (newData, { permissionToUpdate }) => {
        const toastDescription = `${
          permissionToUpdate.email
        } has been updated to the ${permissionsToRole(permissionToUpdate)} role`
        handleSuccess({ newData, toastDescription })
      },
      onError: (error: Error, { permissionToUpdate }) => {
        handleError(
          error,
          FormCollaboratorAction.UPDATE,
          permissionToUpdate.email,
        )
      },
    },
  )

  const mutateAddCollaborator = useMutation(
    ({ newPermission, currentPermissions }: MutateAddCollaboratorArgs) => {
      const rebuiltPermissions = [newPermission].concat(currentPermissions)
      return updateFormCollaborators(formId, rebuiltPermissions)
    },
    {
      onSuccess: (newData, { newPermission }) => {
        const toastDescription = `${
          newPermission.email
        } has been added as a ${permissionsToRole(newPermission)}`
        handleSuccess({ newData, toastDescription })
      },
      onError: (error: Error, { newPermission }) => {
        handleError(error, FormCollaboratorAction.ADD, newPermission.email)
      },
    },
  )

  const mutateRemoveCollaborator = useMutation(
    ({
      permissionToRemove,
      currentPermissions,
    }: MutateRemoveCollaboratorArgs) => {
      const filteredList = currentPermissions.filter(
        (c) => c.email !== permissionToRemove.email,
      )
      return updateFormCollaborators(formId, filteredList)
    },
    {
      onSuccess: (newData, { permissionToRemove }) => {
        // TODO: Decide if we want to allow redo (via readding permission)
        const toastDescription = `${permissionToRemove.email} has been removed as a collaborator`
        handleSuccess({ newData, toastDescription })
      },
      onError: (error: Error) => {
        handleError(error, FormCollaboratorAction.REMOVE)
      },
    },
  )

  const mutateTransferFormOwnership = useMutation(
    (newOwnerEmail: string) => transferFormOwner(formId, newOwnerEmail),
    {
      onSuccess: (newData) => {
        toast.closeAll()
        // Show toast on success.
        toast({
          description: `${newData.form.admin.email} is now the owner of this form`,
        })

        // Update cached data.
        queryClient.setQueryData(
          adminFormKeys.collaborators(formId),
          newData.form.permissionList,
        )
        queryClient.setQueryData<AdminFormDto | undefined>(
          adminFormKeys.id(formId),
          newData.form,
        )
      },
      onError: (error: Error) => {
        handleError(error, FormCollaboratorAction.TRANSFER_OWNERSHIP)
      },
    },
  )

  const mutateRemoveSelf = useMutation(
    () => removeSelfFromFormCollaborators(formId),
    {
      onSuccess: () => {
        toast({
          description:
            'You have removed yourself as a collaborator from the form.',
        })

        // Remove all related queries from cache.
        queryClient.removeQueries(adminFormKeys.id(formId))
        queryClient.invalidateQueries(workspaceKeys.dashboard)
        queryClient.invalidateQueries(workspaceKeys.workspaces)

        navigate(DASHBOARD_ROUTE)
      },
      onError: (error: Error) => {
        handleError(error, FormCollaboratorAction.REMOVE_SELF)
      },
    },
  )

  return {
    mutateAddCollaborator,
    mutateUpdateCollaborator,
    mutateRemoveCollaborator,
    mutateTransferFormOwnership,
    mutateRemoveSelf,
  }
}

export const useMutateFormPage = () => {
  const { formId } = useParams()
  if (!formId) throw new Error('No formId provided')

  const queryClient = useQueryClient()
  const toast = useToast({ status: 'success', isClosable: true })

  const handleError = useCallback(
    (error: Error) => {
      toast.closeAll()
      toast({
        description: error.message,
        status: 'danger',
      })
    },
    [toast],
  )

  const startPageMutation = useMutation(
    (startPage: StartPageUpdateDto) => updateFormStartPage(formId, startPage),
    {
      onSuccess: (newData) => {
        toast.closeAll()
        queryClient.setQueryData<AdminFormDto | undefined>(
          adminFormKeys.id(formId),
          (oldData) =>
            oldData ? { ...oldData, startPage: newData } : undefined,
        )
        toast({
          description: 'The form header and instructions were updated.',
        })
      },
      onError: handleError,
    },
  )

  const endPageMutation = useMutation(
    (endPage: EndPageUpdateDto) => updateFormEndPage(formId, endPage),
    {
      onSuccess: (newData) => {
        toast.closeAll()
        queryClient.setQueryData<AdminFormDto | undefined>(
          adminFormKeys.id(formId),
          (oldData) => (oldData ? { ...oldData, endPage: newData } : undefined),
        )
        toast({
          description: 'The Thank you page was updated.',
        })
      },
      onError: handleError,
    },
  )

  const paymentsMutation = useMutation(
    (payments_field: PaymentsUpdateDto) =>
      updateFormPayments(formId, payments_field),
    {
      onSuccess: (newData) => {
        toast.closeAll()
        queryClient.setQueryData<AdminStorageFormDto | undefined>(
          adminFormKeys.id(formId),
          (oldData) =>
            oldData ? { ...oldData, payments_field: newData } : undefined,
        )
        toast({
          description: 'The payment was updated.',
        })
      },
      onError: handleError,
    },
  )

  const paymentsProductMutation = useMutation(
    (products: PaymentsProductUpdateDto) =>
      updateFormPaymentProducts(formId, products),
    {
      onSuccess: (newData) => {
        toast.closeAll()
        queryClient.setQueryData<AdminStorageFormDto | undefined>(
          adminFormKeys.products(formId, newData),
          (oldData) =>
            oldData
              ? {
                  ...oldData,
                  payments_field: {
                    ...oldData.payments_field,
                    products: newData,
                  },
                }
              : undefined,
        )
        toast({
          description: 'Payments product was updated.',
        })
      },
      onError: handleError,
    },
  )

  return {
    startPageMutation,
    endPageMutation,
    paymentsMutation,
    paymentsProductMutation,
  }
}

export const usePreviewFormMutations = (formId: string) => {
  const submitEmailModeFormMutation = useMutation(
    (args: Omit<SubmitEmailFormArgs, 'formId'>) => {
      return submitEmailModeFormPreview({ ...args, formId })
    },
  )

  const submitStorageModeFormMutation = useMutation(
    (args: Omit<SubmitStorageFormArgs, 'formId'>) => {
      return submitStorageModeFormPreview({ ...args, formId })
    },
  )

  // TODO (#5826): Fallback mutation using Fetch. Remove once network error is resolved
  const submitEmailModeFormFetchMutation = useMutation(
    (args: Omit<SubmitEmailFormArgs, 'formId'>) => {
      return submitEmailModeFormPreviewWithFetch({ ...args, formId })
    },
  )

  const submitStorageModeFormFetchMutation = useMutation(
    (args: Omit<SubmitStorageFormArgs, 'formId'>) => {
      return submitStorageModeFormPreviewWithFetch({ ...args, formId })
    },
  )

  return {
    submitEmailModeFormMutation,
    submitStorageModeFormMutation,
    submitEmailModeFormFetchMutation,
    submitStorageModeFormFetchMutation,
  }
}

export const useFormFeedbackMutations = () => {
  const toast = useToast({ status: 'success', isClosable: true })

  const handleError = useCallback(
    (error: Error) => {
      toast.closeAll()
      toast({
        description: error.message,
        status: 'danger',
      })
    },
    [toast],
  )

  const downloadFormFeedbackMutation = useMutation(
    ({ formId, formTitle }: DownloadFormFeedbackMutationArgs) =>
      downloadFormReview(formId, formTitle),
    {
      onSuccess: () => {
        toast({
          description: 'Form feedback download started',
        })
      },
      onError: handleError,
    },
  )

  return { downloadFormFeedbackMutation }
}

export const useFormIssueMutations = () => {
  const toast = useToast({ status: 'success', isClosable: true })

  const handleError = useCallback(
    (error: Error) => {
      toast.closeAll()
      toast({
        description: error.message,
        status: 'danger',
      })
    },
    [toast],
  )

  const downloadFormIssuesMutation = useMutation(
    ({ formId, formTitle, count }: DownloadFormIssuesMutationArgs) =>
      downloadFormIssue(formId, formTitle, count || 0),
    {
      onSuccess: () => {
        toast({
          description: 'Form issues download started',
        })
      },
      onError: handleError,
    },
  )

  return { downloadFormIssueMutation: downloadFormIssuesMutation }
}
