import { Router } from 'express'

import { AdminFormsRouter } from './forms'
import { RouteMapsRouter } from './route-maps'
import { WorkspacesRouter } from './workspaces'

export const AdminRouter = Router()

AdminRouter.use('/forms', AdminFormsRouter)
AdminRouter.use('/workspaces', WorkspacesRouter)
AdminRouter.use('/route-maps', RouteMapsRouter)
