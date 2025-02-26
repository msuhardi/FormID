import { ObjectId } from 'bson-ext'
import { readFileSync } from 'fs'
import { cloneDeep } from 'lodash'
import moment from 'moment-timezone'
import { FormPaymentsField, PaymentType } from 'shared/types'

import { IPopulatedEncryptedForm, SubmissionData } from 'src/types'

import { handleDuplicatesInAttachments } from '../../receiver/receiver.utils'
import {
  createEncryptedSubmissionDto,
  getPaymentAmount,
  getPaymentIntentDescription,
} from '../encrypt-submission.utils'

const validSingleFile = {
  filename: 'govtech.jpg',
  content: readFileSync('./__tests__/unit/backend/resources/govtech.jpg'),
  fieldId: String(new ObjectId()),
}

describe('encrypt-submission.utils', () => {
  describe('createEncryptedSubmissionDto', () => {
    it('should create an encrypted submission DTO sucessfully', () => {
      // Arrange
      const createdDate = new Date()
      const submissionData = {
        _id: new ObjectId(),
        created: createdDate,
        encryptedContent: 'some encrypted content',
        verifiedContent: 'some verified content',
      } as SubmissionData
      const attachmentPresignedUrls = {
        someSubmissionId: 'some presigned url',
      }

      // Act
      const actual = createEncryptedSubmissionDto(
        submissionData,
        attachmentPresignedUrls,
      )

      // Assert
      expect(actual).toEqual({
        refNo: submissionData._id,
        submissionTime: moment(submissionData.created)
          .tz('Asia/Singapore')
          .format('ddd, D MMM YYYY, hh:mm:ss A'),
        content: submissionData.encryptedContent,
        verified: submissionData.verifiedContent,
        attachmentMetadata: attachmentPresignedUrls,
      })
    })
  })
  describe('getPaymentAmount', () => {
    it('should return amount_cents for Fixed Payment Type', () => {
      const expectedAmountCents = 100
      const fixedPaymentData = {
        payment_type: PaymentType.Fixed,
        amount_cents: expectedAmountCents,
      } as FormPaymentsField

      const incomingPaymentData = {
        amount_cents: -1,
      }
      const result = getPaymentAmount(fixedPaymentData, incomingPaymentData)

      expect(result).toEqual(expectedAmountCents)
    })
    it('should return amount_cents for Variable Payment Type', () => {
      const expectedAmountCents = 100
      const fixedPaymentData = {
        payment_type: PaymentType.Variable,
        amount_cents: -1,
      } as FormPaymentsField

      const incomingPaymentData = {
        amount_cents: expectedAmountCents,
      }
      const result = getPaymentAmount(fixedPaymentData, incomingPaymentData)

      expect(result).toEqual(expectedAmountCents)
    })
  })

  // Note that if e.g. you have three attachments called abc.txt, abc.txt
  // and 1-abc.txt, they will not be given unique names, i.e. one of the abc.txt
  // will be renamed to 1-abc.txt so you end up with abc.txt, 1-abc.txt and 1-abc.txt.
  describe('handleDuplicatesInAttachments', () => {
    it('should make filenames unique by appending count when there are duplicates', () => {
      const attachments = [
        cloneDeep(validSingleFile),
        cloneDeep(validSingleFile),
        cloneDeep(validSingleFile),
      ]
      handleDuplicatesInAttachments(attachments)
      const newFilenames = attachments.map((att) => att.filename)
      // Expect uniqueness
      expect(newFilenames.length).toBe(new Set(newFilenames).size)
      expect(newFilenames).toContain(validSingleFile.filename)
      expect(newFilenames).toContain(`1-${validSingleFile.filename}`)
      expect(newFilenames).toContain(`2-${validSingleFile.filename}`)
    })
  })

  describe('getPaymentIntentDescription', () => {
    it('should description for Fixed Payments Type', () => {
      const expectedValue = 'expectedValue'
      const formData = {
        payments_field: {
          payment_type: PaymentType.Fixed,
          description: expectedValue,
          name: 'name',
        },
      } as unknown as IPopulatedEncryptedForm

      const products: any = [{}]

      const result = getPaymentIntentDescription(formData, products)

      expect(result).toEqual(expectedValue)
    })
    it('should return name for Variable Payment Type', () => {
      const expectedValue = 'expectedValue'
      const formData = {
        payments_field: {
          payment_type: PaymentType.Variable,
          description: 'description',
          name: expectedValue,
        },
      } as unknown as IPopulatedEncryptedForm

      const products: any = [{}]

      const result = getPaymentIntentDescription(formData, products)

      expect(result).toEqual(expectedValue)
    })

    it('should return product names for Products Payment Type', () => {
      const expectedItemName1 = 'expectedItemName1'
      const expectedItemName2 = 'expectedItemName2'
      const formData = {
        payments_field: {
          payment_type: PaymentType.Products,
          description: 'description',
          name: 'name',
        },
      } as unknown as IPopulatedEncryptedForm

      const products: any = [
        { data: { name: expectedItemName1 }, quantity: 1 },
        { data: { name: expectedItemName2 }, quantity: 2 },
      ]

      const result = getPaymentIntentDescription(formData, products)

      expect(result).toContain(expectedItemName1)
      expect(result).toContain(expectedItemName2)
    })

    it('should return form title for Products Payment Type when there are no products', () => {
      const expectedValue = 'formTitle'
      const formData = {
        payments_field: {
          payment_type: PaymentType.Products,
          description: 'description',
          name: 'name',
        },
        title: expectedValue,
      } as unknown as IPopulatedEncryptedForm

      const products: any = null

      const result = getPaymentIntentDescription(formData, products)

      expect(result).toContain(expectedValue)
    })
  })
})
