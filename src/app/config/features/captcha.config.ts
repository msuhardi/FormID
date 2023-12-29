import convict, { Schema } from 'convict'

export interface ICaptcha {
  captchaPrivateKey: string
  captchaPublicKey: string
}

const captchaSchema: Schema<ICaptcha> = {
  captchaPrivateKey: {
    doc: 'Google Captcha private key',
    format: String,
    default: '',
    env: 'GOOGLE_CAPTCHA',
  },
  captchaPublicKey: {
    doc: 'Google Captcha public key.',
    format: String,
    default: '',
    env: 'GOOGLE_CAPTCHA_PUBLIC',
  },
}

export const captchaConfig = convict(captchaSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
