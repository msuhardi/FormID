import data from './regions.json'

const regions: Record<
  'provinces' | 'regencies' | 'subdistricts',
  Record<string, string>
> = data

const PANJANG_NIK = 16
const TANGGAL_DOB_GAP_WANITA = 40
const MAKS_UMUR = 100

export const isValidNik = (nik: string): boolean => {
  if (nik.length === PANJANG_NIK) {
    // 6 digit pertama tempat tinggal user pada saat mendaftar KTP
    // 6 digit selanjutnya DOB
    // 4 angka terakhir hasa angka serial NIK saat dikeluarkan (tidak perlu divalidasi)
    return (
      validateNikSubdistrik(nik.substring(0, 6)) &&
      validateNikDob(nik.substring(6, 12))
    )
  }

  return false
}

// angka subdistrik 6 digit pertama NIK (termasuk provinsi & regensi)
export const validateNikSubdistrik = (subdistrik: string): boolean => {
  return !!regions.subdistricts[subdistrik.toString()]
}

// DOB wanita: tanggal + 40
export const validateNikDob = (dob: string): boolean => {
  const dd = Number(dob.substring(0, 2))
  const mm = Number(dob.substring(2, 4))

  return (
    mm >= 1 && mm <= 12 && dd >= 1 && dd <= MAKS_UMUR + TANGGAL_DOB_GAP_WANITA
  )
}
