import { RouteStep, RouteStepCondition } from'../types'
import { get } from 'lodash'

export const isConditionRouteStep = (
  routeStep: RouteStep,
): routeStep is RouteStepCondition => !!get(routeStep, 'conditionStep')

export const isActionRouteStep = (
  routeStep: RouteStep,
): routeStep is RouteStepCondition => !!get(routeStep, 'actionStep')
