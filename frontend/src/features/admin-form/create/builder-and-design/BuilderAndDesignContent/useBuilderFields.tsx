import { useMemo } from 'react'
import cuid from 'cuid'

import {
  BasicField,
  FieldCreateDto,
  FormFieldDto,
  TableFieldDto,
} from '~shared/types/field'
import { insertAt, replaceAt } from '~shared/utils/immutable-array-fns'

import { ADMIN_FEEDBACK_SESSION_KEY } from '~constants/sessionStorage'
import { useSessionStorage } from '~hooks/useSessionStorage'

import { useEnv } from '~features/env/queries'

import { PENDING_CREATE_FIELD_ID } from '../constants'
import { useCreateTabForm } from '../useCreateTabForm'
import {
  FieldBuilderState,
  stateDataSelector,
  useFieldBuilderStore,
} from '../useFieldBuilderStore'

const getFormFieldsWhileCreating = (
  formFields: FormFieldDto[],
  fieldToCreate: { field: FieldCreateDto; insertionIndex: number },
): FormFieldDto[] => {
  if (fieldToCreate.field.fieldType === BasicField.Table) {
    const newField: TableFieldDto = {
      ...fieldToCreate.field,
      _id: PENDING_CREATE_FIELD_ID,
      columns: fieldToCreate.field.columns.map((column) => ({
        ...column,
        _id: cuid(),
      })),
    }
    return insertAt(formFields, fieldToCreate.insertionIndex, newField)
  }
  return insertAt(formFields, fieldToCreate.insertionIndex, {
    ...fieldToCreate.field,
    _id: PENDING_CREATE_FIELD_ID,
  })
}

const getFormFieldsWhileEditing = (
  formFields: FormFieldDto[],
  editingField: FormFieldDto,
): FormFieldDto[] => {
  const editingFieldIndex = formFields.findIndex(
    (ff) => ff._id === editingField._id,
  )
  if (editingFieldIndex < 0) return formFields

  return replaceAt(formFields, editingFieldIndex, editingField)
}

export const useBuilderFields = () => {
  const { data: formData, isLoading } = useCreateTabForm()
  const stateData = useFieldBuilderStore(stateDataSelector)
  const [, setIsAdminFeedbackEligible] = useSessionStorage<boolean>(
    ADMIN_FEEDBACK_SESSION_KEY,
  )
  const { data: { adminFeedbackFieldThreshold } = {} } = useEnv()
  const builderFields = useMemo(() => {
    let existingFields = formData?.form_fields
    if (isLoading || !existingFields) return null
    if (stateData.state === FieldBuilderState.EditingField) {
      // check if existing fields meets threshold for admin feedback eligibility
      if (
        adminFeedbackFieldThreshold &&
        existingFields.length >= adminFeedbackFieldThreshold
      )
        setIsAdminFeedbackEligible(true)

      existingFields = getFormFieldsWhileEditing(
        existingFields,
        stateData.field,
      )
    } else if (stateData.state === FieldBuilderState.CreatingField) {
      // if existing fields is equal to threshold - 1, to include field being created
      if (
        adminFeedbackFieldThreshold &&
        existingFields.length >= adminFeedbackFieldThreshold - 1
      )
        setIsAdminFeedbackEligible(true)

      existingFields = getFormFieldsWhileCreating(existingFields, stateData)
    }

    return existingFields
  }, [
    formData?.form_fields,
    isLoading,
    stateData,
    setIsAdminFeedbackEligible,
    adminFeedbackFieldThreshold,
  ])

  return {
    builderFields,
    isLoading,
  }
}
