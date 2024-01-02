import formsgSdk from 'src/app/config/formsg-sdk'

import { EncryptVerifiedContentError } from '../verified-content.errors'
import { encryptVerifiedContent } from '../verified-content.service'

describe('verified-content.service', () => {
  describe('encryptVerifiedContent', () => {
    beforeEach(() => jest.clearAllMocks())

    it('should successfully encrypt given verified content', async () => {
      // Arrange
      const mockVerifiedContent = {
        cpUen: 'S1234567Z',
        cpUid: 'U987654323FORMSG',
      }
      const mockEncryptedContent = 'abc-thisistotallyencrypted'
      // Mock return value of formsg sdk encrypt.
      const sdkSpy = jest
        .spyOn(formsgSdk.crypto, 'encrypt')
        .mockReturnValueOnce(mockEncryptedContent)

      // Act
      const result = encryptVerifiedContent({
        verifiedContent: mockVerifiedContent,
        formPublicKey: 'mockPublicKey',
      })

      // Assert
      expect(sdkSpy).toHaveBeenCalledTimes(1)
      expect(result._unsafeUnwrap()).toEqual(mockEncryptedContent)
    })

    it('should return EncryptVerifiedContentError when encryption error occurs', async () => {
      // Arrange
      const mockVerifiedContent = {
        uinFin: 'S1234567Z',
      }
      // Mock throw error in formsg sdk encrypt.
      const sdkSpy = jest
        .spyOn(formsgSdk.crypto, 'encrypt')
        .mockImplementationOnce(() => {
          throw new Error('some error')
        })

      // Act
      const result = encryptVerifiedContent({
        verifiedContent: mockVerifiedContent,
        formPublicKey: 'mockPublicKey',
      })

      // Assert
      expect(sdkSpy).toHaveBeenCalledTimes(1)
      expect(result._unsafeUnwrapErr()).toEqual(
        new EncryptVerifiedContentError(),
      )
    })
  })
})
