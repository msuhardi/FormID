export type ThemeColorScheme =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'neutral'
  | 'theme-blue'
  | 'theme-green'
  | 'theme-teal'
  | 'theme-purple'
  | 'theme-grey'
  | 'theme-yellow'
  | 'theme-orange'
  | 'theme-red'
  | 'theme-brown'
  | 'white'
  | 'subtle'
  | 'content'

/**
 * Available color schemes to use for form field colors
 */
export type FieldColorScheme = Extract<
  ThemeColorScheme,
  | 'primary'
  | 'theme-blue'
  | 'theme-green'
  | 'theme-teal'
  | 'theme-purple'
  | 'theme-grey'
  | 'theme-yellow'
  | 'theme-orange'
  | 'theme-red'
  | 'theme-brown'
>

const primaryColourPalette = {
  100: '#f8f9fc',
  200: '#d3ead9',
  300: '#aedbb7',
  400: '#87cc95',
  500: '#5bbc74',
  600: '#49935b',
  700: '#366c43',
  800: '#24472c',
  900: '#132517',
}

export const colours: { [k in ThemeColorScheme]: Record<string, string> } = {
  white: {
    100: '#FFFFFF',
    200: '#FFFFFF',
    300: '#FFFFFF',
    400: '#FFFFFF',
    500: '#FFFFFF',
    600: '#FFFFFF',
    700: '#FFFFFF',
    800: '#FFFFFF',
    900: '#FFFFFF',
  },
  primary: primaryColourPalette,
  secondary: {
    100: '#f5f8f6',
    200: '#dae3dd',
    300: '#a2b9ac',
    400: '#698e76',
    500: '#447256',
    600: '#365b42',
    700: '#294434',
    800: '#1b2e22',
    900: '#0e1712',
  },
  danger: {
    100: '#FFF8F8',
    200: '#F8EAEA',
    300: '#E8C1C1',
    400: '#D88888',
    500: '#C05050',
    600: '#AD4848',
    700: '#9A4040',
    800: '#733030',
    900: '#602828',
  },
  warning: {
    100: '#FFFCF2',
    200: '#FDF3D1',
    300: '#FCECB3',
    400: '#FBE495',
    500: '#F9D867',
    600: '#E0C25D',
    700: '#AE9748',
    800: '#7D6C34',
    900: '#4B411F',
  },
  success: {
    100: '#E6FCF7',
    200: '#CDF5EB',
    300: '#9BEBD7',
    400: '#50DBB8',
    500: '#05CC9A',
    600: '#05B88B',
    700: '#038564',
    800: '#03664D',
    900: '#023D2E',
  },
  neutral: {
    100: '#FBFCFD',
    200: '#F0F0F1',
    300: '#E1E2E4',
    400: '#C9CCCF',
    500: '#ABADB2',
    600: '#999B9F',
    700: '#636467',
    800: '#48494B',
    900: '#242425',
  },
  'theme-green': {
    100: '#F3F6F6',
    200: '#D7E4E1',
    300: '#B3CCC6',
    400: '#81ABA0',
    500: '#357867',
    600: '#025641',
    700: '#013C2E',
  },
  'theme-blue': primaryColourPalette,
  'theme-teal': {
    100: '#F3F6F8',
    200: '#D9E5EA',
    300: '#B3CBD6',
    400: '#7AA5B7',
    500: '#417E98',
    600: '#1B6483',
    700: '#054763',
  },
  'theme-purple': {
    100: '#F4F2F5',
    200: '#E9E0ED',
    300: '#D3C1DC',
    400: '#B393C1',
    500: '#9265A7',
    600: '#583D64',
    700: '#3A2843',
  },
  'theme-grey': {
    100: '#F6F6F6',
    200: '#DBDEE0',
    300: '#C8CED1',
    400: '#929DA3',
    500: '#495C66',
    600: '#2C373D',
    700: '#1D2529',
  },
  'theme-yellow': {
    100: '#F5F4EE',
    200: '#F2EACB',
    300: '#EEE3B9',
    400: '#F0DD97',
    500: '#F9D651',
    600: '#847642',
    700: '#6C5D21',
  },
  'theme-orange': {
    100: '#FAF7F4',
    200: '#F9E6D8',
    300: '#FCD4BD',
    400: '#FBB791',
    500: '#F66F23',
    600: '#BF5200',
    700: '#8C3C00',
  },
  'theme-red': {
    100: '#FAF7F7',
    200: '#FBE5E5',
    300: '#F8D4D4',
    400: '#F1AAAA',
    500: '#DC2A2A',
    600: '#B22222',
    700: '#7C0E0E',
  },
  'theme-brown': {
    100: '#F6F5F3',
    200: '#E5E2DF',
    300: '#D9D4CF',
    400: '#B2A99E',
    500: '#7F6F5E',
    600: '#635649',
    700: '#473E34',
  },
  subtle: {
    300: primaryColourPalette[100],
    500: primaryColourPalette[100],
    600: primaryColourPalette[200],
    700: primaryColourPalette[300],
    800: primaryColourPalette[500],
  },
  // TODO FRM-1251: Remove when we have the full colour mapping to OGP DS
  content: {
    strong: '#2E2E2E',
    medium: '#848484',
    default: '#474747',
  },
}
