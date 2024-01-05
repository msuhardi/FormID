import { ResourceLanguage } from 'i18next'

import { enSG } from './en-sg'
import { idID } from './id-id'
import { zhSG } from './zh-sg'

export const locales = {
  'id-ID': idID as unknown as ResourceLanguage,
  'en-SG': enSG as unknown as ResourceLanguage,
  'zh-SG': zhSG as unknown as ResourceLanguage,
}
