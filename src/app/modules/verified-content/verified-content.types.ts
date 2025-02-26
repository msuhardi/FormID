import { Result } from 'neverthrow'

import { VerifiedKeys } from '../../../../shared/utils/verified-content'

import { MalformedVerifiedContentError } from './verified-content.errors'

export type SpVerifiedKeys = {
  uinFin: VerifiedKeys.SpUinFin
}

export type ICpVerifiedKeys = {
  uinFin: VerifiedKeys.CpUen
  userInfo: VerifiedKeys.CpUid
}

export type CpVerifiedContent = {
  [VerifiedKeys.CpUen]: string
  [VerifiedKeys.CpUid]: string
}

export type SpVerifiedContent = {
  [VerifiedKeys.SpUinFin]: string
}

export type SgidVerifiedContent = {
  [VerifiedKeys.SgidUinFin]: string
}

export type VerifiedContentResult<T> = Result<T, MalformedVerifiedContentError>

export type EncryptVerificationContentParams = {
  verifiedContent: CpVerifiedContent | SpVerifiedContent
  formPublicKey: string
}
