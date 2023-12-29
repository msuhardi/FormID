import convict, { Schema } from 'convict'
import { url } from 'convict-format-with-validator'

import { ISgidVarsSchema } from '../../../types'

convict.addFormat(url)

const HOUR_IN_MILLIS = 1000 * 60 * 60
const DAY_IN_MILLIS = 24 * HOUR_IN_MILLIS

export const sgidVarsSchema: Schema<ISgidVarsSchema> = {
  clientId: {
    doc: 'The client id registered with sgID',
    format: String,
    default: '',
    env: 'SGID_CLIENT_ID',
  },
  clientSecret: {
    doc: 'The client secret registered with sgID',
    format: String,
    default: '',
    env: 'SGID_CLIENT_SECRET',
  },
  privateKeyPath: {
    doc: 'The path to the private key to decrypt payloads from sgID.',
    format: String,
    default: '',
    env: 'SGID_PRIVATE_KEY',
  },
  publicKeyPath: {
    doc: 'The path to the public key given to sgID.',
    format: String,
    default: '',
    env: 'SGID_PUBLIC_KEY',
  },
  formLoginRedirectUri: {
    doc: 'The callback uri that sgID will pass the authorization code and state to for form logins',
    format: 'url',
    default: '',
    env: 'SGID_FORM_LOGIN_REDIRECT_URI',
  },
  adminLoginRedirectUri: {
    doc: 'The callback uri that sgID will pass the authorization code and state to for admin application logins',
    format: 'url',
    default: '',
    env: 'SGID_ADMIN_LOGIN_REDIRECT_URI',
  },
  cookieMaxAge: {
    doc: 'Max sgID cookie age with remember me unchecked',
    format: 'int',
    default: 3 * HOUR_IN_MILLIS,
    env: 'SGID_COOKIE_MAX_AGE',
  },
  cookieMaxAgePreserved: {
    doc: 'Max sgID cookie age with remember me checked',
    format: 'int',
    default: 30 * DAY_IN_MILLIS,
    env: 'SGID_COOKIE_MAX_AGE_PRESERVED',
  },
  cookieDomain: {
    doc: 'Domain name set on cookie that holds the sgID jwt',
    format: String,
    default: '',
    env: 'SGID_COOKIE_DOMAIN',
  },
  hostname: {
    doc: 'The sgID authorization hostname.',
    format: String,
    default: '',
    env: 'SGID_HOSTNAME',
  },
  jwtSecret: {
    doc: 'The secret key used to sign and verify JWT based on userinfo from sgID',
    format: String,
    default: '',
    env: 'SGID_JWT_SECRET',
  },
}

// Load and validate sgid configuration values
// If environment variables are not present, an error will be thrown
export const sgid = convict(sgidVarsSchema)
  .validate({ allowed: 'strict' })
  .getProperties()
