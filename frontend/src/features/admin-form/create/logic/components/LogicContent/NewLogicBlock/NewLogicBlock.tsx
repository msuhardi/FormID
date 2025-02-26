import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import {
  setToInactiveSelector,
  useAdminLogicStore,
} from '../../../adminLogicStore'
import { useLogicMutations } from '../../../mutations'
import { EditLogicInputs } from '../../../types'
import { EditLogicBlock } from '../EditLogicBlock'

export interface NewLogicBlockProps {
  /** Prop to inject values for testing */
  _defaultValues?: Partial<EditLogicInputs>
}

export const NewLogicBlock = ({
  _defaultValues,
}: NewLogicBlockProps): JSX.Element => {
  const { t } = useTranslation()
  const { createLogicMutation } = useLogicMutations()
  const setToInactive = useAdminLogicStore(setToInactiveSelector)
  const handleSubmit = useCallback(
    (inputs: EditLogicInputs) =>
      createLogicMutation.mutate(inputs, {
        onSuccess: () => setToInactive(),
      }),
    [createLogicMutation, setToInactive],
  )

  return (
    <EditLogicBlock
      isLoading={createLogicMutation.isLoading}
      defaultValues={_defaultValues}
      onSubmit={handleSubmit}
      submitButtonLabel={t('features.logicPage.logicClause.cta')}
    />
  )
}
