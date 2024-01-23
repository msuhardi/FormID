import { BasicField } from '~shared/types/field'

export const BASIC_FIELDS_ORDERED = [
  BasicField.ShortText,
  BasicField.LongText,
  BasicField.Radio,
  BasicField.Checkbox,
  BasicField.Dropdown,
  BasicField.CountryRegion,
  BasicField.Section,
  BasicField.Statement,
  BasicField.YesNo,
  BasicField.Rating,
  BasicField.Email,
  BasicField.Mobile,
  BasicField.HomeNo,
  BasicField.Date,
  BasicField.Image,
  BasicField.Table,
  BasicField.Attachment,
  BasicField.Number,
  BasicField.Decimal,
  BasicField.Nik,
]

export const CREATE_FIELD_DROP_ID = 'create-fields-field'

export const FIELD_LIST_DROP_ID = 'formFieldList'
export const PENDING_CREATE_FIELD_ID = 'FIELD-PENDING-CREATION'

export enum FieldListTabIndex {
  Basic = 0,
  MyInfo,
  Payments,
}
