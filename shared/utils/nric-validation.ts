const NRIC_FORMAT_M_SERIES = /^[M](\d{7})([KLJNPQRTUWX])$/

/**
 * Validation for M-prefixed FIN series, to be launched from 1 Jan 2022.
 * @param value The string to be validated
 */
export const isMFinSeriesValid = (value: string): boolean => {
  const checksumEncoding = 'KLJNPQRTUWX'

  // Simple first-pass validation with regex parsing
  const parsed = value.toUpperCase().match(NRIC_FORMAT_M_SERIES)

  if (!parsed) return false

  const [, digits, checksum] = parsed

  // Checksum algorithm starts from here

  // a) Multiply each numeral of the FIN starting from left to right by the constant values as shown below
  const weights = [2, 7, 6, 5, 4, 3, 2]
  // b) Sum (S1) the results.  Add a weightage of three to the results (S1).
  const S1 = weights.reduce(
    (acc, weight, idx) => acc + weight * parseInt(digits[idx]),
    3,
  )
  // c) Divide the sum (S1) by 11 giving the remainder (R1)
  const R1 = S1 % 11
  // d) Calculate P = 11 – R1 and extract the check digit depending on the value of P
  const P = 11 - R1

  return checksum === checksumEncoding[P - 1]
}
