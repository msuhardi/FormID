import expressHandler from '__tests__/unit/backend/helpers/jest-express'
import { ObjectId } from 'bson-ext'
import { errAsync, okAsync } from 'neverthrow'

import { DatabaseError } from 'src/app/modules/core/core.errors'
import {
  IFormDocument,
  IPopulatedForm,
  IPopulatedUser,
  PublicForm,
} from 'src/types'

import { FormAuthType, MyInfoAttribute } from '../../../../../../shared/types'
import * as AuthService from '../../../auth/auth.service'
import { FormNotFoundError, PrivateFormError } from '../../form.errors'
import * as FormService from '../../form.service'
import * as PublicFormController from '../public-form.controller'

jest.mock('../public-form.service')
jest.mock('../../form.service')
jest.mock('../../../auth/auth.service')
jest.mock('../../../spcp/spcp.oidc.service/spcp.oidc.service.sp')
jest.mock('../../../spcp/spcp.oidc.service/spcp.oidc.service.cp')
jest.mock('../../../myinfo/myinfo.service')
jest.mock('../../../billing/billing.service')

const MockFormService = jest.mocked(FormService)
const MockAuthService = jest.mocked(AuthService)

describe('public-form.controller', () => {
  afterEach(() => jest.clearAllMocks())

  describe('handleGetPublicForm', () => {
    const MOCK_FORM_ID = new ObjectId().toHexString()
    const MOCK_USER_ID = new ObjectId().toHexString()
    const MOCK_USER = {
      _id: MOCK_USER_ID,
      email: 'randomrandomtest@example.com',
    } as IPopulatedUser

    const MOCK_SCRUBBED_FORM = {
      _id: MOCK_FORM_ID,
      title: 'mock title',
      admin: { _id: MOCK_USER_ID },
    } as unknown as PublicForm

    const BASE_FORM = {
      admin: MOCK_USER,
      _id: MOCK_FORM_ID,
      title: MOCK_SCRUBBED_FORM.title,
      getUniqueMyInfoAttrs: jest.fn().mockReturnValue([MyInfoAttribute.Name]),
      getPublicView: jest.fn().mockReturnValue(MOCK_SCRUBBED_FORM),
    }

    const MOCK_REQ = expressHandler.mockRequest({
      params: {
        formId: MOCK_FORM_ID,
      },
      others: {
        cookies: {},
      },
    })

    // Success
    describe('valid form id', () => {
      beforeAll(() => {
        MockFormService.checkIsIntranetFormAccess.mockReturnValue(false)
      })

      it('should return 200 when there is no FormAuthType on the request', async () => {
        // Arrange
        const MOCK_NIL_AUTH_FORM = {
          ...BASE_FORM,
          authType: FormAuthType.NIL,
        } as unknown as IPopulatedForm
        const mockRes = expressHandler.mockResponse()

        MockAuthService.getFormIfPublic.mockReturnValueOnce(
          okAsync(MOCK_NIL_AUTH_FORM),
        )
        MockFormService.checkFormSubmissionLimitAndDeactivateForm.mockReturnValueOnce(
          okAsync(MOCK_NIL_AUTH_FORM),
        )

        // Act
        await PublicFormController.handleGetPublicForm(
          MOCK_REQ,
          mockRes,
          jest.fn(),
        )

        // Assert
        expect(mockRes.json).toHaveBeenCalledWith({
          form: MOCK_NIL_AUTH_FORM.getPublicView(),
          isIntranetUser: false,
        })
      })
    })

    // Errors
    describe('errors in form retrieval', () => {
      const MOCK_ERROR_STRING = 'mockingbird'

      it('should return 500 when a database error occurs', async () => {
        // Arrange
        // 1. Mock the response
        const mockRes = expressHandler.mockResponse()

        // 2. Mock the call to retrieve the form
        MockAuthService.getFormIfPublic.mockReturnValueOnce(
          errAsync(new DatabaseError(MOCK_ERROR_STRING)),
        )

        // Act
        await PublicFormController.handleGetPublicForm(
          MOCK_REQ,
          mockRes,
          jest.fn(),
        )

        // Assert
        // 1. Check args of mocked services
        expect(MockAuthService.getFormIfPublic).toHaveBeenCalledWith(
          MOCK_FORM_ID,
        )
        // 2. Check that error is correct
        expect(
          MockFormService.checkFormSubmissionLimitAndDeactivateForm,
        ).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(500)
        expect(mockRes.json).toHaveBeenCalledWith({
          message: MOCK_ERROR_STRING,
        })
      })

      it('should return 404 when the form is not found', async () => {
        // Arrange
        // 1. Mock the response
        const mockRes = expressHandler.mockResponse()
        const MOCK_ERROR_STRING = 'Your form was eaten up by a monster'

        // 2. Mock the call to retrieve the form
        MockAuthService.getFormIfPublic.mockReturnValueOnce(
          errAsync(new FormNotFoundError(MOCK_ERROR_STRING)),
        )

        // Act
        await PublicFormController.handleGetPublicForm(
          MOCK_REQ,
          mockRes,
          jest.fn(),
        )

        // Assert
        // 1. Check args of mocked services
        expect(MockAuthService.getFormIfPublic).toHaveBeenCalledWith(
          MOCK_FORM_ID,
        )
        // 2. Check that error is correct
        expect(
          MockFormService.checkFormSubmissionLimitAndDeactivateForm,
        ).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.json).toHaveBeenCalledWith({
          message: MOCK_ERROR_STRING,
        })
      })

      it('should return 404 when the form is private and not accessible by the public', async () => {
        // Arrange
        // 1. Mock the response
        const mockRes = expressHandler.mockResponse()
        const MOCK_FORM_TITLE = 'private form'

        // 2. Mock the call to retrieve the form
        MockAuthService.getFormIfPublic.mockReturnValueOnce(
          errAsync(new PrivateFormError(MOCK_ERROR_STRING, MOCK_FORM_TITLE)),
        )

        // Act
        await PublicFormController.handleGetPublicForm(
          MOCK_REQ,
          mockRes,
          jest.fn(),
        )

        // Assert
        // 1. Check args of mocked services
        expect(MockAuthService.getFormIfPublic).toHaveBeenCalledWith(
          MOCK_FORM_ID,
        )
        // 2. Check that error is correct
        expect(
          MockFormService.checkFormSubmissionLimitAndDeactivateForm,
        ).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(404)
        expect(mockRes.json).toHaveBeenCalledWith({
          message: MOCK_ERROR_STRING,
          formTitle: MOCK_FORM_TITLE,
          isPageFound: true,
        })
      })
    })

    describe('errors in form access', () => {
      it('should return 200 with isIntranetUser set to false when a user accesses a form from outside intranet', async () => {
        // Arrange
        const MOCK_NIL_AUTH_FORM = {
          ...BASE_FORM,
          authType: FormAuthType.NIL,
        } as unknown as IPopulatedForm
        const mockRes = expressHandler.mockResponse()

        MockAuthService.getFormIfPublic.mockReturnValueOnce(
          okAsync(MOCK_NIL_AUTH_FORM),
        )
        MockFormService.checkFormSubmissionLimitAndDeactivateForm.mockReturnValueOnce(
          okAsync(MOCK_NIL_AUTH_FORM),
        )
        MockFormService.checkIsIntranetFormAccess.mockReturnValueOnce(false)

        // Act
        await PublicFormController.handleGetPublicForm(
          MOCK_REQ,
          mockRes,
          jest.fn(),
        )

        // Assert
        expect(mockRes.json).toHaveBeenCalledWith({
          form: MOCK_NIL_AUTH_FORM.getPublicView(),
          isIntranetUser: false,
        })
      })
    })
  })

  describe('_handleFormAuthRedirect', () => {
    const MOCK_REQ = expressHandler.mockRequest({
      params: {
        formId: new ObjectId().toHexString(),
      },
      query: {
        isPersistentLogin: true,
      },
    })

    it('should return 400 when the form has authType NIL', async () => {
      // Arrange
      const MOCK_FORM = {
        authType: FormAuthType.NIL,
        esrvcId: '12345',
      } as IFormDocument

      const mockRes = expressHandler.mockResponse()
      MockFormService.retrieveFullFormById.mockReturnValueOnce(
        okAsync(MOCK_FORM),
      )

      // Act
      await PublicFormController._handleFormAuthRedirect(
        MOCK_REQ,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith({
        message:
          'Please ensure that the form has authentication enabled. Please refresh and try again.',
      })
    })

    it('should return 500 when the form could not be retrieved from the database', async () => {
      // Arrange

      const mockRes = expressHandler.mockResponse()
      MockFormService.retrieveFullFormById.mockReturnValueOnce(
        errAsync(new DatabaseError()),
      )

      // Act
      await PublicFormController._handleFormAuthRedirect(
        MOCK_REQ,
        mockRes,
        jest.fn(),
      )

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500)
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Sorry, something went wrong. Please try again.',
      })
    })
  })
})
