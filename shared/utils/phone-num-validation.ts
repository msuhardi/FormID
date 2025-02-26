import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

/**
 * Validates the phone number string using length information
 * @param phoneNumber
 * @returns true if validate, false otherwise
 */
export const isPhoneNumber = (phoneNumber: string): boolean => {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber)

  if (!parsedNumber) {
    return false
  }

  return parsedNumber.isPossible()
}

/**
 * Validates the mobile phone number string
 * @param mobileNumber
 * @returns true if validate, false otherwise
 */
export const isMobilePhoneNumber = (mobileNumber: string): boolean => {
  const parsedNumber = parsePhoneNumberFromString(mobileNumber)

  if (!parsedNumber) return false

  if (startsWithIdPrefix(mobileNumber)) {
    return isPhoneNumber(mobileNumber)
  }

  // Not Singapore number, check type and early return if undefined.
  const parsedType = parsedNumber.getType()
  if (!parsedType) return false

  // All other countries uses number type to check for validity.
  return (
    isPhoneNumber(mobileNumber) &&
    // Have to include both MOBILE, FIXED_LINE_OR_MOBILE as some countries lump
    // the types together.
    ['FIXED_LINE_OR_MOBILE', 'MOBILE'].includes(parsedType)
  )
}

/**
 * Validates the given phone number string is a home phone number.
 * @param phoneNum the phone number string to validate
 * @returns true if validated, false otherwise.
 */
export const isHomePhoneNumber = (phoneNum: string): boolean => {
  const parsedNumber = parsePhoneNumberFromString(phoneNum)

  if (!parsedNumber) return false

  if (startsWithIdPrefix(phoneNum)) {
    return isPhoneNumber(phoneNum)
  }
  // For intl numbers check number type as well
  const parsedType = parsedNumber.getType()
  if (!parsedType) return false
  return (
    isPhoneNumber(phoneNum) &&
    // Have to include both FIXED_LINE, FIXED_LINE_OR_MOBILE as some countries lump
    // the types together.
    ['FIXED_LINE', 'FIXED_LINE_OR_MOBILE'].includes(parsedType)
  )
}

export const startsWithIdPrefix = (phoneNumber: string): boolean => {
  return phoneNumber.startsWith('+62')
}
