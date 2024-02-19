export enum RouteStepParentType {
  TRIGGER = 'trigger',
  APPROVAL = 'approval',
  REJECTION = 'rejection',
  CONDITION = 'condition',
}

interface RouteStepParentBase {
  type: RouteStepParentType
}
interface RouteStepParentTrigger extends RouteStepParentBase {
  type: RouteStepParentType.TRIGGER
}
interface RouteStepParentAction extends RouteStepParentBase {
  type: RouteStepParentType.APPROVAL | RouteStepParentType.REJECTION
}
interface RouteStepParentCondition extends RouteStepParentBase {
  type: RouteStepParentType.CONDITION
}
export type RouteStepParent =
  | RouteStepParentTrigger
  | RouteStepParentAction
  | RouteStepParentCondition

export type ActionStepCheckboxRouting = {
  question: string
  rules: { answer: string; emails: string[] }[]
}

export type RouteStepBase = {
  routeMap: FormRouteMap
}

export enum ActionStepType {
  APPROVAL = 'approval',
  TERMINATION = 'termination',
}

export enum ActionRoutingType {
  EMAILS = 'emails',
  EMAIL_FIELD = 'email_field',
}

export type ActionStep = {
  type: ActionStepType
  routingType: ActionRoutingType
  emails?: string[]
  emailField?: string
  checkboxField?: ActionStepCheckboxRouting
  approvalStep?: RouteStep
  rejectionStep?: RouteStep
}

export type ConditionStepRule = {
  conditionStep: string
  answer: string
  nextStep?: RouteStep
}

export type ConditionStep = {
  question: string
  rules: ConditionStepRule[]
}

export type RouteStepAction = RouteStepBase & {
  actionStep: ActionStep
}
export type RouteStepCondition = RouteStepBase & {
  conditionStep: ConditionStep
}

export type RouteStep = RouteStepAction | RouteStepCondition

export type FormRouteMap = {
  active: boolean
  respondentEmailField?: string
  trigger?: RouteStep
  emailSender?: string
  isDecisionPublic: boolean
}
