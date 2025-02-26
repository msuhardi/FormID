import i18n, { TFunction } from 'i18next'

import {
  AttachmentSize,
  BasicField,
  FieldCreateDto,
  RatingShape,
} from '~shared/types/field'

import { BASICFIELD_TO_DRAWER_META } from '../../constants'

import { createShortTextColumn } from './columnCreation'

/**
 * Utility methods to create bare minimum meta required for field creation.
 */
export const getFieldCreationMeta = (
  fieldType: BasicField,
  t?: TFunction,
): FieldCreateDto => {
  const baseMeta: Pick<
    FieldCreateDto,
    'description' | 'disabled' | 'required' | 'title'
  > = {
    description: '',
    disabled: false,
    required: true,
    title: t
      ? t(BASICFIELD_TO_DRAWER_META[fieldType].label)
      : BASICFIELD_TO_DRAWER_META[fieldType].label,
  }

  switch (fieldType) {
    case BasicField.Attachment: {
      return {
        fieldType,
        ...baseMeta,
        attachmentSize: AttachmentSize.OneMb,
      }
    }
    case BasicField.YesNo:
    case BasicField.Nik:
    case BasicField.Section:
    case BasicField.Statement: {
      return {
        fieldType,
        ...baseMeta,
      }
    }
    case BasicField.Checkbox: {
      return {
        fieldType,
        ...baseMeta,
        ValidationOptions: {
          customMax: null,
          customMin: null,
        },
        validateByValue: false,
        fieldOptions: [
          `${i18n.t('features.common.option')} 1`,
          `${i18n.t('features.common.option')} 2`,
        ],
        othersRadioButton: false,
      }
    }
    case BasicField.Mobile: {
      return {
        fieldType,
        ...baseMeta,
        isVerifiable: false,
        allowIntlNumbers: false,
      }
    }
    case BasicField.HomeNo: {
      return {
        fieldType,
        ...baseMeta,
        allowIntlNumbers: false,
      }
    }
    case BasicField.ShortText: {
      return {
        fieldType,
        ...baseMeta,
        ValidationOptions: {
          selectedValidation: null,
          customVal: null,
        },
        allowPrefill: false,
        lockPrefill: false,
      }
    }
    case BasicField.LongText:
      return {
        fieldType,
        ...baseMeta,
        ValidationOptions: {
          selectedValidation: null,
          customVal: null,
        },
      }
    case BasicField.Number: {
      return {
        fieldType,
        ...baseMeta,
        ValidationOptions: {
          selectedValidation: null,
          LengthValidationOptions: {
            selectedLengthValidation: null,
            customVal: null,
          },
          RangeValidationOptions: {
            customMin: null,
            customMax: null,
          },
        },
      }
    }
    case BasicField.Dropdown: {
      return {
        fieldType,
        ...baseMeta,
        fieldOptions: [
          `${i18n.t('features.common.option')} 1`,
          `${i18n.t('features.common.option')} 2`,
        ],
      }
    }
    case BasicField.Image: {
      return {
        fieldType,
        ...baseMeta,
        fileMd5Hash: '',
        name: '',
        url: '',
        size: '',
      }
    }
    case BasicField.Decimal: {
      return {
        fieldType,
        ...baseMeta,
        validateByValue: false,
        ValidationOptions: {
          customMin: null,
          customMax: null,
        },
      }
    }
    case BasicField.Email: {
      return {
        fieldType,
        ...baseMeta,
        isVerifiable: false,
        hasAllowedEmailDomains: false,
        allowedEmailDomains: [],
        autoReplyOptions: {
          hasAutoReply: false,
          autoReplySubject: '',
          autoReplyMessage: '',
          autoReplySender: '',
          includeFormSummary: false,
        },
      }
    }
    case BasicField.Radio: {
      return {
        fieldType,
        ...baseMeta,
        fieldOptions: [
          `${i18n.t('features.common.option')} 1`,
          `${i18n.t('features.common.option')} 2`,
        ],
        othersRadioButton: false,
      }
    }
    case BasicField.Rating: {
      return {
        fieldType,
        ...baseMeta,
        ratingOptions: {
          shape: RatingShape.Star,
          steps: 5,
        },
      }
    }
    case BasicField.Date: {
      return {
        fieldType,
        ...baseMeta,
        dateValidation: {
          customMaxDate: null,
          customMinDate: null,
          selectedDateValidation: null,
        },
      }
    }
    case BasicField.Table: {
      return {
        fieldType,
        ...baseMeta,
        columns: [createShortTextColumn()],
        minimumRows: 2,
      }
    }
    case BasicField.CountryRegion: {
      return {
        fieldType,
        ...baseMeta,
        fieldOptions: [],
      }
    }
    case BasicField.Children: {
      return {
        fieldType,
        ...baseMeta,
      }
    }
  }
}
