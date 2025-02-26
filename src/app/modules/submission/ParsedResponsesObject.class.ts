import { err, ok, Result } from 'neverthrow'

import {
  ChildrenCompoundFieldBase,
  MyInfoAttribute,
} from '../../../../shared/types'
import { FieldResponse, FormFieldSchema, IFormDocument } from '../../../types'
import { validateField } from '../../utils/field-validation'
import {
  getLogicUnitPreventingSubmit,
  getVisibleFieldIds,
} from '../../utils/logic-adaptor'

import {
  ConflictError,
  ProcessingError,
  ValidateFieldError,
} from './submission.errors'
import {
  ProcessedChildrenResponse,
  ProcessedFieldResponse,
} from './submission.types'
import { getFilteredResponses } from './submission.utils'

export default class ParsedResponsesObject {
  public ndiResponses: ProcessedFieldResponse[] = []
  private constructor(public responses: ProcessedFieldResponse[]) {}

  getAllResponses(): ProcessedFieldResponse[] {
    return [...this.responses, ...this.ndiResponses]
  }

  /**
   * Injects response metadata such as the question, visibility state. In
   * addition, validation such as input validation or signature validation on
   * verified fields are also performed on the response.
   * @param form The form document corresponding to the responses
   * @param responses The responses to process and validate
   * @returns neverthrow ok() with field responses with additional metadata injected.
   * @returns neverthrow err() if response validation fails
   */
  static parseResponses(
    form: IFormDocument,
    responses: FieldResponse[],
  ): Result<
    ParsedResponsesObject,
    ProcessingError | ConflictError | ValidateFieldError
  > {
    const filteredResponsesResult = getFilteredResponses(form, responses, false)
    if (filteredResponsesResult.isErr()) {
      return err(filteredResponsesResult.error)
    }

    const filteredResponses = filteredResponsesResult.value

    // Set of all visible fields
    const visibleFieldIds = getVisibleFieldIds(filteredResponses, form)
    if (visibleFieldIds.isErr()) {
      return err(visibleFieldIds.error)
    }

    const logicUnitPreventingSubmit = getLogicUnitPreventingSubmit(
      filteredResponses,
      form,
      visibleFieldIds.value,
    )

    if (logicUnitPreventingSubmit.isErr()) {
      return err(logicUnitPreventingSubmit.error)
    } else if (logicUnitPreventingSubmit.value) {
      // Guard against invalid form submissions that should have been prevented by
      // logic.
      return err(new ProcessingError('Submission prevented by form logic'))
    }

    // Create a map keyed by field._id for easier access

    if (!form.form_fields) {
      return err(new ProcessingError('Form fields are undefined'))
    }

    const fieldMap = form.form_fields.reduce<{
      [fieldId: string]: FormFieldSchema
    }>((acc, field) => {
      acc[field._id] = field
      return acc
    }, {})

    // Validate each field in the form and inject metadata into the responses.
    const processedResponses = []
    let childIdx = 0
    for (const response of filteredResponses) {
      const responseId = response._id
      const formField = fieldMap[responseId]
      if (!formField) {
        return err(
          new ProcessingError('Response ID does not match form field IDs'),
        )
      }

      const processingResponse: ProcessedFieldResponse = {
        ...response,
        isVisible: visibleFieldIds.value.has(responseId),
        question: formField.getQuestion(),
      }

      if (formField.isVerifiable) {
        processingResponse.isUserVerified = formField.isVerifiable
      }

      // Inject myinfo to response if field is a myinfo field for downstream processing.
      if (formField.myInfo?.attr) {
        processingResponse.myInfo = formField.myInfo
        if (formField.myInfo.attr === MyInfoAttribute.ChildrenBirthRecords) {
          // eslint and prettier fight over the next line.
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(
            processingResponse as ProcessedChildrenResponse
          ).childSubFieldsArray =
            (formField as ChildrenCompoundFieldBase).childrenSubFields ?? []
          ;(processingResponse as ProcessedChildrenResponse).childIdx = childIdx
          // 1 MyInfo child field might contain more than 1 child, represented by the length of the answerArray
          // This happens when the button "Add another child" is used to add >= 1 child
          const noOfChildrenInQn =
            (processingResponse as ProcessedChildrenResponse).answerArray
              ?.length ?? 0
          // We increment the childIdx by the number of children in the qn, instead of just 1
          // to account for the case where the MyInfo child field contains more than 1 child
          childIdx += noOfChildrenInQn
        }
      }

      // Error will be returned if the processed response is not valid.
      const validateFieldResult = validateField(
        form._id,
        formField,
        processingResponse,
      )
      if (validateFieldResult.isErr()) {
        return err(validateFieldResult.error)
      }
      processedResponses.push(processingResponse)
    }

    return ok(new ParsedResponsesObject(processedResponses))
  }
}
