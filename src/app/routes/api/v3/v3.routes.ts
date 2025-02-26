import { Router } from 'express'

import { AdminRouter } from './admin'
import { AnalyticsRouter } from './analytics'
import { AuthRouter } from './auth'
import { BillingsRouter } from './billings'
import { ClientRouter } from './client'
import { FeatureFlagsRouter } from './feature-flags'
import { PublicFormsRouter } from './forms'
import { IntranetRouter } from './intranet'
import { NotificationsRouter } from './notifications'
import { PaymentsRouter } from './payments'
import { UserRouter } from './user'

export const V3Router = Router()

V3Router.use('/admin', AdminRouter)
V3Router.use('/user', UserRouter)
V3Router.use('/auth', AuthRouter)
V3Router.use('/client', ClientRouter)
V3Router.use('/notifications', NotificationsRouter)
V3Router.use('/billings', BillingsRouter)
V3Router.use('/analytics', AnalyticsRouter)
V3Router.use('/forms', PublicFormsRouter)
V3Router.use('/payments', PaymentsRouter)
V3Router.use('/feature-flags', FeatureFlagsRouter)
V3Router.use('/intranet', IntranetRouter)
