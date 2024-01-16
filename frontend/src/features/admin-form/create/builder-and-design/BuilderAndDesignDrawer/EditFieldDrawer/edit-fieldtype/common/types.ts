import { FieldBase, FormFieldDto } from '~shared/types/field'

export type EditFieldProps<T extends FieldBase> = {
  field: T & {
    _id?: FormFieldDto['_id']
  }
}
