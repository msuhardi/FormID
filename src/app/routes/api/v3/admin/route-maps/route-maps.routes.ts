import { Router } from 'express'

import * as RouteMapsController from '../../../../../modules/route-maps/route-maps.controller'

export const RouteMapsRouter = Router()

RouteMapsRouter.route('/incoming-email').post(
  RouteMapsController.handleIncomingEmail,
)
