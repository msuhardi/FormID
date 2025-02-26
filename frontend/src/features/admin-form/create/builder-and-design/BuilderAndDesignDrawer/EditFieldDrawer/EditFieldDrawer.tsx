import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { BasicField, FieldCreateDto } from '~shared/types/field'

import { EditFieldProps } from '~features/admin-form/create/builder-and-design/BuilderAndDesignDrawer/EditFieldDrawer/edit-fieldtype/common/types'
import { BASICFIELD_TO_DRAWER_META } from '~features/admin-form/create/constants'

import { useBuilderFields } from '../../BuilderAndDesignContent/useBuilderFields'
import {
  FieldBuilderState,
  stateDataSelector,
  useFieldBuilderStore,
} from '../../useFieldBuilderStore'
import { BuilderDrawerContainer } from '../common/BuilderDrawerContainer'

import {
  EditAttachment,
  EditCheckbox,
  EditCountryRegion,
  EditDate,
  EditDecimal,
  EditDropdown,
  EditEmail,
  EditHeader,
  EditHomeno,
  EditImage,
  EditLongText,
  EditMobile,
  EditNric,
  EditNumber,
  EditParagraph,
  EditRadio,
  EditRating,
  EditShortText,
  EditTable,
  EditYesNo,
} from './edit-fieldtype'

export const EditFieldDrawer = (): JSX.Element | null => {
  const { t } = useTranslation()
  const stateData = useFieldBuilderStore(stateDataSelector)

  const fieldToEdit: FieldCreateDto | undefined = useMemo(() => {
    if (
      stateData.state === FieldBuilderState.EditingField ||
      stateData.state === FieldBuilderState.CreatingField
    ) {
      return stateData.field
    }
  }, [stateData])

  const basicFieldText = useMemo(() => {
    if (!fieldToEdit?.fieldType) return ''
    return t(
      BASICFIELD_TO_DRAWER_META[fieldToEdit?.fieldType as BasicField].label,
    )
  }, [fieldToEdit, t])

  // Hacky method of determining when to rerender the drawer,
  // i.e. when the user clicks into a different field.
  // We pass `${fieldIndex}-${numFields}` as the key. If the
  // user was creating a new field but clicked into an existing
  // field, causing the new field to be discarded, then numFields
  // changes. If the user was editing an existing field then clicked
  // into another existing field, causing the edits to be discarded,
  // then fieldIndex changes.
  const { builderFields } = useBuilderFields()
  const fieldIndex = useMemo(() => {
    if (stateData.state === FieldBuilderState.CreatingField) {
      return stateData.insertionIndex
    } else if (stateData.state === FieldBuilderState.EditingField) {
      return builderFields?.findIndex(
        (field) => field._id === stateData.field._id,
      )
    }
  }, [builderFields, stateData])
  const numFields = useMemo(() => builderFields?.length, [builderFields])

  if (!fieldToEdit) return null

  return (
    <BuilderDrawerContainer title={basicFieldText}>
      <MemoFieldDrawerContent
        field={fieldToEdit}
        key={`${fieldIndex}-${numFields}`}
      />
    </BuilderDrawerContainer>
  )
}

// eslint-disable-next-line
type MemoFieldDrawerContentProps = EditFieldProps<any>
export const MemoFieldDrawerContent = memo<MemoFieldDrawerContentProps>(
  ({ field, ...props }: MemoFieldDrawerContentProps) => {
    switch (field.fieldType) {
      case BasicField.Attachment:
        return <EditAttachment {...props} field={field} />
      case BasicField.Checkbox:
        return <EditCheckbox {...props} field={field} />
      case BasicField.Dropdown:
        return <EditDropdown {...props} field={field} />
      case BasicField.CountryRegion:
        return <EditCountryRegion {...props} field={field} />
      case BasicField.Mobile:
        return <EditMobile {...props} field={field} />
      case BasicField.HomeNo:
        return <EditHomeno {...props} field={field} />
      case BasicField.Email:
        return <EditEmail {...props} field={field} />
      case BasicField.Nik:
        return <EditNric {...props} field={field} />
      case BasicField.Number:
        return <EditNumber {...props} field={field} />
      case BasicField.Date:
        return <EditDate {...props} field={field} />
      case BasicField.Decimal:
        return <EditDecimal {...props} field={field} />
      case BasicField.Section:
        return <EditHeader {...props} field={field} />
      case BasicField.YesNo:
        return <EditYesNo {...props} field={field} />
      case BasicField.Radio:
        return <EditRadio {...props} field={field} />
      case BasicField.Rating:
        return <EditRating {...props} field={field} />
      case BasicField.ShortText:
        return <EditShortText {...props} field={field} />
      case BasicField.Table:
        return <EditTable {...props} field={field} />
      case BasicField.LongText:
        return <EditLongText {...props} field={field} />
      case BasicField.Statement:
        return <EditParagraph {...props} field={field} />
      case BasicField.Image:
        return <EditImage {...props} field={field} />
      default:
        return <div>TODO: Insert field options here</div>
    }
  },
)
