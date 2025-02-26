import { PublicUserDto, UserDto } from '../user'
import { FormField, FormFieldDto, MyInfoChildData } from '../field'

import { FormLogo } from './form_logo'
import type { Merge, Opaque, PartialDeep } from 'type-fest'
import {
  ADMIN_FORM_META_FIELDS,
  EMAIL_FORM_SETTINGS_FIELDS,
  EMAIL_PUBLIC_FORM_FIELDS,
  STORAGE_FORM_SETTINGS_FIELDS,
  STORAGE_PUBLIC_FORM_FIELDS,
} from '../../constants'
import { DateString } from '../generic'
import { FormLogic, LogicDto } from './form_logic'
import { PaymentChannel, PaymentMethodType, PaymentType } from '../payment'
import { Product } from './product'
import { FormRouteMap } from "../route-maps";

export type FormId = Opaque<string, 'FormId'>

export enum FormColorTheme {
  Blue = 'blue',
  Red = 'red',
  Green = 'green',
  Orange = 'orange',
  Brown = 'brown',
  Grey = 'grey',
}

export type FormPermission = {
  id?: string
  email: string
  write: boolean
}

export type FormStartPage = {
  logo: FormLogo
  colorTheme: FormColorTheme
  estTimeTaken?: number
  paragraph?: string
}

export type FormEndPage = {
  title: string
  paragraph?: string
  buttonLink?: string
  buttonText: string
}

export enum FormAuthType {
  NIL = 'NIL',
}

export enum FormStatus {
  Private = 'PRIVATE',
  Public = 'PUBLIC',
  Archived = 'ARCHIVED',
}

export type FormWebhook = {
  url: string
  isRetryEnabled: boolean
}

export enum FormResponseMode {
  Encrypt = 'encrypt',
  Email = 'email',
}

export type FormPaymentsChannel = {
  payment_methods?: PaymentMethodType[]
  channel: PaymentChannel
  target_account_id: string
  publishable_key: string
}

export interface PaymentTypeBase {
  payment_type: PaymentType

  amount_cents?: number
  min_amount?: number
  max_amount?: number

  products?: Array<Product>
  products_meta?: {
    multi_product?: boolean
  }
}

interface VariablePaymentsField extends PaymentTypeBase {
  payment_type: PaymentType.Variable
  min_amount: number
  max_amount: number
}

interface FixedPaymentField extends PaymentTypeBase {
  payment_type: PaymentType.Fixed
  amount_cents: number
}

export interface ProductsPaymentField extends PaymentTypeBase {
  payment_type: PaymentType.Products
  products: Array<Product>
  products_meta?: {
    multi_product: boolean
  }
}

export type FormPaymentsField =
  | {
      enabled: boolean
      description?: string
      name?: string
      gst_enabled?: boolean
    } & (VariablePaymentsField | FixedPaymentField | ProductsPaymentField)

export type FormBusinessField = {
  address?: string
  gstRegNo?: string
}

export interface FormBase {
  title: string
  admin: UserDto['_id']

  form_fields: FormField[]
  form_logics: FormLogic[]
  permissionList: FormPermission[]

  startPage: FormStartPage
  endPage: FormEndPage

  hasCaptcha: boolean
  hasIssueNotification: boolean
  authType: FormAuthType

  status: FormStatus

  inactiveMessage: string
  submissionLimit: number | null
  isListed: boolean

  esrvcId?: string

  msgSrvcName?: string

  webhook: FormWebhook

  responseMode: FormResponseMode

  routeMap?: FormRouteMap
}

export interface EmailFormBase extends FormBase {
  responseMode: FormResponseMode.Email
  emails: string[]
}

export interface StorageFormBase extends FormBase {
  responseMode: FormResponseMode.Encrypt
  publicKey: string
  payments_channel: FormPaymentsChannel
  payments_field: FormPaymentsField
  business?: FormBusinessField
}

/**
 * Additional props to be added/replaced when tranformed into DTO.
 */
type FormDtoBase = {
  _id: FormId
  form_fields: FormFieldDto[]
  form_logics: LogicDto[]
  created: DateString
  lastModified: DateString
}

export type StorageFormDto = Merge<StorageFormBase, FormDtoBase>

export type EmailFormDto = Merge<EmailFormBase, FormDtoBase>

export type FormDto = StorageFormDto | EmailFormDto

export type AdminStorageFormDto = Merge<StorageFormDto, { admin: UserDto }>
export type AdminEmailFormDto = Merge<EmailFormDto, { admin: UserDto }>
export type AdminFormDto = AdminStorageFormDto | AdminEmailFormDto

type PublicFormBase = {
  admin: PublicUserDto
}

export type PublicStorageFormDto = Merge<
  Pick<
    StorageFormDto,
    // Arrays like typeof list have numeric index signatures, so their number key
    // yields the union of all numerically-indexed properties.
    typeof STORAGE_PUBLIC_FORM_FIELDS[number]
  >,
  PublicFormBase
>

export type PublicEmailFormDto = Merge<
  Pick<
    EmailFormDto,
    // Arrays like typeof list have numeric index signatures, so their number key
    // yields the union of all numerically-indexed properties.
    typeof EMAIL_PUBLIC_FORM_FIELDS[number]
  >,
  PublicFormBase
>

export type PublicFormDto = PublicStorageFormDto | PublicEmailFormDto

export type EmailFormSettings = Pick<
  EmailFormDto,
  typeof EMAIL_FORM_SETTINGS_FIELDS[number]
>
export type StorageFormSettings = Pick<
  StorageFormDto,
  typeof STORAGE_FORM_SETTINGS_FIELDS[number]
>

export type FormSettings = EmailFormSettings | StorageFormSettings

export type FormWebhookSettings = Pick<FormSettings, 'webhook'>

export type FormWebhookResponseModeSettings = Pick<
  FormSettings,
  'webhook' | 'responseMode'
>
export type SettingsUpdateDto = PartialDeep<FormSettings>

export type WebhookSettingsUpdateDto = Pick<FormSettings, 'webhook'> & {
  userEmail: string
}

/**
 * Misnomer. More of a public form auth session.
 */
export interface SpcpSession {
  userName: string
  iat?: number // Optional as these are not returned for MyInfo forms
  rememberMe?: boolean
  exp?: number
}

export type PublicFormViewDto = {
  form: PublicFormDto
  spcpSession?: SpcpSession
  isIntranetUser?: boolean
  myInfoError?: true
  myInfoChildrenBirthRecords?: MyInfoChildData
}

export type PreviewFormViewDto = Pick<PublicFormViewDto, 'form' | 'spcpSession'>

export type SmsCountsDto = {
  quota: number
  freeSmsCounts: number
}

export type AdminFormViewDto = {
  form: AdminFormDto
}

export type AdminDashboardFormMetaDto = Pick<
  AdminFormDto,
  typeof ADMIN_FORM_META_FIELDS[number]
>

export type DuplicateFormOverwriteDto = {
  title: string
} & (
  | {
      responseMode: FormResponseMode.Email
      emails: string | string[]
    }
  | {
      responseMode: FormResponseMode.Encrypt
      publicKey: string
    }
)

export type DuplicateFormBodyDto = DuplicateFormOverwriteDto & {
  workspaceId?: string
}

export type CreateEmailFormBodyDto = Pick<
  EmailFormDto,
  'emails' | 'responseMode' | 'title'
> & { workspaceId?: string }

export type CreateStorageFormBodyDto = Pick<
  StorageFormDto,
  'publicKey' | 'responseMode' | 'title'
> & { workspaceId?: string }

export type CreateFormBodyDto =
  | CreateEmailFormBodyDto
  | CreateStorageFormBodyDto

export type StartPageUpdateDto = FormStartPage
export type EndPageUpdateDto = FormEndPage
export type FormPermissionsDto = FormPermission[]
export type PermissionsUpdateDto = FormPermission[]
export type PaymentsUpdateDto = FormPaymentsField
export type PaymentsProductUpdateDto = ProductsPaymentField['products']

export type SendFormOtpResponseDto = {
  otpPrefix: string
}
