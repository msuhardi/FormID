import {
  BiAlignLeft,
  BiBody,
  BiBook,
  BiBookContent,
  BiBookHeart,
  BiBriefcase,
  BiCalculator,
  BiCalendar,
  BiCalendarAlt,
  BiCalendarEvent,
  BiCalendarHeart,
  BiCalendarMinus,
  BiCalendarX,
  BiCar,
  BiCaretDownSquare,
  BiCloudUpload,
  BiFlag,
  BiGlobe,
  BiGroup,
  BiHash,
  BiHeading,
  BiHeartCircle,
  BiHome,
  BiHomeAlt,
  BiHomeCircle,
  BiHomeHeart,
  BiIdCard,
  BiImage,
  BiInfinite,
  BiMailSend,
  BiMap,
  BiMobile,
  BiPhone,
  BiRadioCircleMarked,
  BiRename,
  BiSelectMultiple,
  BiStar,
  BiTable,
  BiText,
  BiToggleLeft,
  BiUser,
  BiUserVoice,
} from 'react-icons/bi'
import { As } from '@chakra-ui/react'

import { BasicField, MyInfoAttribute } from '~shared/types/field'

type BuilderSidebarFieldMeta = {
  label: string
  icon: As
  // Is this fieldType included in submissions?
  isSubmitted: boolean
}

// !!! Do not use this to reference field titles for MyInfo fields. !!!
// !!! Use MYINFO_ATTRIBUTE_MAP in ~/shared/constants/field/myinfo/index.ts instead !!!
export const BASICFIELD_TO_DRAWER_META: {
  [key in BasicField]: BuilderSidebarFieldMeta
} = {
  [BasicField.Image]: {
    label: 'features.adminFormBuilder.builder.image',
    icon: BiImage,
    isSubmitted: false,
  },

  [BasicField.Statement]: {
    label: 'features.adminFormBuilder.builder.statement',
    icon: BiText,
    isSubmitted: false,
  },

  [BasicField.Section]: {
    label: 'features.adminFormBuilder.builder.section',
    icon: BiHeading,
    isSubmitted: false,
  },

  [BasicField.Attachment]: {
    label: 'features.adminFormBuilder.builder.attachment',
    icon: BiCloudUpload,
    isSubmitted: true,
  },

  [BasicField.Checkbox]: {
    label: 'features.adminFormBuilder.builder.checkbox',
    icon: BiSelectMultiple,
    isSubmitted: true,
  },

  [BasicField.Date]: {
    label: 'features.adminFormBuilder.builder.date',
    icon: BiCalendarEvent,
    isSubmitted: true,
  },

  [BasicField.Decimal]: {
    label: 'features.adminFormBuilder.builder.decimal',
    icon: BiCalculator,
    isSubmitted: true,
  },

  [BasicField.Dropdown]: {
    label: 'features.adminFormBuilder.builder.dropdown',
    icon: BiCaretDownSquare,
    isSubmitted: true,
  },

  [BasicField.CountryRegion]: {
    label: 'features.adminFormBuilder.builder.countryRegion',
    icon: BiFlag,
    isSubmitted: true,
  },

  [BasicField.Email]: {
    label: 'features.adminFormBuilder.builder.email',
    icon: BiMailSend,
    isSubmitted: true,
  },

  [BasicField.HomeNo]: {
    label: 'features.adminFormBuilder.builder.homeNumber',
    icon: BiPhone,
    isSubmitted: true,
  },

  [BasicField.LongText]: {
    label: 'features.adminFormBuilder.builder.longText',
    icon: BiAlignLeft,
    isSubmitted: true,
  },

  [BasicField.Mobile]: {
    label: 'features.adminFormBuilder.builder.mobileNumber',
    icon: BiMobile,
    isSubmitted: true,
  },

  [BasicField.Nric]: {
    label: 'features.adminFormBuilder.builder.nric',
    icon: BiUser,
    isSubmitted: true,
  },

  [BasicField.Number]: {
    label: 'features.adminFormBuilder.builder.number',
    icon: BiHash,
    isSubmitted: true,
  },

  [BasicField.Radio]: {
    label: 'features.adminFormBuilder.builder.radio',
    icon: BiRadioCircleMarked,
    isSubmitted: true,
  },

  [BasicField.Rating]: {
    label: 'features.adminFormBuilder.builder.rating',
    icon: BiStar,
    isSubmitted: true,
  },

  [BasicField.ShortText]: {
    label: 'features.adminFormBuilder.builder.shortAnswer',
    icon: BiRename,
    isSubmitted: true,
  },

  [BasicField.Table]: {
    label: 'features.adminFormBuilder.builder.table',
    icon: BiTable,
    isSubmitted: true,
  },

  [BasicField.YesNo]: {
    label: 'features.adminFormBuilder.builder.yesNo',
    icon: BiToggleLeft,
    isSubmitted: true,
  },

  [BasicField.Children]: {
    label: 'features.adminFormBuilder.builder.children',
    icon: BiGroup,
    isSubmitted: true,
  },
}

const BiDummyIcon = BiCalendar // random icon that is not actually shown in app

export const MYINFO_FIELD_TO_DRAWER_META: {
  [key in MyInfoAttribute]: BuilderSidebarFieldMeta
} = {
  [MyInfoAttribute.Name]: {
    label: 'Name',
    icon: BiUser,
    isSubmitted: true,
  },
  [MyInfoAttribute.Sex]: {
    label: 'Gender',
    icon: BiInfinite,
    isSubmitted: true,
  },
  [MyInfoAttribute.DateOfBirth]: {
    label: 'Date of Birth',
    icon: BiCalculator,
    isSubmitted: true,
  },
  [MyInfoAttribute.Race]: {
    label: 'Race',
    icon: BiBody,
    isSubmitted: true,
  },
  [MyInfoAttribute.Nationality]: {
    label: 'Nationality',
    icon: BiGlobe,
    isSubmitted: true,
  },
  [MyInfoAttribute.BirthCountry]: {
    label: 'Birth Country',
    icon: BiFlag,
    isSubmitted: true,
  },
  [MyInfoAttribute.ResidentialStatus]: {
    label: 'Residential Status',
    icon: BiIdCard,
    isSubmitted: true,
  },
  [MyInfoAttribute.Dialect]: {
    label: 'Dialect',
    icon: BiUserVoice,
    isSubmitted: true,
  },
  [MyInfoAttribute.HousingType]: {
    label: 'Housing Type',
    icon: BiHomeAlt,
    isSubmitted: true,
  },
  [MyInfoAttribute.HdbType]: {
    label: 'HDB Type',
    icon: BiHome,
    isSubmitted: true,
  },
  [MyInfoAttribute.PassportNumber]: {
    label: 'Passport Number',
    icon: BiBook,
    isSubmitted: true,
  },
  [MyInfoAttribute.PassportExpiryDate]: {
    label: 'Passport Expiry Date',
    icon: BiCalendarMinus,
    isSubmitted: true,
  },
  [MyInfoAttribute.VehicleNo]: {
    label: 'Vehicle Number',
    icon: BiCar,
    isSubmitted: true,
  },
  [MyInfoAttribute.RegisteredAddress]: {
    label: 'Registered Address',
    icon: BiHomeCircle,
    isSubmitted: true,
  },
  [MyInfoAttribute.MobileNo]: {
    label: 'Mobile Number',
    icon: BiMobile,
    isSubmitted: true,
  },
  [MyInfoAttribute.Occupation]: {
    label: 'Occupation',
    icon: BiBriefcase,
    isSubmitted: true,
  },
  [MyInfoAttribute.Employment]: {
    label: 'Name of Employer',
    icon: BiBookContent,
    isSubmitted: true,
  },
  [MyInfoAttribute.WorkpassStatus]: {
    label: 'Workpass Status',
    icon: BiMap,
    isSubmitted: true,
  },
  [MyInfoAttribute.WorkpassExpiryDate]: {
    label: 'Workpass Expiry Date',
    icon: BiCalendarAlt,
    isSubmitted: true,
  },
  [MyInfoAttribute.Marital]: {
    label: 'Marital Status',
    icon: BiHeartCircle,
    isSubmitted: true,
  },
  [MyInfoAttribute.CountryOfMarriage]: {
    label: 'Country of Marriage',
    icon: BiHomeHeart,
    isSubmitted: true,
  },
  [MyInfoAttribute.MarriageCertNo]: {
    label: 'Marriage Certificate Number',
    icon: BiBookHeart,
    isSubmitted: true,
  },
  [MyInfoAttribute.MarriageDate]: {
    label: 'Marriage Date',
    icon: BiCalendarHeart,
    isSubmitted: true,
  },
  [MyInfoAttribute.DivorceDate]: {
    label: 'Divorce Date',
    icon: BiCalendarX,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildrenBirthRecords]: {
    label: 'Child Records',
    icon: BiGroup,
    isSubmitted: true,
  },

  // The following child field's icons will never be used.
  // So they can be any placeholder.
  [MyInfoAttribute.ChildBirthCertNo]: {
    label: 'Birth Certificate Number',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildDateOfBirth]: {
    label: 'Date of Birth',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildName]: {
    label: 'Name',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildVaxxStatus]: {
    label: 'Vaccination Requirements',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildGender]: {
    label: 'Gender',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildRace]: {
    label: 'Race',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
  [MyInfoAttribute.ChildSecondaryRace]: {
    label: 'Secondary Race',
    icon: BiDummyIcon,
    isSubmitted: true,
  },
}
