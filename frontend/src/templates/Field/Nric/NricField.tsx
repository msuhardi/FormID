/**
 * @precondition Must have a parent `react-hook-form#FormProvider` component.
 */
import { useMemo } from 'react'
import { useFormContext } from 'react-hook-form'

import { createNikValidationRules } from '~utils/fieldValidation'
import Input from '~components/Input'

import { BaseFieldProps, FieldContainer } from '../FieldContainer'
import { NikFieldSchema, SingleAnswerFieldInput } from '../types'

export interface NikFieldProps extends BaseFieldProps {
  schema: NikFieldSchema
}

// Reusing NRIC field for NIK field
export const NricField = ({ schema }: NikFieldProps): JSX.Element => {
  const validationRules = useMemo(
    () => createNikValidationRules(schema),
    [schema],
  )

  const { register, setValue } = useFormContext<SingleAnswerFieldInput>()

  return (
    <FieldContainer schema={schema}>
      <Input
        aria-label={`${schema.questionNumber}. ${schema.title}`}
        defaultValue=""
        type="number"
        preventDefaultOnEnter
        {...register(schema._id, {
          ...validationRules,
          onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            setValue(schema._id, event.target.value.trim()),
        })}
      />
    </FieldContainer>
  )
}
