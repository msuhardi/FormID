import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { useGrowthBook } from '@growthbook/growthbook-react'

import {
  ADMINFORM_PREVIEW_ROUTE,
  ADMINFORM_RESULTS_SUBROUTE,
  ADMINFORM_ROUTE,
  ADMINFORM_ROUTING_ROUTE,
  ADMINFORM_SETTINGS_SUBROUTE,
  ADMINFORM_USETEMPLATE_ROUTE,
  DASHBOARD_ROUTE,
  LANDING_ROUTE,
  LOGIN_CALLBACK_ROUTE,
  LOGIN_ROUTE,
  PAYMENT_PAGE_SUBROUTE,
  PRIVACY_POLICY_ROUTE,
  PUBLICFORM_ROUTE,
  RESULTS_CHARTS_SUBROUTE,
  RESULTS_FEEDBACK_SUBROUTE,
  TOU_ROUTE,
  USE_TEMPLATE_REDIRECT_SUBROUTE,
} from '~constants/routes'
import { fillHeightCss } from '~utils/fillHeightCss'
import { lazyRetry } from '~utils/lazyRetry'

import NotFoundErrorPage from '~pages/NotFoundError'
import { AdminFormLayout } from '~features/admin-form/common/AdminFormLayout'
import { CreatePage } from '~features/admin-form/create/CreatePage'
import {
  FeedbackPage,
  FormResultsLayout,
  IndividualResponsePage,
  ResponsesLayout,
  ResponsesPage,
} from '~features/admin-form/responses'
import { ChartsPage } from '~features/admin-form/responses/ChartsPage/ChartsPage'
import { SettingsPage } from '~features/admin-form/settings/SettingsPage'
import { SettingsRoutingPage } from '~features/admin-form/settings/SettingsRoutingPage'
import { SelectProfilePage } from '~features/login'
import { FormPaymentPage } from '~features/public-form/components/FormPaymentPage/FormPaymentPage'

import { ParamIdValidator } from './ParamIdValidator'
import { PrivateElement } from './PrivateElement'
import { PublicElement } from './PublicElement'

const UseTemplateRedirectPage = lazy(() => import('~pages/UseTemplateRedirect'))
const PublicFormPage = lazy(() =>
  lazyRetry(() => import('~features/public-form/PublicFormPage')),
)
const WorkspacePage = lazy(() => lazyRetry(() => import('~features/workspace')))

const LoginPage = lazy(() => lazyRetry(() => import('~features/login')))
const PrivacyPolicyPage = lazy(() =>
  lazyRetry(() => import('~pages/PrivacyPolicy')),
)
const TermsOfUsePage = lazy(() => lazyRetry(() => import('~pages/TermsOfUse')))
const PreviewFormPage = lazy(() =>
  lazyRetry(() => import('~features/admin-form/preview')),
)
const TemplateFormPage = lazy(() =>
  lazyRetry(() => import('~features/admin-form/template')),
)

const WithSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Box bg="neutral.100" css={fillHeightCss} w="100vw" />}>
    {children}
  </Suspense>
)

export const AppRouter = (): JSX.Element => {
  const growthbook = useGrowthBook()
  useEffect(() => {
    if (growthbook) {
      // Load features from the GrowthBook API
      growthbook.loadFeatures()
    }
  }, [growthbook])

  return (
    <WithSuspense>
      <Routes>
        <Route
          path={LANDING_ROUTE}
          element={<PublicElement strict element={<LoginPage />} />}
        />
        <Route
          path={DASHBOARD_ROUTE}
          element={<PrivateElement element={<WorkspacePage />} />}
        />
        <Route
          path={LOGIN_ROUTE}
          element={<PublicElement strict element={<LoginPage />} />}
        />
        <Route
          path={LOGIN_CALLBACK_ROUTE}
          element={<PublicElement strict element={<SelectProfilePage />} />}
        />
        <Route
          path={PRIVACY_POLICY_ROUTE}
          element={<PublicElement element={<PrivacyPolicyPage />} />}
        />
        <Route
          path={TOU_ROUTE}
          element={<PublicElement element={<TermsOfUsePage />} />}
        />
        <Route path={PUBLICFORM_ROUTE}>
          <Route
            index
            element={
              <ParamIdValidator
                element={<PublicElement element={<PublicFormPage />} />}
              />
            }
          />
          <Route
            path={USE_TEMPLATE_REDIRECT_SUBROUTE}
            element={
              <ParamIdValidator
                element={
                  <PublicElement element={<UseTemplateRedirectPage />} />
                }
              />
            }
          />
          <Route
            path={PAYMENT_PAGE_SUBROUTE}
            element={
              <ParamIdValidator
                element={<PublicElement element={<FormPaymentPage />} />}
              />
            }
          />
        </Route>
        <Route
          path={`${ADMINFORM_ROUTE}/:formId`}
          element={
            <ParamIdValidator
              element={<PrivateElement element={<AdminFormLayout />} />}
            />
          }
        >
          <Route index element={<CreatePage />} />
          <Route path={ADMINFORM_SETTINGS_SUBROUTE} element={<SettingsPage />}>
            <Route path={':settingsTab'} element={<SettingsPage />} />
          </Route>
          <Route
            path={ADMINFORM_ROUTING_ROUTE}
            element={<SettingsRoutingPage />}
          ></Route>
          <Route
            path={ADMINFORM_RESULTS_SUBROUTE}
            element={<FormResultsLayout />}
          >
            <Route element={<ResponsesLayout />}>
              <Route index element={<ResponsesPage />} />
              <Route
                path=":submissionId"
                element={<IndividualResponsePage />}
              />
            </Route>
            <Route
              path={RESULTS_FEEDBACK_SUBROUTE}
              element={<FeedbackPage />}
            />
            <Route path={RESULTS_CHARTS_SUBROUTE} element={<ResponsesLayout />}>
              <Route index element={<ChartsPage />} />
            </Route>
          </Route>
        </Route>
        <Route
          path={`${ADMINFORM_ROUTE}/:formId/${ADMINFORM_PREVIEW_ROUTE}`}
          element={
            <ParamIdValidator
              element={<PrivateElement element={<PreviewFormPage />} />}
            />
          }
        />
        <Route
          path={`${ADMINFORM_ROUTE}/:formId/${ADMINFORM_USETEMPLATE_ROUTE}`}
          element={
            <ParamIdValidator
              element={<PrivateElement element={<TemplateFormPage />} />}
            />
          }
        />
        <Route path="*" element={<NotFoundErrorPage />} />
      </Routes>
    </WithSuspense>
  )
}
