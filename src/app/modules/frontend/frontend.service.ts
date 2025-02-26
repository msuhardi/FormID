import { ClientEnvVars } from '../../../../shared/types/core'
import config from '../../config/config'
import { captchaConfig } from '../../config/features/captcha.config'
import { goGovConfig } from '../../config/features/gogov.config'
import { googleAnalyticsConfig } from '../../config/features/google-analytics.config'
import { growthbookConfig } from '../../config/features/growthbook.config'
import { paymentConfig } from '../../config/features/payment.config'
import { sentryConfig } from '../../config/features/sentry.config'
import { turnstileConfig } from '../../config/features/turnstile.config'

export const getClientEnvVars = (): ClientEnvVars => {
  return {
    isGeneralMaintenance: config.isGeneralMaintenance,
    isLoginBanner: config.isLoginBanner,
    siteBannerContent: config.siteBannerContent,
    adminBannerContent: config.adminBannerContent,
    logoBucketUrl: config.aws.logoBucketUrl, // S3 bucket
    formsgSdkMode: config.formsgSdkMode,
    captchaPublicKey: captchaConfig.captchaPublicKey, // Recaptcha
    turnstileSiteKey: turnstileConfig.turnstileSiteKey,
    sentryConfigUrl: sentryConfig.sentryConfigUrl, // Sentry.IO
    // TODO: remove after React rollout #4786
    GATrackingID: googleAnalyticsConfig.GATrackingID,
    stripePublishableKey: paymentConfig.stripePublishableKey,
    maxPaymentAmountCents: paymentConfig.maxPaymentAmountCents,
    minPaymentAmountCents: paymentConfig.minPaymentAmountCents,

    // TODO (#5826): Toggle to use fetch for submissions instead of axios. Remove once network error is resolved
    useFetchForSubmissions: config.reactMigration.useFetchForSubmissions,

    secretEnv: config.secretEnv, // Used for conditional rendering of payment copy

    goGovBaseUrl: goGovConfig.goGovBaseUrl, // Used for GoGov integration

    // Used for admin feedback in frontend
    adminFeedbackFieldThreshold: config.adminFeedbackFieldThreshold,
    adminFeedbackDisplayFrequency: config.adminFeedbackDisplayFrequency,

    growthbookClientKey: growthbookConfig.growthbookClientKey,
  }
}
