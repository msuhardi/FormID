import { UseControllerProps } from 'react-hook-form'
import validator from 'validator'

const MAX_EMAIL_LENGTH = 30

const MAX_TITLE_LENGTH = 200
const MIN_TITLE_LENGTH = 4

export const FORM_TITLE_VALIDATION_RULES: UseControllerProps['rules'] = {
  required: 'Silahkan masukan nama formulir',
  minLength: {
    value: MIN_TITLE_LENGTH,
    message: `Nama formulir terlalu pendek, minimum ${MIN_TITLE_LENGTH} karakter`,
  },
  maxLength: {
    value: MAX_TITLE_LENGTH,
    message: `Nama formulir terlalu panjang, maksimum ${MAX_TITLE_LENGTH} karakter`,
  },
  validate: {
    trimMinLength: (value: string) => {
      return (
        value.trim().length >= MIN_TITLE_LENGTH ||
        `Nama formulir terlalu pendek, minimum ${MIN_TITLE_LENGTH} karakter`
      )
    },
  },
}

export const ADMIN_EMAIL_VALIDATION_RULES: UseControllerProps['rules'] = {
  validate: {
    required: (emails: string[]) => {
      return (
        emails.filter(Boolean).length > 0 ||
        'You must at least enter one email to receive responses'
      )
    },
    valid: (emails: string[]) => {
      return (
        emails.filter(Boolean).every((e) => validator.isEmail(e)) ||
        'Please enter valid email(s) (e.g. me@example.com) separated by commas, as invalid emails will not be saved'
      )
    },
    duplicate: (emails: string[]) => {
      const truthyEmails = emails.filter(Boolean)
      return (
        new Set(truthyEmails).size === truthyEmails.length ||
        'Please remove duplicate emails'
      )
    },
    maxLength: (emails: string[]) => {
      return (
        emails.filter(Boolean).length <= MAX_EMAIL_LENGTH ||
        `Please limit number of emails to ${MAX_EMAIL_LENGTH}`
      )
    },
  },
}
