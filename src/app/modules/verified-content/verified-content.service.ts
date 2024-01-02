import { err, ok, Result } from 'neverthrow'

import { webhooksAndVerifiedContentConfig } from '../../config/features/webhook-verified-content.config'
import formsgSdk from '../../config/formsg-sdk'
import { createLoggerWithLabel } from '../../config/logger'

import { EncryptVerifiedContentError } from './verified-content.errors'
import { EncryptVerificationContentParams } from './verified-content.types'

const logger = createLoggerWithLabel(module)

export const encryptVerifiedContent = ({
  verifiedContent,
  formPublicKey,
}: EncryptVerificationContentParams): Result<
  string,
  EncryptVerifiedContentError
> => {
  try {
    const encryptedContent = formsgSdk.crypto.encrypt(
      verifiedContent,
      formPublicKey,
      webhooksAndVerifiedContentConfig.signingSecretKey,
    )
    return ok(encryptedContent)
  } catch (error) {
    logger.error({
      message: 'Unable to encrypt verified content',
      meta: {
        action: 'encryptVerifiedContent',
      },
      error,
    })

    return err(new EncryptVerifiedContentError())
  }
}
